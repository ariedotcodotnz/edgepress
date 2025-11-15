import { createMiddleware } from 'hono/factory';
import type { Env } from './core-utils';
import { AnalyticsEventEntity } from './entities';
import type { AnalyticsEvent } from '@shared/types';
// Define the type for the variables that will be added to the context
type AnalyticsVariables = {
    analyticsEvents: AnalyticsEvent[];
};
/**
 * Hono middleware to fetch all analytics events and store them in the context.
 * This prevents multiple database lookups for the same data across different analytics routes.
 */
export const analyticsMiddleware = createMiddleware<{ Bindings: Env, Variables: AnalyticsVariables }>(async (c, next) => {
    // Fetch all analytics events from the Durable Object storage
    const { items: allEvents } = await AnalyticsEventEntity.list(c.env);
    // Set the fetched events into the context for downstream handlers to use
    c.set('analyticsEvents', allEvents);
    // Proceed to the next middleware or the route handler
    await next();
});