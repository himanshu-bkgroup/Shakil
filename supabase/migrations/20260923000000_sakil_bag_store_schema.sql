-- SAKIL BAG STORE PostgreSQL Schema for Supabase
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Business Settings Table (Single row configuration)
CREATE TABLE IF NOT EXISTS public.business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL DEFAULT 'SAKIL BAG STORE',
  owner_name TEXT NOT NULL DEFAULT 'Mohd Shakil',
  phone TEXT NOT NULL DEFAULT '083838 04752',
  whatsapp_number TEXT NOT NULL DEFAULT '918383804752',
  email TEXT NOT NULL DEFAULT 'sakilbagstore@gmail.com',
  address TEXT NOT NULL DEFAULT 'H8WV+F28, Chaura Raghunathpur, Raghunathpur, Sector 22, Noida, Uttar Pradesh 201307, India',
  city TEXT NOT NULL DEFAULT 'Noida',
  state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
  pincode TEXT NOT NULL DEFAULT '201307',
  google_business_profile_url TEXT NOT NULL DEFAULT 'https://maps.google.com/?cid=1234567890',
  google_maps_url TEXT NOT NULL DEFAULT 'https://www.google.com/maps/dir/?api=1&destination=H8WV%2BF28,+Chaura+Raghunathpur,+Sector+22,+Noida,+Uttar+Pradesh+201307',
  opening_hours TEXT NOT NULL DEFAULT 'Monday to Sunday: 10:00 AM - 9:00 PM',
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  whatsapp_template TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Service Pages Table
CREATE TABLE IF NOT EXISTS public.service_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  h1 TEXT NOT NULL,
  content TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  requirement_type TEXT NOT NULL,
  requirement_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  message TEXT,
  attachment_url TEXT,
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED', 'SPAM')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  ai_summary TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enquiry Notes Table
CREATE TABLE IF NOT EXISTS public.enquiry_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Gallery Table
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  caption TEXT,
  category TEXT NOT NULL CHECK (category IN ('Wheels', 'Handles', 'Locks', 'Trolley Parts', 'Bag Repair', 'Luggage', 'Customized Bags', 'Store')),
  alt_text TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. FAQ Table
CREATE TABLE IF NOT EXISTS public.faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  page_url TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Admin Notifications Table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'enquiry',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SEO Metadata Table
CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL UNIQUE,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  robots TEXT NOT NULL DEFAULT 'index, follow',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_service_pages_slug ON public.service_pages(slug);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON public.enquiries(phone);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_page_path ON public.seo_metadata(page_path);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Is Staff or Admin
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role IN ('ADMIN', 'STAFF')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Read Policies
CREATE POLICY "Public can view business settings" ON public.business_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active services" ON public.services FOR SELECT USING (active = true);
CREATE POLICY "Public can view active service pages" ON public.service_pages FOR SELECT USING (active = true);
CREATE POLICY "Public can view active gallery items" ON public.gallery FOR SELECT USING (active = true);
CREATE POLICY "Public can view active faqs" ON public.faq FOR SELECT USING (active = true);
CREATE POLICY "Public can view seo metadata" ON public.seo_metadata FOR SELECT USING (true);

-- Public Insert Policies (Visitors can submit enquiries and log analytics)
CREATE POLICY "Public can submit enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Staff/Admin Policies
CREATE POLICY "Staff can view all enquiries" ON public.enquiries FOR SELECT USING (public.is_staff());
CREATE POLICY "Staff can update enquiries" ON public.enquiries FOR UPDATE USING (public.is_staff());
CREATE POLICY "Admin can delete enquiries" ON public.enquiries FOR DELETE USING (public.is_admin());

CREATE POLICY "Staff can view notes" ON public.enquiry_notes FOR SELECT USING (public.is_staff());
CREATE POLICY "Staff can insert notes" ON public.enquiry_notes FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "Staff can view notifications" ON public.admin_notifications FOR SELECT USING (public.is_staff());
CREATE POLICY "Staff can update notifications" ON public.admin_notifications FOR UPDATE USING (public.is_staff());

CREATE POLICY "Staff can view all services" ON public.services FOR ALL USING (public.is_staff());
CREATE POLICY "Staff can view all service pages" ON public.service_pages FOR ALL USING (public.is_staff());
CREATE POLICY "Staff can view all gallery" ON public.gallery FOR ALL USING (public.is_staff());
CREATE POLICY "Staff can view all faqs" ON public.faq FOR ALL USING (public.is_staff());
CREATE POLICY "Staff can view analytics" ON public.analytics_events FOR SELECT USING (public.is_staff());
CREATE POLICY "Staff can manage seo" ON public.seo_metadata FOR ALL USING (public.is_staff());
CREATE POLICY "Admin can manage settings" ON public.business_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
