// Supabase Edge Function: whatsapp-webhook
// Future-ready webhook handler for WhatsApp Business Cloud API integration
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const VERIFY_TOKEN = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN") || "sakil_bag_store_webhook_token";

serve(async (req) => {
  const url = new URL(req.url);

  // Webhook verification endpoint (GET)
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // Incoming webhook notifications (POST)
  if (req.method === "POST") {
    try {
      const payload = await req.json();
      console.log("Incoming WhatsApp Webhook event:", JSON.stringify(payload));
      // Handled asynchronously in future version
      return new Response(JSON.stringify({ status: "EVENT_RECEIVED" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (_err) {
      return new Response("Invalid request", { status: 400 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
