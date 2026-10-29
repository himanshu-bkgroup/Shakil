const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const IMAGES = {
  hero: '/assets/hero_trolley_repair_1790149399107-Cr1qnTSA.jpg',
  wheels: '/assets/trolley_wheels_parts_1790149432455-DF_RPrCc.jpg',
  handleLocks: '/assets/trolley_handle_locks_1790149446326-Db9qyX7N.jpg',
  bagRepair: '/assets/bag_repair_craft_1790149462747-TG0zRibs.jpg',
  customBags: '/assets/custom_bags_workshop_1790149480675-DsAjCP14.jpg',
};

const SERVICES = [
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
    description: 'Telescopic trolley pull handle mechanisms, top carry handles, side handles, and internal rod repairs.',
    image_url: IMAGES.handleLocks,
    whatsapp_template: 'Hello Sakil Bag Store, I found your website on Google. I need trolley handle repair.\nName: {name}\nPhone: {phone}\nBrand: {brand}\nHandle Type: {handle_type}\nLength: {length}\nProblem: {problem}\nRequirement: {message}',
    active: true,
    display_order: 3,
  },
  {
    id: 'srv-4',
    name: 'Trolley Lock Replacement & Setup',
    slug: 'trolley-lock-repair-noida',
    description: 'Combination locks, TSA style locks, slider pullers, and locking mechanisms for suitcases.',
    image_url: IMAGES.handleLocks,
    whatsapp_template: 'Hello Sakil Bag Store, I found your website on Google. I need trolley lock repair.\nName: {name}\nPhone: {phone}\nBrand: {brand}\nLock Type: {lock_type}\nProblem: {problem}\nRequirement: {message}',
    active: true,
    display_order: 4,
  },
  {
    id: 'srv-5',
    name: 'Trolley Parts & Hardware Store',
    slug: 'trolley-parts-store-noida',
    description: 'Extensive inventory of replacement spare parts: wheel sets, caster housings, rivets, screws, telescopic tubes, and bottom studs.',
    image_url: IMAGES.wheels,
    whatsapp_template: 'Hello Sakil Bag Store, I need specific trolley spare parts.\nName: {name}\nPhone: {phone}\nPart Name: {part_name}\nPart Measurements: {measurements}\nQuantity: {quantity}\nRequirement: {message}',
    active: true,
    display_order: 5,
  },
  {
    id: 'srv-6',
    name: 'Luggage & Suitcase Repair',
    slug: 'luggage-repair-noida',
    description: 'Hard-case polycarbonate luggage crack patching, soft luggage fabric tears, zipper chain re-tracking, and corner reinforcements.',
    image_url: IMAGES.hero,
    whatsapp_template: 'Hello Sakil Bag Store, I need luggage repair services.\nName: {name}\nPhone: {phone}\nLuggage Brand: {brand}\nMaterial: {material}\nProblem: {problem}\nRequirement: {message}',
    active: true,
    display_order: 6,
  },
  {
    id: 'srv-7',
    name: 'General Bag Repair',
    slug: 'bag-repair-shop-noida',
    description: 'Backpack strap stitching, office laptop bag runner replacement, gym duffle seams, school bag repairs, and buckle replacements.',
    image_url: IMAGES.bagRepair,
    whatsapp_template: 'Hello Sakil Bag Store, I need general bag repair.\nName: {name}\nPhone: {phone}\nBag Category: {bag_category}\nIssue: {problem}\nRequirement: {message}',
    active: true,
    display_order: 7,
  },
  {
    id: 'srv-8',
    name: 'Customized Bag Manufacturing',
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

const GALLERY = [
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

const SETTINGS = {
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
};

async function run() {
  console.log('Seeding Firestore...');
  for (const s of SERVICES) {
    await setDoc(doc(db, 'services', s.id), s);
  }
  console.log('Seeded services:', SERVICES.length);

  for (const g of GALLERY) {
    await setDoc(doc(db, 'gallery', g.id), g);
  }
  console.log('Seeded gallery:', GALLERY.length);

  await setDoc(doc(db, 'settings', 'sakil-default-settings'), SETTINGS);
  console.log('Seeded settings');

  console.log('ALL DATA POPULATED IN GOOGLE CLOUD FIRESTORE!');
}

run().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
