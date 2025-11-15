import { IndexedEntity } from "./core-utils";
import type { PressRelease, AdminUser, PRContact, StaticPage, ContactSubmission, AnalyticsEvent } from "@shared/types";
import { formatISO } from "date-fns";
// PRESS RELEASE ENTITY
export class PressReleaseEntity extends IndexedEntity<PressRelease> {
  static readonly entityName = "pressRelease";
  static readonly indexName = "pressReleases";
  static readonly initialState: PressRelease = {
    id: "",
    title: "",
    slug: "",
    summary: "",
    content: "",
    tags: [],
    status: 'Draft',
    publishAt: formatISO(new Date()),
    createdAt: formatISO(new Date()),
    updatedAt: formatISO(new Date()),
    attachments: [],
    contact: { id: '', name: '', title: '', email: '' },
  };
}
// ADMIN USER ENTITY
export class AdminUserEntity extends IndexedEntity<AdminUser> {
  static readonly entityName = "adminUser";
  static readonly indexName = "adminUsers";
  static readonly initialState: AdminUser = {
    id: "",
    name: "",
    email: "",
    role: 'Editor',
    createdAt: formatISO(new Date()),
  };
}
// PR CONTACT ENTITY
const SEED_CONTACTS: PRContact[] = [
    {
        id: 'contact-1',
        name: 'Jane Doe',
        title: 'Head of Communications',
        email: 'media@example.com',
        phone: '+1 (555) 123-4567',
    }
];
export class PRContactEntity extends IndexedEntity<PRContact> {
  static readonly entityName = "prContact";
  static readonly indexName = "prContacts";
  static readonly initialState: PRContact = { id: "", name: "", title: "", email: "" };
  static seedData = SEED_CONTACTS;
}
// STATIC PAGE ENTITY
const SEED_PAGES: StaticPage[] = [
    {
        id: 'about',
        title: 'About Media Centre',
        content: '<p>This is the default about page content. Please edit it in the admin panel.</p><h2>Our Philosophy</h2><p>We believe in the power of the edge. By building on Cloudflare Workers, Durable Objects, and the broader Cloudflare ecosystem, we can deliver applications that are incredibly fast, globally scalable, and secure by default. This project showcases that powerful, production-ready applications can be built without traditional servers.</p>',
        updatedAt: formatISO(new Date()),
    },
    {
        id: 'contact',
        title: 'Media Contact Page',
        content: '<h2>Media Inquiries</h2><p>For all media-related questions, please contact:</p><div class="contact-info"><p><strong>Jane Doe</strong></p><p>Head of Communications</p><p><a href="mailto:media@example.com">media@example.com</a></p><p>+1 (555) 123-4567</p></div>',
        updatedAt: formatISO(new Date()),
    },
    {
        id: 'assets',
        title: 'Media Assets',
        content: '<p>Download official logos, product images, and other assets for media use.</p>',
        updatedAt: formatISO(new Date()),
    }
];
export class StaticPageEntity extends IndexedEntity<StaticPage> {
  static readonly entityName = "staticPage";
  static readonly indexName = "staticPages";
  static readonly initialState: StaticPage = { id: "about", title: "", content: "", updatedAt: "" };
  static seedData = SEED_PAGES;
}
// CONTACT SUBMISSION ENTITY
export class ContactSubmissionEntity extends IndexedEntity<ContactSubmission> {
    static readonly entityName = "contactSubmission";
    static readonly indexName = "contactSubmissions";
    static readonly initialState: ContactSubmission = {
        id: "",
        name: "",
        outlet: "",
        email: "",
        message: "",
        submittedAt: formatISO(new Date()),
    };
}
// ANALYTICS EVENT ENTITY
export class AnalyticsEventEntity extends IndexedEntity<AnalyticsEvent> {
    static readonly entityName = "analyticsEvent";
    static readonly indexName = "analyticsEvents";
    static readonly initialState: AnalyticsEvent = {
        id: "",
        type: 'pageview',
        pressReleaseId: "",
        timestamp: formatISO(new Date()),
    };
}