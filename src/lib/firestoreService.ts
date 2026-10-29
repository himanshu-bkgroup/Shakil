import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type {
  Service,
  GalleryItem,
  BusinessSettings,
  Enquiry,
  FAQItem,
} from '../types';
import {
  DEFAULT_SERVICES,
  DEFAULT_GALLERY,
  DEFAULT_BUSINESS_SETTINGS,
  DEFAULT_FAQS,
} from './defaultData';

// -------------------------------------------------------------
// SERVICES
// -------------------------------------------------------------
export async function firestoreFetchServices(): Promise<Service[]> {
  const path = 'services';
  try {
    const snap = await getDocs(query(collection(db, path)));
    if (snap.empty) {
      // Auto-seed default services into Firestore
      await firestoreSeedServices();
      return DEFAULT_SERVICES;
    }
    const items: Service[] = [];
    snap.forEach((d) => items.push(d.data() as Service));
    return items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return DEFAULT_SERVICES;
  }
}

export async function firestoreSaveService(service: Service): Promise<void> {
  const path = `services/${service.id}`;
  try {
    await setDoc(doc(db, 'services', service.id), {
      ...service,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function firestoreDeleteService(serviceId: string): Promise<void> {
  const path = `services/${serviceId}`;
  try {
    await deleteDoc(doc(db, 'services', serviceId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function firestoreSeedServices(): Promise<void> {
  try {
    for (const srv of DEFAULT_SERVICES) {
      await setDoc(doc(db, 'services', srv.id), srv);
    }
  } catch (e) {
    console.warn('Error seeding services:', e);
  }
}

// -------------------------------------------------------------
// GALLERY
// -------------------------------------------------------------
export async function firestoreFetchGallery(): Promise<GalleryItem[]> {
  const path = 'gallery';
  try {
    const snap = await getDocs(query(collection(db, path)));
    if (snap.empty) {
      await firestoreSeedGallery();
      return DEFAULT_GALLERY;
    }
    const items: GalleryItem[] = [];
    snap.forEach((d) => items.push(d.data() as GalleryItem));
    return items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return DEFAULT_GALLERY;
  }
}

export async function firestoreSaveGallery(item: GalleryItem): Promise<void> {
  const path = `gallery/${item.id}`;
  try {
    await setDoc(doc(db, 'gallery', item.id), {
      ...item,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function firestoreDeleteGallery(galleryId: string): Promise<void> {
  const path = `gallery/${galleryId}`;
  try {
    await deleteDoc(doc(db, 'gallery', galleryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function firestoreSeedGallery(): Promise<void> {
  try {
    for (const item of DEFAULT_GALLERY) {
      await setDoc(doc(db, 'gallery', item.id), item);
    }
  } catch (e) {
    console.warn('Error seeding gallery:', e);
  }
}

// -------------------------------------------------------------
// BUSINESS SETTINGS
// -------------------------------------------------------------
export async function firestoreFetchSettings(): Promise<BusinessSettings> {
  const path = 'settings/sakil-default-settings';
  try {
    const snap = await getDoc(doc(db, 'settings', 'sakil-default-settings'));
    if (snap.exists()) {
      return snap.data() as BusinessSettings;
    }
    await setDoc(doc(db, 'settings', 'sakil-default-settings'), DEFAULT_BUSINESS_SETTINGS);
    return DEFAULT_BUSINESS_SETTINGS;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

export async function firestoreSaveSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const path = 'settings/sakil-default-settings';
  try {
    const current = await firestoreFetchSettings();
    const updated: BusinessSettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    await setDoc(doc(db, 'settings', 'sakil-default-settings'), updated);
    return updated;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

// -------------------------------------------------------------
// FAQS
// -------------------------------------------------------------
export async function firestoreFetchFaqs(): Promise<FAQItem[]> {
  const path = 'faqs';
  try {
    const snap = await getDocs(query(collection(db, path)));
    if (snap.empty) {
      await firestoreSeedFaqs();
      return DEFAULT_FAQS;
    }
    const items: FAQItem[] = [];
    snap.forEach((d) => items.push(d.data() as FAQItem));
    return items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return DEFAULT_FAQS;
  }
}

export async function firestoreSaveFaq(faq: FAQItem): Promise<void> {
  const path = `faqs/${faq.id}`;
  try {
    await setDoc(doc(db, 'faqs', faq.id), {
      ...faq,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function firestoreDeleteFaq(faqId: string): Promise<void> {
  const path = `faqs/${faqId}`;
  try {
    await deleteDoc(doc(db, 'faqs', faqId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function firestoreSeedFaqs(): Promise<void> {
  try {
    for (const faq of DEFAULT_FAQS) {
      await setDoc(doc(db, 'faqs', faq.id), faq);
    }
  } catch (e) {
    console.warn('Error seeding faqs:', e);
  }
}

// -------------------------------------------------------------
// ENQUIRIES
// -------------------------------------------------------------
export async function firestoreFetchEnquiries(): Promise<Enquiry[]> {
  const path = 'enquiries';
  try {
    const snap = await getDocs(query(collection(db, path)));
    const items: Enquiry[] = [];
    snap.forEach((d) => items.push(d.data() as Enquiry));
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function firestoreSubmitEnquiry(enquiry: Enquiry): Promise<void> {
  const path = `enquiries/${enquiry.id}`;
  try {
    await setDoc(doc(db, 'enquiries', enquiry.id), enquiry);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function firestoreUpdateEnquiryStatus(
  enquiryId: string,
  updates: Partial<Enquiry>
): Promise<void> {
  const path = `enquiries/${enquiryId}`;
  try {
    await updateDoc(doc(db, 'enquiries', enquiryId), {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function firestoreDeleteEnquiry(enquiryId: string): Promise<void> {
  const path = `enquiries/${enquiryId}`;
  try {
    await deleteDoc(doc(db, 'enquiries', enquiryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
