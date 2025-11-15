export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type PressReleaseStatus = 'Draft' | 'Published' | 'Scheduled';
export interface PressRelease {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Rich text / HTML
  heroImageUrl?: string;
  tags: string[];
  status: PressReleaseStatus;
  publishAt: string; // ISO 8601 date string
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  attachments: MediaAsset[];
  contact: PRContact;
}
export interface StaticPage {
  id: 'about' | 'contact' | 'assets';
  title: string;
  content: string; // Rich text / HTML
  updatedAt: string;
}
export interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  fileType: string;
  size: number; // in bytes
  label: string;
  description?: string;
  category: 'logo' | 'product' | 'executive' | 'other';
}
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor';
  createdAt: string;
}
export interface ContactSubmission {
  id: string;
  name: string;
  outlet: string;
  email: string;
  message: string;
  submittedAt: string;
}
export interface PRContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
}
export interface AnalyticsEvent {
    id: string;
    type: 'pageview';
    pressReleaseId: string;
    timestamp: string; // ISO 8601
}
export interface AnalyticsSummary {
    total: number;
    published: number;
    drafts: number;
    scheduled: number;
    viewsLast7Days: number;
    viewsLast30DaysChart: { date: string; views: number }[];
}
export interface PressReleaseWithViews extends PressRelease {
    views: number;
}