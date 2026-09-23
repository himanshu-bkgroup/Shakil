-- Initial Seed Data for SAKIL BAG STORE
INSERT INTO public.business_settings (
  business_name,
  owner_name,
  phone,
  whatsapp_number,
  email,
  address,
  city,
  state,
  pincode,
  google_business_profile_url,
  google_maps_url,
  opening_hours,
  facebook_url,
  instagram_url,
  youtube_url
) VALUES (
  'SAKIL BAG STORE',
  'Mohd Shakil',
  '083838 04752',
  '918383804752',
  'sakilbagstore@gmail.com',
  'H8WV+F28, Chaura Raghunathpur, Raghunathpur, Sector 22, Noida, Uttar Pradesh 201307, India',
  'Noida',
  'Uttar Pradesh',
  '201307',
  'https://www.google.com/maps/search/?api=1&query=SAKIL+BAG+STORE+Chaura+Raghunathpur+Sector+22+Noida',
  'https://www.google.com/maps/dir/?api=1&destination=H8WV%2BF28,+Chaura+Raghunathpur,+Sector+22,+Noida,+Uttar+Pradesh+201307',
  'Monday to Sunday: 10:00 AM - 9:00 PM',
  'https://facebook.com',
  'https://instagram.com',
  'https://youtube.com'
) ON CONFLICT DO NOTHING;

-- Insert Initial Services
INSERT INTO public.services (name, slug, description, whatsapp_template, active, display_order)
VALUES
(
  'Trolley Bag Repair',
  'trolley-bag-repair-noida',
  'Professional repair assistance for common trolley and luggage problems including frame damage, broken handles, faulty zippers, and wheel alignment.',
  'Hello Sakil Bag Store, I found your website on Google. I need trolley bag repair.\nName: {name}\nPhone: {phone}\nBag/Trolley Type: {bag_type}\nBrand: {brand}\nProblem: {problem}\nRequirement: {message}',
  true,
  1
),
(
  'Trolley Wheel Replacement',
  'trolley-wheel-repair-noida',
  'Wheel replacement enquiries with size and measurement collection. Single, double caster, and 360-degree spinner wheels for all luggage brands.',
  'Hello Sakil Bag Store, I found your website on Google. I need a trolley wheel requirement.\nName: {name}\nPhone: {phone}\nBrand: {brand}\nTrolley Type: {trolley_type}\nWheel Diameter: {wheel_diameter}\nWheel Width: {wheel_width}\nAxle/Hole Diameter: {axle_diameter}\nAxle Length: {axle_length}\nWheel Type: {wheel_type}\nQuantity: {quantity}\nProblem: {problem}\nAdditional Requirement: {message}',
  true,
  2
),
(
  'Trolley Handle Repair & Replacement',
  'trolley-handle-repair-noida',
  'Telescopic pull-up handles, top grab handles, side handles, and internal bracket repairs for travel luggage and trolley suitcases.',
  'Hello Sakil Bag Store, I found your website on Google. I need trolley handle repair or replacement.\nName: {name}\nPhone: {phone}\nBrand: {brand}\nHandle Type: {handle_type}\nApproximate Length: {length}\nQuantity: {quantity}\nRequirement: {message}',
  true,
  3
),
(
  'Trolley & Bag Locks',
  'trolley-bag-locks-noida',
  'Replacement combination locks, TSA-compatible lock fittings, custom latches, and hardware for trolley bags and luggage.',
  'Hello Sakil Bag Store, I found your website on Google. I need to check a trolley/bag lock requirement.\nName: {name}\nPhone: {phone}\nLock Type: {lock_type}\nBag/Trolley Type: {bag_type}\nBrand: {brand}\nQuantity: {quantity}\nRequirement: {message}',
  true,
  4
),
(
  'Trolley Parts Supplier',
  'trolley-parts-supplier-noida',
  'Complete supplier of trolley components, replacement wheels, telescopic rods, rubber feet, base plates, and bulk repair parts in Noida.',
  'Hello Sakil Bag Store, I found your website on Google. I need trolley parts.\nName: {name}\nPhone: {phone}\nPart Required: {part_name}\nSize: {size}\nQuantity: {quantity}\nBrand/Model: {brand}\nRequirement: {message}',
  true,
  5
),
(
  'Bag Repair',
  'bag-repair-noida',
  'General bag repair for travel bags, backpacks, duffles, gym bags, messenger bags, zipper chain & runner replacements, and heavy stitching.',
  'Hello Sakil Bag Store, I need bag repair.\nName: {name}\nPhone: {phone}\nBag Type: {bag_type}\nBrand: {brand}\nProblem: {problem}\nRequirement: {message}',
  true,
  6
),
(
  'Luggage Repair',
  'luggage-repair-noida',
  'Comprehensive repair solutions for hard-case and soft-case travel luggage, corner guards, hinges, zipper track repairs, and seam reinforcement.',
  'Hello Sakil Bag Store, I found your website on Google. I need luggage repair.\nName: {name}\nPhone: {phone}\nLuggage Type: {bag_type}\nBrand: {brand}\nProblem: {problem}\nRequirement: {message}',
  true,
  7
),
(
  'Customized Bags',
  'customized-bag-maker-noida',
  'Custom bag fabrication enquiries for corporate gifting, travel, school, utility, promotional, and custom dimension bag requirements.',
  'Hello Sakil Bag Store, I am interested in customized bags.\nName: {name}\nPhone: {phone}\nBag Type: {bag_type}\nQuantity: {quantity}\nCustomization: {customization}\nRequirement: {message}',
  true,
  8
),
(
  'Bulk Parts Requirement',
  'bulk-trolley-parts',
  'Wholesale and bulk trolley spare parts supplies for repair technicians, retail shops, and commercial luggage service centers.',
  'Hello Sakil Bag Store, I have a bulk trolley parts requirement.\nName: {name}\nPhone: {phone}\nParts List: {parts_list}\nEstimated Quantity: {quantity}\nRequirement: {message}',
  true,
  9
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Seed FAQs
INSERT INTO public.faq (question, answer, category, display_order)
VALUES
(
  'Do you repair trolley bags in Noida?',
  'Yes. SAKIL BAG STORE provides comprehensive trolley bag repair services including broken wheel replacement, telescopic handle fixing, lock replacement, runner & zipper repair, and seam stitching at our store in Sector 22, Noida.',
  'Trolley Repair',
  1
),
(
  'Can I replace damaged trolley wheels at your store?',
  'Yes. We stock and source various replacement trolley wheels including single wheels, dual spinner caster wheels, and polyurethane wheels for standard brands. You can bring your trolley or send wheel measurements via WhatsApp.',
  'Trolley Wheels',
  2
),
(
  'How do I identify my trolley wheel size before contacting?',
  'Measure three key dimensions: 1) Wheel outer diameter (in mm, commonly 40mm, 45mm, 50mm, 55mm, 60mm), 2) Wheel width/thickness, and 3) The axle bolt diameter and length. You can also photograph the wheel alongside a ruler and send it via our WhatsApp requirement form.',
  'Trolley Wheels',
  3
),
(
  'Can I send a photo of my trolley wheel or damaged handle?',
  'Yes! You can attach a photo directly through our online requirement form or click our WhatsApp button to send high-clarity photos. This helps us immediately inspect the screw pattern, mounting bracket, and axle configuration.',
  'General',
  4
),
(
  'Do you provide replacement telescopic trolley handles?',
  'Yes, we carry and repair various telescopic pull handles (internal and external rod designs), top carry handles, and side handles for trolley bags and travel luggage.',
  'Trolley Handles',
  5
),
(
  'Do you provide trolley locks and luggage hardware?',
  'Yes, we carry combination locks, TSA-type luggage lock replacements, slider pullers, bottom studs, and protective corner guards.',
  'Locks & Hardware',
  6
),
(
  'Do you repair general bags like backpacks and travel duffles?',
  'Yes. We repair backpacks, office laptop bags, duffles, gym bags, and travel luggage. Services include zipper runner replacement, zipper track stitching, strap reinforcement, and buckle replacement.',
  'Bag Repair',
  7
),
(
  'Do you make customized bags or accept bulk orders?',
  'Yes, we accept customized bag enquiries for travel, corporate, promotional, and utility requirements in Noida. You can share your specifications, reference images, and quantity via our form.',
  'Custom Bags',
  8
),
(
  'Where is SAKIL BAG STORE located in Noida?',
  'We are located at H8WV+F28, Chaura Raghunathpur, Raghunathpur, Sector 22, Noida, Uttar Pradesh 201307. You can click "Get Directions" on our website for direct navigation via Google Maps.',
  'Store Visit',
  9
),
(
  'How can I contact Mohd Shakil at SAKIL BAG STORE?',
  'You can call our direct business phone at 083838 04752 or send an instant WhatsApp enquiry through any of our service pages.',
  'Contact',
  10
);
