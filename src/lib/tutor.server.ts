/** AI tutor helper — server only. */
export type TutorMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You are BoardBuddy's AI tutor for CBSE Class 10 students in India. Explain concepts step by step in simple language, " +
  "mix English with easy Hindi words when it helps, keep answers short (under 200 words), and end with one quick tip or " +
  "practice question. Use the NCERT syllabus as your reference.";

export async function askTutorAI(messages: TutorMessage[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured yet.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-12)],
    }),
  });

  if (res.status === 429) throw new Error("Too many questions right now. Please try again in a minute.");
  if (!res.ok) throw new Error("The tutor is unavailable right now. Please try again.");

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "Sorry, I could not answer that. Try rephrasing your doubt.";
}
