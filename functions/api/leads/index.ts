import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { Lead } from '../../../shared/types';

interface Env {
  Bindings: {
    KV_LEADS: KVNamespace;
  };
}

const app = new Hono<Env>();

// ---------------------------------------------------------------------------
// Validation schemas (Zod)
// ---------------------------------------------------------------------------

// Schema for POST / (lead creation)
const LeadPostSchema = z.object({
  company: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string().min(1, 'Firmenname ist ein Pflichtfeld.')
  ),
  contact: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string().min(1, 'Ansprechpartner ist ein Pflichtfeld.')
  ),
  employeesRange: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string().min(1, 'Mitarbeiterzahl ist erforderlich.')
  ),
  phone: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string().min(1, 'Telefonnummer ist ein Pflichtfeld.')
  ),
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.toLowerCase().trim() : ''),
    z.string().email('Gültige E-Mail-Adresse erforderlich.')
  ),
  role: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string()
  ).optional(),
  notes: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string()
  ).optional(),
  firewallProvider: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string()
  ).optional(),
  vpnProvider: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : ''),
    z.string()
  ).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Kontaktaufnahme muss zugestimmt werden.' })
  }),
  scoreSummary: z
    .object({
      areaA: z.number().min(0).max(100),
      areaB: z.number().min(0).max(100),
      areaC: z.number().min(0).max(100),
      average: z.number().min(0).max(100),
      answers: z.record(z.string()).optional(),
      rabattConsent: z.boolean().optional(),
    })
    .optional(),
}).strict();

// Schema for PATCH /:id (processed flag update)
const PatchSchema = z.object({
  processed: z.boolean(),
});

app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type'],
  })
);

// CREATE LEAD
app.post('/', async (c) => {
  console.log('[KV-LEADS POST] route hit');

  // Parse raw JSON body
  const rawBody = await c.req.text();
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  // Validate with Zod schema
  const parseResult = LeadPostSchema.safeParse(parsedBody);
  if (!parseResult.success) {
    const errMsg = parseResult.error.errors[0]?.message ?? 'Validation failed';
    return c.json({ success: false, error: errMsg }, 400);
  }
  const body = parseResult.data;

  // Build Lead object – Zod already performed trimming/normalisation
  const newLead: Lead = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    company: body.company,
    contact: body.contact,
    employeesRange: body.employeesRange ?? 'N/A',
    email: body.email,
    phone: body.phone,
    role: body.role ?? '',
    notes: body.notes ?? '',
    consent: body.consent,
    processed: false,
    firewallProvider: body.firewallProvider ?? '',
    vpnProvider: body.vpnProvider ?? '',
    scoreSummary:
      body.scoreSummary || { areaA: 0, areaB: 0, areaC: 0, average: 0 },
  };

  try {
    await c.env.KV_LEADS.put(`lead:${newLead.id}`, JSON.stringify(newLead));
    console.log('[KV-LEADS POST] created:', newLead.id);
    return c.json({ success: true, data: newLead });
  } catch (e) {
    console.error('[KV-LEADS FAIL]', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return c.json(
      { success: false, error: `Lead creation failed: ${errorMessage}` },
      500
    );
  }
});

// LIST LEADS (paginated)
app.get('/', async (c) => {
  console.log('[KV-LEADS GET] route hit');
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const cursor = c.req.query('cursor') || undefined;
  try {
    const listResult = await c.env.KV_LEADS.list({
      prefix: 'lead:',
      limit,
      cursor,
    });
    const keys = listResult.keys.map((key) => key.name);
    const kvPromises = keys.map((key) => c.env.KV_LEADS.get<Lead>(key, 'json'));
    const values = await Promise.all(kvPromises);
    const items = values
      .filter((value): value is Lead => value !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
    console.log('[KV-LEADS GET] result count:', items.length);
    return c.json({
      success: true,
      data: {
        items,
        next: listResult.list_complete ? null : listResult.cursor,
      },
    });
  } catch (e) {
    console.error('[KV-LEADS GET list error]:', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return c.json(
      { success: false, error: `List error: ${errorMessage}` },
      500
    );
  }
});

// UPDATE LEAD (processed flag)
app.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const key = `lead:${id}`;
  try {
    const existingLead = await c.env.KV_LEADS.get<Lead>(key, 'json');
    if (!existingLead) {
      return c.json({ success: false, error: 'Not Found' }, 404);
    }

    // Parse raw JSON body
    const rawPatch = await c.req.text();
    let parsedPatch: unknown;
    try {
      parsedPatch = JSON.parse(rawPatch);
    } catch {
      return c.json({ success: false, error: 'Invalid JSON body' }, 400);
    }

    const patchResult = PatchSchema.safeParse(parsedPatch);
    if (!patchResult.success) {
      const errMsg =
        patchResult.error.errors[0]?.message ?? 'Validation failed';
      return c.json({ success: false, error: errMsg }, 400);
    }

    const { processed } = patchResult.data;
    const updatedLead: Lead = { ...existingLead, processed };
    await c.env.KV_LEADS.put(key, JSON.stringify(updatedLead));
    return c.json({ success: true, data: updatedLead });
  } catch (e) {
    console.error(`[KV-LEADS PATCH /:id] error for id ${id}:`, e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return c.json(
      { success: false, error: `Update failed: ${errorMessage}` },
      500
    );
  }
});

// DELETE LEAD
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const key = `lead:${id}`;
  try {
    await c.env.KV_LEADS.delete(key);
    return c.json({ success: true, data: { deleted: true } });
  } catch (e) {
    console.error(`[KV-LEADS DELETE /:id] error for id ${id}:`, e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return c.json(
      { success: false, error: `Delete failed: ${errorMessage}` },
      500
    );
  }
});

export const onRequest = app.fetch;
//