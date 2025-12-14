import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, LeadEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { cors } from 'hono/cors';
import type { Lead } from "@shared/types";

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.use('/api/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type'],
  }));
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' } }));
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
    console.log('[LEADS POST] body received:', body);
    // ---- Validation ----
    const companyTrim = (body.company ?? '').trim();
    if (!companyTrim) return bad(c, 'Firmenname erforderlich.');
    const contactTrim = (body.contact ?? '').trim();
    if (!contactTrim) return bad(c, 'Ansprechpartner erforderlich.');
    const emailTrim = (body.email ?? '').trim().toLowerCase();
    if (!emailTrim || !emailTrim.includes('@') || !emailTrim.includes('.')) return bad(c, 'Gültige E-Mail erforderlich.');
    const phoneTrim = (body.phone ?? '').trim();
    if (!phoneTrim) return bad(c, 'Telefonnummer erforderlich.');
    if (body.consent !== true) return bad(c, 'Consent must be true.');
    const firewallTrim = (body.firewallProvider ?? '').trim();
    if (body.firewallProvider && !firewallTrim) return bad(c, 'Firewall-Anbieter ungültig.');
    const vpnTrim = (body.vpnProvider ?? '').trim();
    if (body.vpnProvider && !vpnTrim) return bad(c, 'VPN-Anbieter ungültig.');
    const roleTrim = (body.role ?? '').trim();
    const notesTrim = (body.notes ?? '').trim();
    const employeesRangeTrim = (body.employeesRange ?? '').trim() || 'N/A';
    const scoreSummary = body.scoreSummary || { areaA: 0, areaB: 0, areaC: 0, average: 0 };
    // Preserve any existing answers object; default to empty object if absent
    scoreSummary.answers = body.scoreSummary?.answers || {};
    scoreSummary.rabattConsent = !!scoreSummary.rabattConsent;
    const newLead: Lead = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      company: companyTrim,
      contact: contactTrim,
      employeesRange: employeesRangeTrim,
      email: emailTrim,
      phone: phoneTrim,
      role: roleTrim,
      notes: notesTrim,
      consent: body.consent,
      processed: false,
      firewallProvider: firewallTrim,
      vpnProvider: vpnTrim,
      scoreSummary: scoreSummary,
    };
    console.log('[LEADS ANSWERS]', JSON.stringify(newLead.scoreSummary.answers || {}));
    // ---- Lead creation & CRM webhook ----
    let createdLead: Lead;
    try {
      createdLead = await LeadEntity.create(c.env, newLead);
      console.log('[LEADS CREATE] success:', createdLead.id);
      const webhookUrl = 'https://webhook.site/a7e7e1c3-a4e1-4b8a-8c3e-07a8b3d64d2c'; // Replace with actual CRM webhook URL
       // Fire-and-forget webhook request
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdLead),
      })
        .then(() => console.log('[LEADS WEBHOOK] sent for', createdLead.id))
        .catch(e => console.error('[LEADS WEBHOOK] error', e));
    } catch (e) {
      console.error('[LEADS FAIL]', e);
      return bad(c, `Lead creation failed: ${(e as Error).message}`);
    }
    return ok(c, createdLead);
  });
  app.get('/api/leads', async (c) => {
    await LeadEntity.ensureSeed(c.env); // Ensures index exists, no-op if data present
    const cursorParam = c.req.query('cursor') || null;
    const limit = c.req.query('limit') ? Math.max(1, (Number(c.req.query('limit')) | 0)) : 25;
    const page = await LeadEntity.list(c.env, cursorParam, limit);
    return ok(c, page);
  });
  app.patch('/api/leads/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{ processed: boolean }>();
    const lead = new LeadEntity(c.env, id);
    if (!(await lead.exists())) {
      return notFound(c);
    }
    const { processed } = body;
    if (typeof processed !== 'boolean') {
      return bad(c, 'processed field must be a boolean');
    }
    await lead.patch({ processed });
    return ok(c, await lead.getState());
  });
  app.delete('/api/leads/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await LeadEntity.delete(c.env, id);
    return ok(c, { deleted });
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