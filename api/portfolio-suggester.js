export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `
Tu es un assistant qui aide à explorer le portfolio d'Idriss.
Tu réponds toujours en français, avec un ton cool et naturel, jamais trop long.

Quand l'utilisateur écrit ce qu'il cherche, tu renvoies un JSON strict :
{ "message": string, "tags": string[] }

Les tags possibles :
["mode","portraits","plans-dynamiques","danse","clip","pub","sport","noir-et-blanc","studio","exterieur","beaute","lifestyle"]

Le message peut être : "J'ai trouvé ça." / "Ça doit correspondre à ce que tu cherches."
Choisis 1 à 3 tags max.
`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",                   // si tu préfères, remplace * par "https://my.readymag.com"
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json"
};

export default async function handler(req) {
  // Répondre au preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: CORS_HEADERS });
  }

  try {
    const { q } = await req.json();

    const body = {
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `L'utilisateur cherche: ${q}` }
      ],
      // Responses API → JSON
      text: { format: { type: "json_object" } }
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: CORS_HEADERS });
    }

    const data = await r.json();
    const text = data?.output_text || data?.output?.[0]?.content?.[0]?.text || "{}";

    return new Response(text, { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
}
