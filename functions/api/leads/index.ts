import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { Lead } from '../../../shared/types';
// Define the environment interface for Pages Functions
interface Env {
  LEADS_KV: KVNamespace;
}
// Define a minimal context for Hono to work with Pages Functions
type HonoContext = {
  Bindings: Env;
};
const app = new Hono<HonoContext>();
// Apply CORS middleware to all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
// Zod schema for basic lead validation on creation
const createLeadSchema = z.object({
  company: z.string().trim().min(1),
  contact: z.string().trim().min(1),
  employeesRange: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  consent: z.literal(true),
  scoreSummary: z.object({
    areaA: z.number(),
    areaB: z.number(),
    areaC: z.number(),
    average: z.number(),
    rabattConsent: z.boolean().optional(),
    answers: z.record(z.string()).optional(),
  }),
  role: z.string().optional(),
  notes: z.string().optional(),
  firewallProvider: z.string().optional(),
  vpnProvider: z.string().optional(),
});
// Helper for successful JSON responses
const ok = <T>(data: T) => new Response(JSON.stringify({ success: true, data }), {
  headers: { 'Content-Type': 'application/json' },
});
// Helper for error JSON responses
const bad = (error: string, status = 400) => new Response(JSON.stringify({ success: false, error }), {
  status,
  headers: { 'Content-Type': 'application/json' },
});
// POST /api/leads - Create a new lead
app.post('/', async (c) => {
  console.log('[PAGES FUNCTIONS LEADS POST]');
  try {
    const body = await c.req.json();
    const validation = createLeadSchema.safeParse(body);
    if (!validation.success) {
      return bad(`Invalid lead data: ${validation.error.flatten().fieldErrors}`, 400);
    }
    const newLead: Lead = {
      ...validation.data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      processed: false,
    };
    await c.env.LEADS_KV.put(`lead:${newLead.id}`, JSON.stringify(newLead));
    return ok(newLead);
  } catch (e: any) {
    console.error('[LEADS POST ERROR]', e.message);
    return bad('Failed to create lead', 500);
  }
});
// GET /api/leads - List leads with pagination
app.get('/', async (c) => {
  console.log('[PAGES FUNCTIONS LEADS GET]');
  try {
    const limit = parseInt(c.req.query('limit') || '10', 10);
    const cursor = c.req.query('cursor');
    const listResult = await c.env.LEADS_KV.list({
      prefix: 'lead:',
      limit,
      cursor,
    });
    const leadPromises = listResult.keys.map(key => c.env.LEADS_KV.get<Lead>(key.name, 'json'));
    const leads = (await Promise.all(leadPromises)).filter((lead): lead is Lead => lead !== null);
    // Sort by creation date descending, as KV list is lexicographical
    const sortedLeads = leads.sort((a, b) => b.createdAt - a.createdAt);
    return ok({
      items: sortedLeads,
      next: listResult.list_complete ? null : listResult.cursor,
    });
  } catch (e: any) {
    console.error('[LEADS GET ERROR]', e.message);
    return bad('Failed to fetch leads', 500);
  }
});
// PATCH /api/leads/:id - Update a lead (e.g., mark as processed)
app.patch('/:id', async (c) => {
  const id = c.req.param('id');
  console.log(`[PAGES FUNCTIONS LEADS PATCH] ID: ${id}`);
  try {
    const { processed } = await c.req.json<{ processed?: boolean }>();
    if (typeof processed !== 'boolean') {
      return bad('Invalid "processed" field', 400);
    }
    const key = `lead:${id}`;
    const existingLead = await c.env.LEADS_KV.get<Lead>(key, 'json');
    if (!existingLead) {
      return bad('Lead not found', 404);
    }
    const updatedLead: Lead = { ...existingLead, processed };
    await c.env.LEADS_KV.put(key, JSON.stringify(updatedLead));
    return ok(updatedLead);
  } catch (e: any) {
    console.error(`[LEADS PATCH ERROR] ID: ${id}`, e.message);
    return bad('Failed to update lead', 500);
  }
});
// DELETE /api/leads/:id - Delete a lead
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  console.log(`[PAGES FUNCTIONS LEADS DELETE] ID: ${id}`);
  try {
    const key = `lead:${id}`;
    await c.env.LEADS_KV.delete(key);
    return ok({ deleted: true });
  } catch (e: any) {
    console.error(`[LEADS DELETE ERROR] ID: ${id}`, e.message);
    return bad('Failed to delete lead', 500);
  }
});
// The `onRequest` handler is the entry point for Pages Functions.
export const onRequest: PagesFunction<Env> = async (context) => {
  return app.fetch(context.request, context.env, context);
};