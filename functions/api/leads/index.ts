import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Lead } from '../../../shared/types';
interface Env {
  Bindings: {
    KV_LEADS: KVNamespace;
  };
}
const app = new Hono<Env>();
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
  let body: Partial<Lead>;
  try {
    body = await c.req.json<Partial<Lead>>();
  } catch (e) {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }
  // Basic validation
  if (!body.company?.trim()) return c.json({ success: false, error: 'Firmenname erforderlich.' }, 400);
  if (!body.contact?.trim()) return c.json({ success: false, error: 'Ansprechpartner erforderlich.' }, 400);
  if (!body.email?.trim() || !body.email.includes('@')) return c.json({ success: false, error: 'Gültige E-Mail erforderlich.' }, 400);
  if (!body.phone?.trim()) return c.json({ success: false, error: 'Telefonnummer erforderlich.' }, 400);
  if (body.consent !== true) return c.json({ success: false, error: 'Consent must be true.' }, 400);
  const newLead: Lead = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    company: (body.company ?? '').trim(),
    contact: (body.contact ?? '').trim(),
    employeesRange: (body.employeesRange ?? '').trim() || 'N/A',
    email: (body.email ?? '').trim().toLowerCase(),
    phone: (body.phone ?? '').trim(),
    role: (body.role ?? '').trim(),
    notes: (body.notes ?? '').trim(),
    consent: body.consent,
    processed: false,
    firewallProvider: (body.firewallProvider ?? '').trim(),
    vpnProvider: (body.vpnProvider ?? '').trim(),
    scoreSummary: body.scoreSummary || { areaA: 0, areaB: 0, areaC: 0, average: 0 },
  };
  try {
    await c.env.KV_LEADS.put(`lead:${newLead.id}`, JSON.stringify(newLead));
    console.log('[KV-LEADS POST] created:', newLead.id);
    return c.json({ success: true, data: newLead });
  } catch (e) {
    console.error('[KV-LEADS FAIL]', e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return c.json({ success: false, error: `Lead creation failed: ${errorMessage}` }, 500);
  }
});
// LIST LEADS (paginated)
app.get('/', async (c) => {
  console.log('[KV-LEADS GET] route hit');
  const limit = parseInt(c.req.query('limit') || '10', 10);
  const cursor = c.req.query('cursor') || undefined;
  try {
    const listResult = await c.env.KV_LEADS.list({ prefix: 'lead:', limit, cursor });
    const keys = listResult.keys.map((key) => key.name);
    const kvPromises = keys.map((key) => c.env.KV_LEADS.get<Lead>(key, 'json'));
    const values = await Promise.all(kvPromises);
    const items = values.filter((value): value is Lead => value !== null).sort((a, b) => b.createdAt - a.createdAt);
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
    return c.json({ success: false, error: `List error: ${errorMessage}` }, 500);
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
    const body = await c.req.json<{ processed: boolean }>();
    if (typeof body.processed !== 'boolean') {
      return c.json({ success: false, error: 'processed field must be a boolean' }, 400);
    }
    const updatedLead: Lead = { ...existingLead, processed: body.processed };
    await c.env.KV_LEADS.put(key, JSON.stringify(updatedLead));
    return c.json({ success: true, data: updatedLead });
  } catch (e) {
    console.error(`[KV-LEADS PATCH /:id] error for id ${id}:`, e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return c.json({ success: false, error: `Update failed: ${errorMessage}` }, 500);
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
    return c.json({ success: false, error: `Delete failed: ${errorMessage}` }, 500);
  }
});
export const onRequest = app.fetch;