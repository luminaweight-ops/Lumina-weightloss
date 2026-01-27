export async function onRequestPost({ request, env }) {
  const { message } = await request.json();

  // Cloudflare AI Gateway "compat" base URL from your screenshot:
  const base = `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_GATEWAY_ID}/compat`;

  const resp = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-5", // or whichever you select in Gateway
      messages: [
        {
          role: "system",
          content:
            "You are an informational assistant. Provide high-level, non-medical info only. No dosing, mixing, injection, cycle advice. Encourage consulting a qualified clinician. State 'research use only' and include safety cautions."
        },
        { role: "user", content: message }
      ]
    }),
  });

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content ?? "No response";

  return new Response(JSON.stringify({ text }), {
    headers: { "Content-Type": "application/json" },
  });
}
