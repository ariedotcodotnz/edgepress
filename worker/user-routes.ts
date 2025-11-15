import { Hono } from "hono";
import type { Env } from './core-utils';
import { PressReleaseEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { PressRelease } from "@shared/types";
import { formatISO } from "date-fns";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PRESS RELEASES
  app.get('/api/press-releases', async (c) => {
    const status = c.req.query('status');
    const { items } = await PressReleaseEntity.list(c.env);
    const filtered = status ? items.filter(pr => pr.status === status) : items;
    // Sort by publish date, newest first
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
}