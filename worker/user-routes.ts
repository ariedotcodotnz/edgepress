import { Hono } from "hono";
import type { Env } from './core-utils';
import { PressReleaseEntity, StaticPageEntity, AdminUserEntity, ContactSubmissionEntity, AnalyticsEventEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { PressRelease, StaticPage, AdminUser, ContactSubmission, AnalyticsEvent, AnalyticsSummary, PressReleaseWithViews } from "@shared/types";
import { formatISO, subDays, eachDayOfInterval, format } from "date-fns";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PRESS RELEASES
  app.get('/api/press-releases', async (c) => {
    const status = c.req.query('status');
    await PressReleaseEntity.ensureSeed(c.env);
    const { items } = await PressReleaseEntity.list(c.env);
    let filtered = items;
    if (status) {
        if (status === 'Published') {
            const now = new Date();
            filtered = items.filter(pr => pr.status === 'Published' && new Date(pr.publishAt) <= now);
        } else {
            filtered = items.filter(pr => pr.status === status);
        }
    }
    filtered.sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());
    return ok(c, filtered);
  });
  app.get('/api/press-releases/slug/:slug', async (c) => {
    const slug = c.req.param('slug');
    const { items } = await PressReleaseEntity.list(c.env);
    const release = items.find(pr => pr.slug === slug && pr.status === 'Published' && new Date(pr.publishAt) <= new Date());
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
      contact: body.contact || { id: 'contact-1', name: 'Jane Doe', title: 'Head of Communications', email: 'media@example.com' },
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
  app.get('/api/press-releases/:id/generate-email', async (c) => {
    const id = c.req.param('id');
    const releaseEntity = new PressReleaseEntity(c.env, id);
    if (!await releaseEntity.exists()) return notFound(c, 'Press release not found');
    const release = await releaseEntity.getState();
    const publicUrl = `${new URL(c.req.url).origin}/press/${release.slug}`;
    const subject = `[Press Release] ${release.title}`;
    const htmlBody = `
        <p>Hi,</p>
        <p>${release.summary}</p>
        <p>Read the full press release here: <a href="${publicUrl}">${publicUrl}</a></p>
        <br/>
        <p>---</p>
        <p><strong>About EdgePress</strong></p>
        <p>EdgePress is the leading provider of next-generation, serverless content management solutions. Our mission is to empower creators and businesses to deliver content faster and more securely than ever before, leveraging the power of the global Cloudflare network.</p>
        <p><strong>Media Contact:</strong><br/>
        ${release.contact.name}<br/>
        ${release.contact.email}
        </p>
    `.replace(/\n\s+/g, '\n').trim();
    const plainTextBody = `
        Hi,
        ${release.summary}
        Read the full press release here: ${publicUrl}
        ---
        About EdgePress
        EdgePress is the leading provider of next-generation, serverless content management solutions. Our mission is to empower creators and businesses to deliver content faster and more securely than ever before, leveraging the power of the global Cloudflare network.
        Media Contact:
        ${release.contact.name}
        ${release.contact.email}
    `.replace(/\n\s+/g, '\n').trim();
    return ok(c, { subject, htmlBody, plainTextBody });
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
  // ANALYTICS
  app.post('/api/analytics/track', async (c) => {
    const body = await c.req.json<{ type: 'pageview'; pressReleaseId: string }>();
    if (body.type !== 'pageview' || !body.pressReleaseId) {
      return bad(c, 'Invalid tracking event');
    }
    const newEvent: AnalyticsEvent = {
      id: crypto.randomUUID(),
      type: 'pageview',
      pressReleaseId: body.pressReleaseId,
      timestamp: formatISO(new Date()),
    };
    await AnalyticsEventEntity.create(c.env, newEvent);
    return ok(c, { success: true });
  });
  app.get('/api/analytics/summary', async (c) => {
    const { items: allReleases } = await PressReleaseEntity.list(c.env);
    const { items: allEvents } = await AnalyticsEventEntity.list(c.env);
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);
    const viewsLast7Days = allEvents.filter(e => new Date(e.timestamp) >= sevenDaysAgo).length;
    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
    const viewsByDay = dateRange.map(date => ({
        date: format(date, 'MMM d'),
        views: allEvents.filter(e => format(new Date(e.timestamp), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).length
    }));
    const summary: AnalyticsSummary = {
      total: allReleases.length,
      published: allReleases.filter(pr => pr.status === 'Published').length,
      drafts: allReleases.filter(pr => pr.status === 'Draft').length,
      scheduled: allReleases.filter(pr => pr.status === 'Scheduled').length,
      viewsLast7Days,
      viewsLast30DaysChart: viewsByDay,
    };
    return ok(c, summary);
  });
  app.get('/api/analytics/press-releases', async (c) => {
    const { items: allReleases } = await PressReleaseEntity.list(c.env);
    const { items: allEvents } = await AnalyticsEventEntity.list(c.env);
    const viewCounts = allEvents.reduce((acc, event) => {
        acc[event.pressReleaseId] = (acc[event.pressReleaseId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const releasesWithViews: PressReleaseWithViews[] = allReleases.map(pr => ({
        ...pr,
        views: viewCounts[pr.id] || 0,
    }));
    releasesWithViews.sort((a, b) => b.views - a.views);
    return ok(c, releasesWithViews);
  });
}