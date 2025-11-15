import { IndexedEntity } from "./core-utils";
import type { PressRelease, AdminUser, PRContact, StaticPage } from "@shared/types";
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
        content: '<p>This is the default about page content. Please edit it in the admin panel.</p>',
        updatedAt: formatISO(new Date()),
    },
    {
        id: 'contact',
        title: 'Media Contact Page',
        content: '<p>This is the default contact page content. Please edit it in the admin panel.</p>',
        updatedAt: formatISO(new Date()),
    },
    {
        id: 'assets',
        title: 'Media Assets Page',
        content: '<p>This is the default assets page content. Please edit it in the admin panel.</p>',
        updatedAt: formatISO(new Date()),
    }
];
export class StaticPageEntity extends IndexedEntity<StaticPage> {
  static readonly entityName = "staticPage";
  static readonly indexName = "staticPages";
  static readonly initialState: StaticPage = { id: "about", title: "", content: "", updatedAt: "" };
  static seedData = SEED_PAGES;
}