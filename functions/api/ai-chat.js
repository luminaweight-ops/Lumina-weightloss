export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    const res = await fetch(`${env.CF_AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.CF_AI_GATEWAY_TOKEN}`
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [
          {
            role: "system",
            content:
              "Educational research information only. No dosing, no medical advice."
          },
          {
            role: "user",
            content: body.message
          }
        ]
      })
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
