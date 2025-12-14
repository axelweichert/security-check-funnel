import { Hono } from "hono";
import type { Env } from "./core-utils";
import { UserEntity, ChatBoardEntity, LeadEntity } from "./entities";
import { ok, bad, notFound, isStr } from "./core-utils";
import { cors } from "hono/cors";
import type { Lead } from "@shared/types";

/**
 * Register API routes.
 * All routes are prefixed with /api/* and share a permissive CORS policy.
 */
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Global CORS for all API endpoints
  app.use(
    "/api/*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "DELETE", "OPTIONS", "PATCH"],
      allowHeaders: ["Content-Type"],
    })
  );

  // ---------------------------------------------------------------------------
  // Demo test endpoint
  // ---------------------------------------------------------------------------
  app.get("/api/test", (c) => c.json({ success: true, data: { name: "CF Workers Demo" } }));

  // ---------------------------------------------------------------------------
  // USER ENDPOINTS
  // ---------------------------------------------------------------------------
  app.get("/api/users", async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cursor = c.req.query("cursor");
    const limit = c.req.query("limit");
    const page = await UserEntity.list(
      c.env,
      cursor ?? null,
      limit ? Math.max(1, Number(limit) | 0) : undefined
    );
    return ok(c, page);
  });

  app.post("/api/users", async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, "name required");
    const created = await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() });
    return ok(c, created);
  });

  app.delete("/api/users/:id", async (c) => {
    const id = c.req.param("id");
    const deleted = await UserEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });

  app.post("/api/users/deleteMany", async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, "ids required");
    const deletedCount = await UserEntity.deleteMany(c.env, list);
    return ok(c, { deletedCount, ids: list });
  });

  // ---------------------------------------------------------------------------
  // CHAT ENDPOINTS
  // ---------------------------------------------------------------------------
  app.get("/api/chats", async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cursor = c.req.query("cursor");
    const limit = c.req.query("limit");
    const page = await ChatBoardEntity.list(
      c.env,
      cursor ?? null,
      limit ? Math.max(1, Number(limit) | 0) : undefined
    );
    return ok(c, page);
  });

  app.post("/api/chats", async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, "title required");
    const created = await ChatBoardEntity.create(c.env, {
      id: crypto.randomUUID(),
      title: title.trim(),
      messages: [],
    });
    return ok(c, { id: created.id, title: created.title });
  });

  app.get("/api/chats/:chatId/messages", async (c) => {
    const chatId = c.req.param("chatId");
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!(await chat.exists())) return notFound(c, "chat not found");
    return ok(c, await chat.listMessages());
  });

  app.post("/api/chats/:chatId/messages", async (c) => {
    const chatId = c.req.param("chatId");
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, "userId and text required");
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!(await chat.exists())) return notFound(c, "chat not found");
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });

  app.delete("/api/chats/:id", async (c) => {
    const id = c.req.param("id");
    const deleted = await ChatBoardEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });

  app.post("/api/chats/deleteMany", async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, "ids required");
    const deletedCount = await ChatBoardEntity.deleteMany(c.env, list);
    return ok(c, { deletedCount, ids: list });
  });

  // ---------------------------------------------------------------------------
  // LEAD ENDPOINTS
  // ---------------------------------------------------------------------------
  // Create a new lead
  app.post("/api/leads", async (c) => {
    const body = (await c.req.json()) as Partial<Lead>;
    const { company, contact, employeesRange, phone, email, consent } = body;

    // Validate required fields
    if (
      !company?.trim() ||
      !contact?.trim() ||
      !employeesRange?.trim() ||
      !phone?.trim() ||
      !email?.trim() ||
      consent !== true
    ) {
      return bad(c, "invalid lead data");
    }

    const newLead: Lead = {
      ...(body as Lead),
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      processed: false,
      company: company.trim(),
      contact: contact.trim(),
      employeesRange: employeesRange.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      consent: true,
      scoreSummary:
        body.scoreSummary ?? LeadEntity.initialState?.scoreSummary ?? "",
    };

    const created = await LeadEntity.create(c.env, newLead);
    return ok(c, created);
  });

  // List leads with pagination, newest first
  app.get("/api/leads", async (c) => {
    await LeadEntity.ensureSeed(c.env);
    const cursor = c.req.query("cursor");
    const limit = c.req.query("limit");
    const page = await LeadEntity.list(
      c.env,
      cursor ?? null,
      limit ? Math.max(1, Number(limit) | 0) : undefined
    );

    const sortedItems = (page.items ?? []).slice().sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );

    return ok(c, { items: sortedItems, next: page.next });
  });

  // Update a lead (e.g., mark as processed)
  app.patch("/api/leads/:id", async (c) => {
    const id = c.req.param("id");
    const { processed } = (await c.req.json()) as { processed?: boolean };
    const lead = new LeadEntity(c.env, id);
    if (!(await lead.exists())) return notFound(c, "Lead not found");
    await lead.mutate((s) => ({ ...s, processed }));
    return ok(c, await lead.getState());
  });

  // Delete a lead
  app.delete("/api/leads/:id", async (c) => {
    const id = c.req.param("id");
    const deleted = await LeadEntity.delete(c.env, id);
    return ok(c, { deleted });
  });
}
//