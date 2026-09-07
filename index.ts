import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { message, state } = await request.json();
  if (typeof message !== "string" || !message.trim()) {
    return new Response(JSON.stringify({ error: "A message is required." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  const apiUrl = Deno.env.get("OPENAI_COMPATIBLE_URL") ??
    "https://api.openai.com/v1/chat/completions";
  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not configured." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const system = `You are a schedule assistant. Current schedule state is JSON: ${
    JSON.stringify(state)
  }.
When a task has no time and no deadline, ask the user for urgency from 1 to 10 before proposing placement.
Respect the five daily prayers and sunnah, school, family responsibilities, Quran, sleep, and existing commitments.
Do not silently overwrite the schedule. Return a concise explanation and a proposed change for confirmation.`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok) {
    return new Response(await response.text(), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = await response.json();
  const reply = result.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    return new Response(JSON.stringify({
      error: "The AI provider returned no usable reply.",
      providerResponse: result,
    }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ reply }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
