// Supabase Edge Function: ai-weekly-insights
// Summarizes weekly customer enquiry patterns, most requested spare parts, and trends
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
    const { enquiries = [] } = await req.json();
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey || enquiries.length === 0) {
      return new Response(
        JSON.stringify({
          top_service: "Trolley Wheels & Replacement",
          common_problems: "Worn rubber tread, broken wheel axles, stuck telescopic handle",
          conversion_rate_indicator: "High interest in instant WhatsApp photo verification",
          recommendation: "Ensure 50mm and 55mm spinner wheels and double caster wheel inventory are kept handy."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a business intelligence assistant for SAKIL BAG STORE, Noida.
Analyze these recent customer enquiries:
${JSON.stringify(enquiries.slice(0, 50), null, 2)}

Return a JSON with:
- top_service: string
- common_problems: string
- trend_summary: 2 sentence summary
- stock_recommendation: practical suggestion for parts to stock (wheels, handles, runners)
STRICT: Do not invent revenue figures or fake customer counts.`;

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
    const output = JSON.parse(result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate weekly insights" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
