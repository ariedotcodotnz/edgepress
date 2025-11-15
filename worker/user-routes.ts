import { Hono } from "hono";
import type { Env } from './core-utils';
import { PressReleaseEntity, StaticPageEntity, AdminUserEntity, ContactSubmissionEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { PressRelease, StaticPage, AdminUser, ContactSubmission } from "@shared/types";
import { formatISO } from "date-fns";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PRESS RELEASES
  app.get('/api/press-releases', async (c) => {
    const status = c.req.query('status');
    await PressReleaseEntity.ensureSeed(c.env);
    const { items } = await PressReleaseEntity.list(c.env);
    const filtered = status ? items.filter(pr => pr.status === status) : items;
    filtered.sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());
    return ok(c, filtered);
  });
  app.get('/api/press-releases/slug/:slug', async (c) => {
    const slug = c.req.param('slug');
    const { items } = await PressReleaseEntity.list(c.env);
    const release = items.find(pr => pr.slug === slug);
    if (!release) return notFound(c, 'Press release not found');
    return ok(c, release);
  });
  app.get('/api/press-releases/:id', async (c) => {
    const id = c.req.param('id');
    const release = new PressReleaseEntity(c.env, id);
    if (!await release.exists()) return notFound(c, 'Press release not found');
    return ok(c, await release.getState());
  });
  app.post('/api/press-releases', async (c) => {
    const body = await c.req.json<Partial<PressRelease>>();
    if (!body.title || !body.slug) return bad(c, 'Title and slug are required');
    const newRelease: PressRelease = {
      id: crypto.randomUUID(),
      createdAt: formatISO(new Date()),
      updatedAt: formatISO(new Date()),
      publishAt: body.publishAt || formatISO(new Date()),
      status: body.status || 'Draft',
      tags: body.tags || [],
      attachments: body.attachments || [],
      contact: body.contact || { id: '', name: '', title: '', email: '' },
      ...body,
      title: body.title,
      slug: body.slug,
      summary: body.summary || '',
      content: body.content || '',
    };
    const created = await PressReleaseEntity.create(c.env, newRelease);
    return ok(c, created);
  });
  app.put('/api/press-releases/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<PressRelease>>();
    const releaseEntity = new PressReleaseEntity(c.env, id);
    if (!await releaseEntity.exists()) return notFound(c, 'Press release not found');
    await releaseEntity.patch({ ...body, updatedAt: formatISO(new Date()) });
    return ok(c, await releaseEntity.getState());
  });
  app.delete('/api/press-releases/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await PressReleaseEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // STATIC PAGES
  app.get('/api/pages', async (c) => {
    await StaticPageEntity.ensureSeed(c.env);
    const { items } = await StaticPageEntity.list(c.env);
    return ok(c, items);
  });
  app.get('/api/pages/:id', async (c) => {
    const id = c.req.param('id');
    const page = new StaticPageEntity(c.env, id);
    if (!await page.exists()) return notFound(c, 'Page not found');
    return ok(c, await page.getState());
  });
  app.put('/api/pages/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<StaticPage>>();
    const pageEntity = new StaticPageEntity(c.env, id);
    if (!await pageEntity.exists()) return notFound(c, 'Page not found');
    await pageEntity.patch({ ...body, updatedAt: formatISO(new Date()) });
    return ok(c, await pageEntity.getState());
  });
  // ADMIN USERS
  app.get('/api/users', async (c) => {
    const { items } = await AdminUserEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/users', async (c) => {
    const body = await c.req.json<{ name: string; email: string }>();
    if (!body.name || !body.email) return bad(c, 'Name and email are required');
    const newUser: AdminUser = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      role: 'Editor',
      createdAt: formatISO(new Date()),
    };
    const created = await AdminUserEntity.create(c.env, newUser);
    return ok(c, created);
  });
  app.delete('/api/users/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await AdminUserEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // CONTACT SUBMISSIONS
  app.post('/api/contact-submissions', async (c) => {
    const body = await c.req.json<Omit<ContactSubmission, 'id' | 'submittedAt'>>();
    if (!body.name || !body.email || !body.message || !body.outlet) {
        return bad(c, 'All fields are required');
    }
    const newSubmission: ContactSubmission = {
        id: crypto.randomUUID(),
        submittedAt: formatISO(new Date()),
        ...body,
    };
    const created = await ContactSubmissionEntity.create(c.env, newSubmission);
    return ok(c, created);
  });
}