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
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
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
  // CREATE LEAD
  app.post("/api/leads", async (c) => {
    console.log("[LEADS POST] route hit");
    const body = await c.req.json<Partial<Lead>>();
    console.log("[LEADS POST] body received:", body);
    // ---- Validation ----
    const company = (body.company ?? "").trim();
    if (!company) return bad(c, "Firmenname erforderlich.");
    const contact = (body.contact ?? "").trim();
    if (!contact) return bad(c, "Ansprechpartner erforderlich.");
    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@") || !email.includes(".")) return bad(c, "Gültige E-Mail erforderlich.");
    const phone = (body.phone ?? "").trim();
    if (!phone) return bad(c, "Telefonnummer erforderlich.");
    if (body.consent !== true) return bad(c, "Consent must be true.");
    const firewall = (body.firewallProvider ?? "").trim();
    if (body.firewallProvider && !firewall) return bad(c, "Firewall-Anbieter ungültig.");
    const vpn = (body.vpnProvider ?? "").trim();
    if (body.vpnProvider && !vpn) return bad(c, "VPN-Anbieter ungültig.");
    const role = (body.role ?? "").trim();
    const notes = (body.notes ?? "").trim();
    const employeesRange = (body.employeesRange ?? "").trim() || "N/A";
    const scoreSummary = body.scoreSummary || { areaA: 0, areaB: 0, areaC: 0, average: 0 };
    scoreSummary.answers = body.scoreSummary?.answers || {};
    scoreSummary.rabattConsent = !!scoreSummary.rabattConsent;
    const newLead: Lead = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      company,
      contact,
      employeesRange,
      email,
      phone,
      role,
      notes,
      consent: body.consent,
      processed: false,
      firewallProvider: firewall,
      vpnProvider: vpn,
      scoreSummary,
    };
    let createdLead: Lead;
    try {
      createdLead = await LeadEntity.create(c.env, newLead);
      console.log("[LEADS POST] created:", createdLead.id);
      // Optional webhook notification
      const webhookUrl = "https://webhook.site/a7e7e1c3-a4e1-4b8a-8c3e-07a8b3d64d2c";
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createdLead),
      })
        .then(() => console.log("[LEADS WEBHOOK] sent for", createdLead.id))
        .catch((e) => console.error("[LEADS WEBHOOK] error", e));
    } catch (e) {
      console.error("[LEADS FAIL]", e);
      return bad(c, `Lead creation failed: ${(e as Error).message}`);
    }
    return ok(c, createdLead);
  });
  // LIST LEADS (paginated)
  app.get("/api/leads", async (c) => {
    console.log("[LEADS GET] route hit");
    try {
      await LeadEntity.ensureSeed(c.env);
    } catch (e) {
      console.error("[LEADS GET ensureSeed error]:", e);
      return bad(c, `Seed error: ${(e as Error).message}`);
    }
    const cursorParam = c.req.query("cursor") || null;
    const limitParam = c.req.query("limit");
    const limit = limitParam ? Math.max(1, Number(limitParam) || 25) : 25;
    // ---- Cursor validation ----
    if (cursorParam !== null) {
      if (
        !cursorParam.startsWith("i:") ||
        cursorParam.length !== 38 ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursorParam.slice(2))
      ) {
        console.log("[LEADS GET invalid cursor]:", cursorParam);
        return bad(c, "Invalid cursor format");
      }
    }
    console.log("[LEADS GET] cursor:", cursorParam, "limit:", limit);
    let page;
    try {
      page = await LeadEntity.list(c.env, cursorParam, limit);
      console.log("[LEADS GET] result count:", page.items.length);
    } catch (e) {
      console.error("[LEADS GET list error]:", e);
      return bad(c, `List error: ${(e as Error).message}`);
    }
    return ok(c, page);
  });
  // UPDATE LEAD (processed flag)
  app.patch("/api/leads/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<{ processed: boolean }>();
    const lead = new LeadEntity(c.env, id);
    if (!(await lead.exists())) {
      return notFound(c);
    }
    const { processed } = body;
    if (typeof processed !== "boolean") {
      return bad(c, "processed field must be a boolean");
    }
    await lead.patch({ processed });
    return ok(c, await lead.getState());
  });
  // DELETE LEAD
  app.delete("/api/leads/:id", async (c) => {
    const id = c.req.param("id");
    const deleted = await LeadEntity.delete(c.env, id);
    return ok(c, { deleted });
  });
}