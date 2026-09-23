export type Role = 'ADMIN' | 'STAFF';

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'FOLLOW_UP' | 'CONVERTED' | 'CLOSED' | 'SPAM';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BusinessSettings {
  id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  google_business_profile_url: string;
  google_maps_url: string;
  opening_hours: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  whatsapp_template: string;
  active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServicePage {
  id: string;
  service_id: string;
  slug: string;
  page_title: string;
  h1: string;
  content: string;
  seo_title: string;
  meta_description: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  active: boolean;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  service_id?: string;
  requirement_type: string;
  requirement_data: Record<string, any>;
  message?: string;
  attachment_url?: string;
  source_page?: string;
  status: EnquiryStatus;
  priority: PriorityLevel;
  ai_summary?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface EnquiryNote {
  id: string;
  enquiry_id: string;
  admin_user_id?: string;
  note: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  caption?: string;
  category: 'Wheels' | 'Handles' | 'Locks' | 'Trolley Parts' | 'Bag Repair' | 'Luggage' | 'Customized Bags' | 'Store';
  alt_text: string;
  display_order: number;
  active: boolean;
  created_at?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  active: boolean;
}

export interface AnalyticsEvent {
  id?: string;
  event_name: 'page_view' | 'service_view' | 'whatsapp_click' | 'phone_click' | 'directions_click' | 'requirement_started' | 'requirement_submitted' | 'form_abandoned' | 'gallery_view' | 'faq_view';
  page_url: string;
  service_id?: string;
  session_id: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  enquiry_id?: string;
  created_at: string;
}

export interface SEOMetadata {
  id: string;
  page_path: string;
  seo_title: string;
  meta_description: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  robots: string;
  updated_at?: string;
}
