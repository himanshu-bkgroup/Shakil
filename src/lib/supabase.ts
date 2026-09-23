import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  BusinessSettings,
  Service,
  Enquiry,
  GalleryItem,
  FAQItem,
  AnalyticsEvent,
  AdminNotification,
  SEOMetadata
} from '../types';
import { IMAGES } from './images';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Default Business Settings (as specified in Prompt)
export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  id: 'sakil-default-settings',
  business_name: 'SAKIL BAG STORE',
  owner_name: 'Mohd Shakil',
  phone: '083838 04752',
  whatsapp_number: '918383804752',
  email: 'sakilbagstore@gmail.com',
  address: 'H8WV+F28, Chaura Raghunathpur, Raghunathpur, Sector 22, Noida, Uttar Pradesh 201307, India',
  city: 'Noida',
  state: 'Uttar Pradesh',
  pincode: '201307',
  google_business_profile_url: 'https://www.google.com/maps/search/?api=1&query=SAKIL+BAG+STORE+Chaura+Raghunathpur+Sector+22+Noida',
  google_maps_url: 'https://www.google.com/maps/dir/?api=1&destination=H8WV%2BF28,+Chaura+Raghunathpur,+Sector+22,+Noida,+Uttar+Pradesh+201307',
  opening_hours: 'Monday to Sunday: 10:00 AM - 9:00 PM',
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
  youtube_url: 'https://youtube.com',
};

// Initial services
export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Trolley Bag Repair',
    slug: 'trolley-bag-repair-noida',
    description: 'Specialist repair assistance for broken trolley zip runners, shell cracks, wheels, and frame alignment in Sector 22, Noida.',
    image_url: IMAGES.hero,
    whatsapp_template: 'Hello Sakil Bag Store, I found your website on Google. I need trolley bag repair.\nName: {name}\nPhone: {phone}\nBag Type: {bag_type}\nBrand: {brand}\nProblem: {problem}\nRequirement: {message}',
    active: true,
    display_order: 1,
  },
  {
    id: 'srv-2',
    name: 'Trolley Wheel Replacement',
    slug: 'trolley-wheel-repair-noida',
    description: 'Single, dual spinner, and polyurethane caster wheels. Measurement verification for axle size, diameter and bearing type.',
    image_url: IMAGES.wheels,
    whatsapp_template: 'Hello Sakil Bag Store, I found your website on Google. I need a trolley wheel requirement.\nName: {name}\nPhone: {phone}\nBrand: {brand}\nTrolley Type: {trolley_type}\nWheel Diameter: {wheel_diameter}\nWheel Width: {wheel_width}\nAxle/Hole Diameter: {axle_diameter}\nAxle Length: {axle_length}\nWheel Type: {wheel_type}\nQuantity: {quantity}\nProblem: {problem}\nAdditional Requirement: {message}',
    active: true,
    display_order: 2,
  },
  {
    id: 'srv-3',
    name: 'Trolley Handle Repair & Replacement',
    slug: 'trolley-handle-repair-noida',
    description: 'Telescopic luggage pull handles, top ergonomic handles, side handles, internal metal bracket tubes and replacement grip hardware.',
    image_url: IMAGES.handleLocks,
    whatsapp_template: 'Hello Sakil Bag Store, I found your website on Google. I need trolley handle repair or replacement.\nName: {name}\nPhone: {phone}\nBrand: {brand}\nHandle Type: {handle_type}\nApproximate Length: {length}\nQuantity: {quantity}\nRequirement: {message}',
    active: true,
    display_order: 3,
  },
  {
    id: 'srv-4',
    name: 'Trolley & Bag Locks',
    slug: 'trolley-bag-locks-noida',
    description: 'TSA-type combination locks, luggage zip puller locks, replacement side latches, and hardware lock fittings for all trolley luggage.',
    image_url: IMAGES.handleLocks,
    whatsapp_template: 'Hello Sakil Bag Store, I found your website on Google. I need to check a trolley/bag lock requirement.\nName: {name}\nPhone: {phone}\nLock Type: {lock_type}\nBag/Trolley Type: {bag_type}\nBrand: {brand}\nQuantity: {quantity}\nRequirement: {message}',
    active: true,
    display_order: 4,
  },
  {
    id: 'srv-5',
    name: 'Trolley Parts Supplier',
    slug: 'trolley-parts-supplier-noida',
    description: 'Component supplier for spare trolley parts: wheels, telescopic rods, rubber bottom feet, base plates, zipper tracks, and fasteners.',
    image_url: IMAGES.wheels,
    whatsapp_template: 'Hello Sakil Bag Store, I found your website on Google. I need trolley parts.\nName: {name}\nPhone: {phone}\nPart Required: {part_name}\nSize: {size}\nQuantity: {quantity}\nBrand/Model: {brand}\nRequirement: {message}',
    active: true,
    display_order: 5,
  },
  {
    id: 'srv-6',
    name: 'Bag Repair',
    slug: 'bag-repair-noida',
    description: 'Expert repair of backpacks, laptop bags, travel duffles, gym bags, zipper chain & slider replacement, strap reinforcement.',
    image_url: IMAGES.bagRepair,
    whatsapp_template: 'Hello Sakil Bag Store, I need bag repair.\nName: {name}\nPhone: {phone}\nBag Type: {bag_type}\nBrand: {brand}\nProblem: {problem}\nRequirement: {message}',
    active: true,
    display_order: 6,
  },
  {
    id: 'srv-7',
    name: 'Luggage Repair',
    slug: 'luggage-repair-noida',
    description: 'Comprehensive travel luggage repairs: hard-case crack fixing, corner protective bumper installations, internal lining repair.',
    image_url: IMAGES.hero,
    whatsapp_template: 'Hello Sakil Bag Store, I found your website on Google. I need luggage repair.\nName: {name}\nPhone: {phone}\nLuggage Type: {bag_type}\nBrand: {brand}\nProblem: {problem}\nRequirement: {message}',
    active: true,
    display_order: 7,
  },
  {
    id: 'srv-8',
    name: 'Customized Bags',
    slug: 'customized-bag-maker-noida',
    description: 'Custom bag orders for corporate events, promotional gifting, travel duffles, institute backpacks, and custom size requirements.',
    image_url: IMAGES.customBags,
    whatsapp_template: 'Hello Sakil Bag Store, I am interested in customized bags.\nName: {name}\nPhone: {phone}\nBag Type: {bag_type}\nQuantity: {quantity}\nCustomization: {customization}\nRequirement: {message}',
    active: true,
    display_order: 8,
  },
  {
    id: 'srv-9',
    name: 'Bulk Parts Requirement',
    slug: 'bulk-trolley-parts',
    description: 'Bulk supply of trolley replacement wheels, handles, and locks for technicians, repair shops, and institutional clients in Noida & NCR.',
    image_url: IMAGES.wheels,
    whatsapp_template: 'Hello Sakil Bag Store, I have a bulk trolley parts requirement.\nName: {name}\nPhone: {phone}\nParts List: {parts_list}\nEstimated Quantity: {quantity}\nRequirement: {message}',
    active: true,
    display_order: 9,
  },
];

// Initial FAQs
export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Do you repair trolley bags in Noida?',
    answer: 'Yes. SAKIL BAG STORE provides comprehensive trolley bag repair services including broken wheel replacement, telescopic handle fixing, lock replacement, runner & zipper repair, and seam stitching at our store in Sector 22, Noida.',
    category: 'Trolley Repair',
    display_order: 1,
    active: true,
  },
  {
    id: 'faq-2',
    question: 'Can I replace damaged trolley wheels at your store?',
    answer: 'Yes. We stock and source various replacement trolley wheels including single wheels, dual spinner caster wheels, and polyurethane wheels for standard brands. You can bring your trolley or send wheel measurements via WhatsApp.',
    category: 'Trolley Wheels',
    display_order: 2,
    active: true,
  },
  {
    id: 'faq-3',
    question: 'How do I identify my trolley wheel size before contacting?',
    answer: 'Measure three key dimensions: 1) Wheel outer diameter (in mm, commonly 40mm, 45mm, 50mm, 55mm, 60mm), 2) Wheel width/thickness, and 3) The axle bolt diameter and length. You can also photograph the wheel alongside a ruler and send it via our WhatsApp requirement form.',
    category: 'Trolley Wheels',
    display_order: 3,
    active: true,
  },
  {
    id: 'faq-4',
    question: 'Can I send a photo of my trolley wheel or damaged handle?',
    answer: 'Yes! You can attach a photo directly through our online requirement form or click our WhatsApp button to send high-clarity photos. This helps us immediately inspect the screw pattern, mounting bracket, and axle configuration.',
    category: 'General',
    display_order: 4,
    active: true,
  },
  {
    id: 'faq-5',
    question: 'Do you provide replacement telescopic trolley handles?',
    answer: 'Yes, we carry and repair various telescopic pull handles (internal and external rod designs), top carry handles, and side handles for trolley bags and travel luggage.',
    category: 'Trolley Handles',
    display_order: 5,
    active: true,
  },
  {
    id: 'faq-6',
    question: 'Do you provide trolley locks and luggage hardware?',
    answer: 'Yes, we carry combination locks, TSA-type luggage lock replacements, slider pullers, bottom studs, and protective corner guards.',
    category: 'Locks & Hardware',
    display_order: 6,
    active: true,
  },
  {
    id: 'faq-7',
    question: 'Do you repair general bags like backpacks and travel duffles?',
    answer: 'Yes. We repair backpacks, office laptop bags, duffles, gym bags, and travel luggage. Services include zipper runner replacement, zipper track stitching, strap reinforcement, and buckle replacement.',
    category: 'Bag Repair',
    display_order: 7,
    active: true,
  },
  {
    id: 'faq-8',
    question: 'Do you make customized bags or accept bulk orders?',
    answer: 'Yes, we accept customized bag enquiries for travel, corporate, promotional, and utility requirements in Noida. You can share your specifications, reference images, and quantity via our form.',
    category: 'Custom Bags',
    display_order: 8,
    active: true,
  },
  {
    id: 'faq-9',
    question: 'Where is SAKIL BAG STORE located in Noida?',
    answer: 'We are located at H8WV+F28, Chaura Raghunathpur, Raghunathpur, Sector 22, Noida, Uttar Pradesh 201307. You can click "Get Directions" on our website for direct navigation via Google Maps.',
    category: 'Store Visit',
    display_order: 9,
    active: true,
  },
  {
    id: 'faq-10',
    question: 'How can I contact Mohd Shakil at SAKIL BAG STORE?',
    answer: 'You can call our direct business phone at 083838 04752 or send an instant WhatsApp enquiry through any of our service pages.',
    category: 'Contact',
    display_order: 10,
    active: true,
  },
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    image_url: IMAGES.wheels,
    title: 'Dual Caster Replacement Wheels',
    caption: 'Precision 360-degree silent spinner wheels with ball bearings',
    category: 'Wheels',
    alt_text: 'Trolley bag replacement caster wheels Noida',
    display_order: 1,
    active: true,
  },
  {
    id: 'gal-2',
    image_url: IMAGES.handleLocks,
    title: 'Telescopic Aluminum Handle Mechanism',
    caption: 'Sturdy multi-stage pull handle for travel suitcases',
    category: 'Handles',
    alt_text: 'Telescopic luggage handle repair Noida',
    display_order: 2,
    active: true,
  },
  {
    id: 'gal-3',
    image_url: IMAGES.handleLocks,
    title: 'Combination Luggage Locks',
    caption: 'Secure replacement locks and zip sliders',
    category: 'Locks',
    alt_text: 'Trolley bag combination lock replacement',
    display_order: 3,
    active: true,
  },
  {
    id: 'gal-4',
    image_url: IMAGES.bagRepair,
    title: 'Industrial Seam & Zipper Stitching',
    caption: 'Heavy duty reinforcement of travel duffles & bags',
    category: 'Bag Repair',
    alt_text: 'Bag zipper repair Sakil Bag Store Noida',
    display_order: 4,
    active: true,
  },
  {
    id: 'gal-5',
    image_url: IMAGES.hero,
    title: 'Hard-Shell Trolley Repair Assessment',
    caption: 'Luggage alignment, wheel bracket and corner inspection',
    category: 'Luggage',
    alt_text: 'Hard-case trolley repair in Sector 22 Noida',
    display_order: 5,
    active: true,
  },
  {
    id: 'gal-6',
    image_url: IMAGES.customBags,
    title: 'Custom Fabricated Travel Duffels',
    caption: 'Reinforced ballistic canvas with custom logo placement',
    category: 'Customized Bags',
    alt_text: 'Custom bag maker in Noida',
    display_order: 6,
    active: true,
  },
];

// Local state storage keys
const STORAGE_KEYS = {
  SETTINGS: 'sakil_business_settings',
  SERVICES: 'sakil_services',
  ENQUIRIES: 'sakil_enquiries',
  GALLERY: 'sakil_gallery',
  FAQS: 'sakil_faqs',
  ANALYTICS: 'sakil_analytics',
  NOTIFICATIONS: 'sakil_notifications',
  SEO: 'sakil_seo',
  ADMIN_AUTH: 'sakil_admin_logged_in',
};

// Storage Helpers
function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

// Initial Enquiries for Admin Demonstration
const INITIAL_DEMO_ENQUIRIES: Enquiry[] = [
  {
    id: 'enq-101',
    name: 'Rajesh Sharma',
    phone: '9810123456',
    requirement_type: 'Trolley Wheels',
    requirement_data: {
      brand: 'American Tourister',
      trolley_type: 'Hard Shell 24 inch',
      wheel_diameter: '50mm',
      wheel_width: '18mm',
      wheel_type: 'Dual Spinner Caster',
      quantity: '4',
      problem: 'All rubber coating peeled off on airport conveyor',
    },
    message: 'Need 4 matching spinner wheels urgently before my flight on Friday.',
    source_page: '/trolley-wheel-repair-noida',
    status: 'NEW',
    priority: 'HIGH',
    ai_summary: 'Customer needs 4 replacement 50mm dual spinner wheels for 24-inch American Tourister trolley. Urgent flight deadline.',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'enq-102',
    name: 'Pooja Verma',
    phone: '9876543210',
    requirement_type: 'Trolley Handle',
    requirement_data: {
      brand: 'VIP',
      handle_type: 'Telescopic 2-Stage Pull',
      length: '38 inches',
      quantity: '1',
      problem: 'Top button is jammed and right rod is bent',
    },
    message: 'Can this handle be repaired or replaced? Located nearby in Sector 21.',
    source_page: '/trolley-handle-repair-noida',
    status: 'CONTACTED',
    priority: 'MEDIUM',
    ai_summary: 'Bent right rod on VIP telescopic pull handle. Customer is nearby in Sector 21, advised bringing in for sizing.',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

// Unified API Functions

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('business_settings').select('*').limit(1).single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local settings:', e);
    }
  }
  return loadStorage<BusinessSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_BUSINESS_SETTINGS);
}

export async function saveBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const current = await fetchBusinessSettings();
  const updated: BusinessSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('business_settings').upsert(updated);
    } catch (e) {
      console.warn('Supabase save failed:', e);
    }
  }

  saveStorage(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

export async function fetchServices(): Promise<Service[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('services').select('*').order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase services fetch failed:', e);
    }
  }
  return loadStorage<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
}

export async function saveService(service: Service): Promise<void> {
  const services = await fetchServices();
  const index = services.findIndex(s => s.id === service.id);
  if (index >= 0) {
    services[index] = service;
  } else {
    services.push(service);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('services').upsert(service);
    } catch (e) {
      console.warn('Supabase save service error:', e);
    }
  }
  saveStorage(STORAGE_KEYS.SERVICES, services);
}

export async function deleteService(serviceId: string): Promise<void> {
  const services = await fetchServices();
  const filtered = services.filter(s => s.id !== serviceId);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('services').delete().eq('id', serviceId);
    } catch (e) {
      console.warn('Supabase delete service error:', e);
    }
  }
  saveStorage(STORAGE_KEYS.SERVICES, filtered);
}

export async function fetchEnquiries(): Promise<Enquiry[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase enquiries fetch failed:', e);
    }
  }
  return loadStorage<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, INITIAL_DEMO_ENQUIRIES);
}

export async function submitEnquiry(payload: {
  name: string;
  phone: string;
  service_id?: string;
  requirement_type: string;
  requirement_data: Record<string, any>;
  message?: string;
  attachment_url?: string;
  source_page?: string;
}): Promise<Enquiry> {
  const newEnquiry: Enquiry = {
    id: 'enq-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    service_id: payload.service_id,
    requirement_type: payload.requirement_type,
    requirement_data: payload.requirement_data,
    message: payload.message,
    attachment_url: payload.attachment_url,
    source_page: payload.source_page || window.location.pathname,
    status: 'NEW',
    priority: (payload.requirement_data?.quantity && Number(payload.requirement_data.quantity) >= 4) ? 'HIGH' : 'MEDIUM',
    ai_summary: `Enquiry from ${payload.name} for ${payload.requirement_type} (${payload.phone})`,
    created_at: new Date().toISOString(),
  };

  // Try Supabase first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('enquiries').insert([newEnquiry]).select().single();
      if (!error && data) {
        // Notification
        await supabase.from('admin_notifications').insert({
          title: 'New Enquiry Received',
          message: `${newEnquiry.name} submitted ${newEnquiry.requirement_type}`,
          type: 'enquiry',
          enquiry_id: data.id,
          read: false,
        });
        return data;
      }
    } catch (e) {
      console.warn('Supabase insert failed, saving locally:', e);
    }
  }

  // Fallback to local storage
  const enquiries = loadStorage<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, INITIAL_DEMO_ENQUIRIES);
  enquiries.unshift(newEnquiry);
  saveStorage(STORAGE_KEYS.ENQUIRIES, enquiries);

  // Push notification locally
  const notifications = loadStorage<AdminNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  notifications.unshift({
    id: 'notif-' + Date.now(),
    title: 'New Enquiry Received',
    message: `${newEnquiry.name} sent a ${newEnquiry.requirement_type} requirement (${newEnquiry.phone})`,
    type: 'enquiry',
    read: false,
    enquiry_id: newEnquiry.id,
    created_at: new Date().toISOString(),
  });
  saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);

  // Trigger custom event for realtime simulation
  window.dispatchEvent(new CustomEvent('sakil_new_enquiry', { detail: newEnquiry }));

  return newEnquiry;
}

export async function updateEnquiry(enquiryId: string, updates: Partial<Enquiry>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('enquiries').update(updates).eq('id', enquiryId);
    } catch (e) {
      console.warn('Supabase update enquiry error:', e);
    }
  }

  const enquiries = loadStorage<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, INITIAL_DEMO_ENQUIRIES);
  const index = enquiries.findIndex(e => e.id === enquiryId);
  if (index >= 0) {
    enquiries[index] = { ...enquiries[index], ...updates, updated_at: new Date().toISOString() };
    saveStorage(STORAGE_KEYS.ENQUIRIES, enquiries);
  }
}

export async function deleteEnquiry(enquiryId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('enquiries').delete().eq('id', enquiryId);
    } catch (e) {
      console.warn('Supabase delete enquiry error:', e);
    }
  }
  const enquiries = loadStorage<Enquiry[]>(STORAGE_KEYS.ENQUIRIES, INITIAL_DEMO_ENQUIRIES);
  saveStorage(STORAGE_KEYS.ENQUIRIES, enquiries.filter(e => e.id !== enquiryId));
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('gallery').select('*').order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase gallery fetch failed:', e);
    }
  }
  return loadStorage<GalleryItem[]>(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
}

export async function saveGalleryItem(item: GalleryItem): Promise<void> {
  const gallery = await fetchGallery();
  const index = gallery.findIndex(g => g.id === item.id);
  if (index >= 0) {
    gallery[index] = item;
  } else {
    gallery.unshift(item);
  }
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('gallery').upsert(item);
    } catch (e) {
      console.warn('Supabase gallery upsert error:', e);
    }
  }
  saveStorage(STORAGE_KEYS.GALLERY, gallery);
}

export async function deleteGalleryItem(itemId: string): Promise<void> {
  const gallery = await fetchGallery();
  const filtered = gallery.filter(g => g.id !== itemId);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('gallery').delete().eq('id', itemId);
    } catch (e) {
      console.warn('Supabase gallery delete error:', e);
    }
  }
  saveStorage(STORAGE_KEYS.GALLERY, filtered);
}

export async function fetchFAQs(): Promise<FAQItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('faq').select('*').order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase faqs fetch failed:', e);
    }
  }
  return loadStorage<FAQItem[]>(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
}

export async function saveFAQItem(item: FAQItem): Promise<void> {
  const faqs = await fetchFAQs();
  const index = faqs.findIndex(f => f.id === item.id);
  if (index >= 0) {
    faqs[index] = item;
  } else {
    faqs.push(item);
  }
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('faq').upsert(item);
    } catch (e) {
      console.warn('Supabase faq upsert error:', e);
    }
  }
  saveStorage(STORAGE_KEYS.FAQS, faqs);
}

export async function deleteFAQItem(itemId: string): Promise<void> {
  const faqs = await fetchFAQs();
  const filtered = faqs.filter(f => f.id !== itemId);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('faq').delete().eq('id', itemId);
    } catch (e) {
      console.warn('Supabase faq delete error:', e);
    }
  }
  saveStorage(STORAGE_KEYS.FAQS, filtered);
}

export async function trackAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<void> {
  const record: AnalyticsEvent = {
    ...event,
    id: 'evt-' + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('analytics_events').insert([record]);
    } catch (e) {
      console.warn('Supabase analytics insert error:', e);
    }
  }

  const events = loadStorage<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
  events.unshift(record);
  if (events.length > 500) events.pop();
  saveStorage(STORAGE_KEYS.ANALYTICS, events);
}

export async function fetchAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(200);
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase analytics fetch failed:', e);
    }
  }
  return loadStorage<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
}

export async function fetchNotifications(): Promise<AdminNotification[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('admin_notifications').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase notifications fetch failed:', e);
    }
  }
  return loadStorage<AdminNotification[]>(STORAGE_KEYS.NOTIFICATIONS, [
    {
      id: 'notif-1',
      title: 'New Wheel Enquiry',
      message: 'Rajesh Sharma requested 4x 50mm dual spinner wheels.',
      type: 'enquiry',
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    }
  ]);
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('admin_notifications').update({ read: true }).eq('id', id);
    } catch (e) {
      console.warn('Supabase mark read error:', e);
    }
  }
  const notifs = loadStorage<AdminNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  const target = notifs.find(n => n.id === id);
  if (target) {
    target.read = true;
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }
}

// Authentication helpers
export function isAdminAuthenticated(): boolean {
  if (isSupabaseConfigured && supabase) {
    // If Supabase session is active
    const session = localStorage.getItem('sb-' + (supabaseUrl?.split('//')[1]?.split('.')[0] || '') + '-auth-token');
    if (session) return true;
  }
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function setAdminAuthenticated(status: boolean): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, status ? 'true' : 'false');
}

// AI helpers for Admin Dashboard
export async function generateAIReply(enquiry: Enquiry): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-admin-reply', {
        body: { enquiry }
      });
      if (!error && data?.suggested_reply) {
        return data.suggested_reply;
      }
    } catch (e) {
      console.warn('Edge function invoke failed, using built-in generator:', e);
    }
  }

  // Verified factual template without hallucinating prices or inventory
  return `Hello ${enquiry.name || 'Sir/Madam'}, thank you for contacting SAKIL BAG STORE (Sector 22, Noida). We received your requirement for ${enquiry.requirement_type}. Please share clear photos of the part or bring your bag to our store at Chaura Raghunathpur, Sector 22, Noida (Near H8WV+F28) so Mohd Shakil can inspect and assist you with the right replacement. Phone: 083838 04752.`;
}
