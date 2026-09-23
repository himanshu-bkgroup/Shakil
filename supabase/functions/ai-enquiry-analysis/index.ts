// Supabase Edge Function: ai-enquiry-analysis
// Analyzes incoming trolley/bag enquiries and determines priority, service classification, and brief summary
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
    const { enquiry } = await req.json();
    if (!enquiry) {
      return new Response(JSON.stringify({ error: "Enquiry data is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      // Graceful fallback if GEMINI_API_KEY is not configured yet
      const fallbackPriority = (enquiry.phone && enquiry.requirement_data?.quantity) ? "HIGH" : "MEDIUM";
      return new Response(
        JSON.stringify({
          priority: fallbackPriority,
          service_category: enquiry.requirement_type || "Trolley Bag Repair",
          ai_summary: `Enquiry from ${enquiry.name || "Customer"} for ${enquiry.requirement_type || "Bag/Trolley Requirement"}. Contact: ${enquiry.phone}`,
          suggested_action: "Call customer or verify replacement part photo on WhatsApp."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a practical assistant for SAKIL BAG STORE, a bag and trolley repair specialist in Noida owned by Mohd Shakil.
Analyze this customer enquiry and return ONLY a strict JSON object with these keys:
- priority: "LOW" | "MEDIUM" | "HIGH" (HIGH if wheel dimensions/urgent repair/bulk quantity provided)
- service_category: string (e.g. "Trolley Wheels", "Trolley Handles", "Trolley Locks", "Bag Repair", "Luggage Repair", "Custom Bags")
- ai_summary: concise 1-2 sentence factual summary for admin Mohd Shakil
- suggested_action: short factual instruction (e.g., "Verify wheel axle diameter photo on WhatsApp")

STRICT RULES:
- DO NOT invent prices, parts in stock, delivery guarantees, or fake claims.
- Base analysis ONLY on provided text.

Enquiry Data:
${JSON.stringify(enquiry, null, 2)}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    const result = await response.json();
    const textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = textOutput ? JSON.parse(textOutput) : {};

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to analyze enquiry" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
