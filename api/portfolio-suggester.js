export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `
Tu es un assistant qui aide à explorer le portfolio d'Idriss.
Tu réponds toujours en en français ou en anglais en fonction de la langue utilisé par l'utilsateur (si francaçis répondre en français, si autre langue répondre en anglais), avec un ton cool et naturel, jamais trop long.

Quand l'utilisateur écrit ce qu'il cherche, tu renvoies un JSON strict :
{ "message": string, "tags": string[] }

Les tags possibles :
["mode","portraits","plans-dynamiques","danse","clip","pub","sport","noir-et-blanc","studio","exterieur","beaute","lifestyle"]

Le champ "message" doit ressembler à :
- "J'ai trouvé ça."
- "Ça doit correspondre à ce que tu cherches."
- "Regarde, ça colle bien avec ton style."

Sélectionne 1 à 3 tags max selon la demande.
Reste cool, accessible, jamais robotique.
`;

export default async function handler(req) {
  try {
    const { q } = await req.json();

    const body = {
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `L'utilisateur cherche: ${q}` }
      ],
      text: { format: "json" } // 🔥 Correction ici
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    const data = await response.json();
    const text = data?.output?.[0]?.content?.[0]?.text || "{}";
    return new Response(text, {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
