// src/utils/tts.js
export async function playTTS(text, baseUrl = "http://localhost:3000") {
  if (!text || !text.trim()) return;
  const res = await fetch(`${baseUrl}/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
  const blob = await res.blob(); // audio/wav
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  // optional: make sure audio plays even on strict autoplay policies
  audio.autoplay = true;
  audio.playsInline = true;
  await audio.play().catch(() => {});
  // (optional) clean up the blob URL later
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
