import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, LeadEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Lead } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  // LEADS
  app.post('/api/leads', async (c) => {
    const body = await c.req.json<Partial<Lead>>();
    if (!isStr(body.company) || !isStr(body.contact) || !isStr(body.email) || !isStr(body.phone) || body.consent !== true) {
      return bad(c, 'Missing required lead fields.');
    }
    const newLead: Lead = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      company: body.company,
      contact: body.contact,
      employeesRange: body.employeesRange || 'N/A',
      email: body.email,
      phone: body.phone,
      role: body.role,
      notes: body.notes,
      consent: body.consent,
      scoreSummary: body.scoreSummary || { areaA: 0, areaB: 0, areaC: 0, average: 0 },
    };
    const createdLead = await LeadEntity.create(c.env, newLead);
    // Mock webhook/email simulation for Phase 2
    const webhookUrl = 'https://webhook.site/a7e7e1c3-a4e1-4b8a-8c3e-07a8b3d64d2c'; // Replace with actual CRM webhook URL
    
    // Fire-and-forget webhook request (no waitUntil, as executionCtx is unavailable)
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createdLead),
    })
      .then(() => console.log(`[CRM WEBHOOK] Lead ${createdLead.id} forwarded successfully.`))
      .catch(e => console.error('[CRM WEBHOOK ERROR]', e));

    return ok(c, createdLead);
  });
  app.get('/api/leads', async (c) => {
    await LeadEntity.ensureSeed(c.env); // Ensures index exists, no-op if data present
    const cursor = c.req.query('cursor');
    // Ensure a valid numeric limit; fallback to 1 if parsing fails (similar to other list endpoints)
    const limit = c.req.query('limit')
      ? Math.max(1, (Number(c.req.query('limit')) | 0))
      : 25;
```
    const page = await LeadEntity.list(c.env, cursor ?? null, limit);
    return ok(c, page);
  });
  // DELETE: Users
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/users/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await UserEntity.deleteMany(c.env, list), ids: list });
  });
  // DELETE: Chats
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/chats/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await ChatBoardEntity.deleteMany(c.env, list), ids: list });
  });
}