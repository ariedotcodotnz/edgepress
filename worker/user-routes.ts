import { Hono } from "hono";
import type { Env } from './core-utils';
import { PressReleaseEntity, StaticPageEntity, AdminUserEntity, ContactSubmissionEntity, AnalyticsEventEntity, PRContactEntity, MediaAssetEntity, MediaAssetCategoryEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { PressRelease, StaticPage, AdminUser, ContactSubmission, AnalyticsEvent, AnalyticsSummary, PressReleaseWithViews, PRContact, MediaAsset, PressReleaseAnalyticsData, MediaAssetCategory } from "@shared/types";
import { formatISO, subDays, eachDayOfInterval, format } from "date-fns";
import { analyticsMiddleware } from "./middleware";
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
    const isPreview = c.req.query('preview') === 'true';
    const { items } = await PressReleaseEntity.list(c.env);
    const release = items.find(pr => {
        if (pr.slug !== slug) return false;
        if (isPreview) return true; // In preview mode, return any status
        // In normal mode, only return published and past posts
        return pr.status === 'Published' && new Date(pr.publishAt) <= new Date();
    });
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
  app.get('/api/contact-submissions', async (c) => {
    const { items } = await ContactSubmissionEntity.list(c.env);
    items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return ok(c, items);
  });
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
  // PR CONTACTS
  app.get('/api/pr-contacts', async (c) => {
    await PRContactEntity.ensureSeed(c.env);
    const { items } = await PRContactEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/pr-contacts', async (c) => {
    const body = await c.req.json<Omit<PRContact, 'id'>>();
    if (!body.name || !body.email || !body.title) return bad(c, 'Name, email, and title are required');
    const newContact: PRContact = { id: crypto.randomUUID(), ...body };
    const created = await PRContactEntity.create(c.env, newContact);
    return ok(c, created);
  });
  app.put('/api/pr-contacts/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<PRContact>>();
    const entity = new PRContactEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    await entity.patch(body);
    return ok(c, await entity.getState());
  });
  app.delete('/api/pr-contacts/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await PRContactEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // MEDIA ASSET CATEGORIES
  app.get('/api/media-asset-categories', async (c) => {
    await MediaAssetCategoryEntity.ensureSeed(c.env);
    const { items } = await MediaAssetCategoryEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/media-asset-categories', async (c) => {
    const body = await c.req.json<Omit<MediaAssetCategory, 'id'>>();
    if (!body.name) return bad(c, 'Name is required');
    const newCategory: MediaAssetCategory = { id: crypto.randomUUID(), name: body.name };
    const created = await MediaAssetCategoryEntity.create(c.env, newCategory);
    return ok(c, created);
  });
  app.put('/api/media-asset-categories/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<Partial<MediaAssetCategory>>();
    const entity = new MediaAssetCategoryEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    await entity.patch(body);
    return ok(c, await entity.getState());
  });
  app.delete('/api/media-asset-categories/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await MediaAssetCategoryEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // MEDIA ASSETS
  app.get('/api/media-assets', async (c) => {
    const { items: assets } = await MediaAssetEntity.list(c.env);
    const { items: categories } = await MediaAssetCategoryEntity.list(c.env);
    const categoriesById = new Map(categories.map(cat => [cat.id, cat.name]));
    const assetsWithCategoryNames = assets.map(asset => ({
      ...asset,
      categoryName: categoriesById.get(asset.categoryId) || 'Uncategorized',
    }));
    return ok(c, assetsWithCategoryNames);
  });
  app.post('/api/media-assets', async (c) => {
    const body = await c.req.json<Omit<MediaAsset, 'id'>>();
    if (!body.label || !body.url || !body.categoryId) return bad(c, 'Label, URL, and category are required');
    const newAsset: MediaAsset = {
      ...body,
      id: crypto.randomUUID(),
      filename: body.url.split('/').pop() || 'file',
      fileType: body.fileType || 'unknown',
      size: body.size || 0,
    };
    const created = await MediaAssetEntity.create(c.env, newAsset);
    return ok(c, created);
  });
  app.delete('/api/media-assets/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await MediaAssetEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // ANALYTICS
  // Group analytics GET routes to use the middleware
  const analyticsApp = new Hono<{ Bindings: Env, Variables: { analyticsEvents: AnalyticsEvent[] } }>();
  analyticsApp.use('*', analyticsMiddleware);
  analyticsApp.get('/summary', async (c) => {
    const { items: allReleases } = await PressReleaseEntity.list(c.env);
    const allEvents = c.get('analyticsEvents');
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);
    const viewsLast7Days = allEvents.filter((e: AnalyticsEvent) => e.type === 'pageview' && new Date(e.timestamp) >= sevenDaysAgo).length;
    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: now });
    const viewsByDay = dateRange.map(date => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const views = allEvents.filter((e: AnalyticsEvent) =>
            e.type === 'pageview' &&
            new Date(e.timestamp) >= dayStart &&
            new Date(e.timestamp) <= dayEnd
        ).length;
        return {
            date: format(date, 'MMM d'),
            views: views
        };
    });
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
  analyticsApp.get('/press-releases', async (c) => {
    const { items: allReleases } = await PressReleaseEntity.list(c.env);
    const allEvents = c.get('analyticsEvents');
    const viewCounts = allEvents.reduce((acc, event: AnalyticsEvent) => {
        if (event.type === 'pageview') {
            acc[event.pressReleaseId] = (acc[event.pressReleaseId] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    const releasesWithViews: PressReleaseWithViews[] = allReleases.map(pr => ({
        ...pr,
        views: viewCounts[pr.id] || 0,
    }));
    releasesWithViews.sort((a, b) => b.views - a.views);
    return ok(c, releasesWithViews);
  });
  analyticsApp.get('/press-release/:id', async (c) => {
    const id = c.req.param('id');
    const releaseEntity = new PressReleaseEntity(c.env, id);
    if (!await releaseEntity.exists()) return notFound(c, 'Press release not found');
    const release = await releaseEntity.getState();
    const allEvents = c.get('analyticsEvents');
    const relevantEvents = allEvents.filter((e: AnalyticsEvent) => e.pressReleaseId === id);
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const totalViews = relevantEvents.filter((e: AnalyticsEvent) => e.type === 'pageview').length;
    const viewsLast7Days = relevantEvents.filter((e: AnalyticsEvent) => e.type === 'pageview' && new Date(e.timestamp) >= sevenDaysAgo).length;
    const downloadCounts = relevantEvents.reduce((acc, event: AnalyticsEvent) => {
        if (event.type === 'download' && event.assetId) {
            acc[event.assetId] = (acc[event.assetId] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    const analyticsData: PressReleaseAnalyticsData = {
        totalViews,
        viewsLast7Days,
        attachmentDownloads: release.attachments.map(asset => ({
            assetId: asset.id,
            label: asset.label,
            filename: asset.filename,
            downloads: downloadCounts[asset.id] || 0,
        })),
    };
    return ok(c, analyticsData);
  });
  app.route('/api/analytics', analyticsApp);
  // This POST route remains separate as it modifies data and shouldn't run the pre-fetch middleware.
  app.post('/api/analytics/track', async (c) => {
    const body = await c.req.json<{ type: 'pageview' | 'download'; pressReleaseId: string; assetId?: string }>();
    if (!body.type || !body.pressReleaseId) {
      return bad(c, 'Invalid tracking event');
    }
    if (body.type === 'download' && !body.assetId) {
      return bad(c, 'assetId is required for download events');
    }
    const newEvent: AnalyticsEvent = {
      id: crypto.randomUUID(),
      type: body.type,
      pressReleaseId: body.pressReleaseId,
      assetId: body.assetId,
      timestamp: formatISO(new Date()),
    };
    await AnalyticsEventEntity.create(c.env, newEvent);
    return ok(c, { success: true });
  });
}