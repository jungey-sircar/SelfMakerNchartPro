const MODEL = "nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4:together";

const SYSTEM_PROMPT = [
  "You are an expert senior frontend engineer and website designer.",
  "Return valid JSON only with these keys: title, description, html, tsx, notes.",
  "The html key must contain a complete standalone HTML document with embedded CSS in a <style> tag.",
  "The tsx key must contain a single Next.js component that matches the design.",
  "Do not use markdown fences. Do not include commentary outside the JSON object.",
  "Keep the site responsive, polished, and ready for a real product launch.",
].join(" ");

function stripCodeFences(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json|tsx|html)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  return trimmed;
}

function parseStructuredAnswer(text: string) {
  const cleaned = stripCodeFences(text);

  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.HF_TOKEN;

  if (!apiKey) {
    return Response.json(
      { error: "Missing HF_TOKEN in the server environment." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt) {
    return Response.json(
      { error: "A prompt is required." },
      { status: 400 }
    );
  }

  const upstream = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!upstream.ok) {
    const errorText = await upstream.text().catch(() => "Unknown upstream error.");
    return Response.json(
      { error: "Nemotron request failed.", details: errorText },
      { status: upstream.status }
    );
  }

  const payload = await upstream.json();
  const answer = payload?.choices?.[0]?.message?.content ?? "";

  return Response.json({
    answer,
    parsed: parseStructuredAnswer(answer),
  });
}