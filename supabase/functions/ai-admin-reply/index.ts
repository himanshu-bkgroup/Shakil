// Supabase Edge Function: ai-admin-reply
// Generates polite, professional factual reply templates for admin Mohd Shakil without inventing prices or stock
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { enquiry, channel = "whatsapp" } = await req.json();
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          suggested_reply: `Hello ${enquiry.name || "Sir/Madam"}, thank you for reaching out to SAKIL BAG STORE (Sector 22, Noida). We received your requirement for ${enquiry.requirement_type || "repair/parts"}. Please share photos or visit our store at Chaura Raghunathpur, Sector 22, Noida so we can inspect and assist you accurately.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are assisting Mohd Shakil, owner of SAKIL BAG STORE (Sector 22 Noida, Phone: 083838 04752).
Draft a concise, polite, professional ${channel === "whatsapp" ? "WhatsApp message" : "SMS/Email"} reply to this customer enquiry.

RULES:
- Acknowledge their exact requirement (wheel, handle, lock, bag repair, etc.).
- Request clear photo of damaged part / measurement / store visit if needed.
- Mention store address: Chaura Raghunathpur, Sector 22, Noida.
- DO NOT invent prices, parts availability, guarantees, or delivery dates.
- Output ONLY the message text.

Enquiry:
${JSON.stringify(enquiry, null, 2)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const result = await response.json();
    const replyText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return new Response(JSON.stringify({ suggested_reply: replyText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate reply" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
