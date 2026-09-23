/**
 * SAKIL BAG STORE - WhatsApp Link Generator
 * Dynamically constructs click-to-chat WhatsApp URLs using business_settings
 */

export interface WhatsAppMessageParams {
  name: string;
  phone: string;
  serviceType: string;
  data?: Record<string, any>;
  message?: string;
}

export function generateWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { name, phone, serviceType, data = {}, message = '' } = params;

  if (serviceType.toLowerCase().includes('wheel')) {
    return `Hello Sakil Bag Store,

I found your website on Google.

I need a trolley wheel requirement.

Name: ${name || 'N/A'}
Phone: ${phone || 'N/A'}
Brand: ${data.brand || 'N/A'}
Trolley Type: ${data.trolley_type || 'N/A'}
Wheel Diameter: ${data.wheel_diameter || 'N/A'}
Wheel Width: ${data.wheel_width || 'N/A'}
Axle/Hole Diameter: ${data.axle_diameter || 'N/A'}
Axle Length: ${data.axle_length || 'N/A'}
Wheel Type: ${data.wheel_type || 'N/A'}
Quantity: ${data.quantity || 'N/A'}
Problem: ${data.problem || 'N/A'}
Additional Requirement: ${message || 'N/A'}`;
  }

  if (serviceType.toLowerCase().includes('handle')) {
    return `Hello Sakil Bag Store,

I found your website on Google.

I need trolley handle repair or replacement.

Name: ${name || 'N/A'}
Phone: ${phone || 'N/A'}
Brand: ${data.brand || 'N/A'}
Handle Type: ${data.handle_type || 'N/A'}
Approximate Length: ${data.length || 'N/A'}
Quantity: ${data.quantity || 'N/A'}
Requirement: ${message || 'N/A'}`;
  }

  if (serviceType.toLowerCase().includes('lock')) {
    return `Hello Sakil Bag Store,

I found your website on Google.

I need to check a trolley/bag lock requirement.

Name: ${name || 'N/A'}
Phone: ${phone || 'N/A'}
Lock Type: ${data.lock_type || 'N/A'}
Bag/Trolley Type: ${data.bag_type || 'N/A'}
Brand: ${data.brand || 'N/A'}
Quantity: ${data.quantity || 'N/A'}
Requirement: ${message || 'N/A'}`;
  }

  if (serviceType.toLowerCase().includes('part')) {
    return `Hello Sakil Bag Store,

I found your website on Google.

I need trolley parts.

Name: ${name || 'N/A'}
Phone: ${phone || 'N/A'}
Part Required: ${data.part_name || 'N/A'}
Size: ${data.size || 'N/A'}
Quantity: ${data.quantity || 'N/A'}
Brand/Model: ${data.brand || 'N/A'}
Requirement: ${message || 'N/A'}`;
  }

  if (serviceType.toLowerCase().includes('custom')) {
    return `Hello Sakil Bag Store,

I am interested in customized bags.

Name: ${name || 'N/A'}
Phone: ${phone || 'N/A'}
Bag Type: ${data.bag_type || 'N/A'}
Quantity: ${data.quantity || 'N/A'}
Customization: ${data.customization || 'N/A'}
Requirement: ${message || 'N/A'}`;
  }

  if (serviceType.toLowerCase().includes('bulk')) {
    return `Hello Sakil Bag Store,

I have a bulk trolley parts requirement.

Name: ${name || 'N/A'}
Phone: ${phone || 'N/A'}
Parts List: ${data.parts_list || 'N/A'}
Estimated Quantity: ${data.quantity || 'N/A'}
Requirement: ${message || 'N/A'}`;
  }

  // Default bag repair / trolley repair template
  return `Hello Sakil Bag Store,

I need bag/trolley repair assistance.

Name: ${name || 'N/A'}
Phone: ${phone || 'N/A'}
Bag Type: ${data.bag_type || 'N/A'}
Brand: ${data.brand || 'N/A'}
Problem: ${data.problem || 'N/A'}
Requirement: ${message || 'N/A'}`;
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  // Strip non-digit characters
  const cleanNumber = (whatsappNumber || '918383804752').replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}
