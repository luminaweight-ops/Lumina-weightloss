export async function onRequestPost({ request, env }) {
  try {
    const { message, product } = await request.json();

    // Basic input clamp
    const userMsg = String(message || "").slice(0, 2000);

    const system = `
You are Lumina Weight's Research Info Assistant.
Rules:
- Educational info only. No medical advice.
- Do NOT provide dosing, protocols, injection instructions, reconstitution steps, mixing volumes, “how to use”, stacks, cycles, or purchasing advice.
- If asked for any of the above, refuse briefly and suggest speaking to a licensed clinician.
- Focus on: high-level mechanism, research status, general risks, study context, definitions (e.g. DAC), and general storage/handling concepts without instructions.
- Keep answers concise and clear.
`;

    const catalogHint = product
      ? `User selected product: ${product}. If you have specific info for it, summarise at a high level.`
      : `No product selected. Offer to choose one from the list.`;

    const payload = {
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "system", content: catalogHint },
        { role: "user", content: userMsg }
      ],
      // extra safety belt
      max_output_tokens: 300
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const errText = await r.text();
      return new Response(JSON.stringify({ error: "AI request failed", detail: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await r.json();

    // Responses API returns text across output items; this is a simple extractor:
    const text =
      (data.output_text) ||
      (data.output?.map(o => o.content?.map(c => c.text).join("")).join("\n")) ||
      "No response.";

    return new Response(JSON.stringify({ reply: text }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Bad request", detail: String(e) }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
