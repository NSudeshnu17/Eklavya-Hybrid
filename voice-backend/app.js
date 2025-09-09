// app.js — Vosk (offline, low-latency) STT + Piper TTS
// WS STT: ws://localhost:3000/stt  (expects PCM16 mono @ 16kHz binary frames)
// HTTP TTS: POST http://localhost:3000/speak  {text}

const fs = require("fs");
const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const { spawn } = require("child_process");
const vosk = require("vosk");

// ---------- CONFIG ----------
const SAMPLE_RATE = 16000;
const MODEL_DIR = path.join(__dirname, "models", "vosk-model-en-in-0.5", "vosk-model-en-in-0.5"); // put en-IN model here
const COMMAND_WINDOW_MS = 12000; // time awake after wake word (increased)

// Piper (TTS)
const PIPER_BIN = process.platform === "win32"
  ? path.join(__dirname, "bin", "piper", "piper.exe")
  : path.join(__dirname, "bin", "piper");
const PIPER_MODEL_FILE  = path.join(__dirname, "models", "piper-voice", "voice.onnx");
const PIPER_CONFIG_FILE = path.join(__dirname, "models", "piper-voice", "voice.onnx.json");

// ---------- SANITY ----------
if (!fs.existsSync(MODEL_DIR)) throw new Error("Missing Vosk model at " + MODEL_DIR);
if (!fs.existsSync(PIPER_BIN)) throw new Error("Missing Piper binary");
if (!fs.existsSync(PIPER_MODEL_FILE) || !fs.existsSync(PIPER_CONFIG_FILE)) {
  throw new Error("Missing Piper voice files");
}

// ---------- VOSK MODEL ----------
vosk.setLogLevel(0);
const voskModel = new vosk.Model(MODEL_DIR);

// ---------- EXPRESS ----------
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (_, res) => res.send("Voice backend up (WS STT: /stt, HTTP TTS: /speak)"));

// ----- TTS (Piper) -----
app.post("/speak", async (req, res) => {
  try {
    const text = (req.body?.text || "").toString().trim();
    if (!text) return res.status(400).json({ error: "No text" });

    const args = ["-m", PIPER_MODEL_FILE, "-c", PIPER_CONFIG_FILE, "-f", "wav", "-o", "-"];
    const p = spawn(PIPER_BIN, args);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="tts.wav"');

    p.stdout.pipe(res);
    p.stderr.on("data", d => process.stderr.write(d));
    p.on("error", () => { if (!res.headersSent) res.status(500).json({ error: "Piper spawn failed" }); try { res.end(); } catch {} });
    p.on("close", code => { if (code !== 0 && !res.headersSent) res.status(500).json({ error: "Piper failed" }); });

    p.stdin.setDefaultEncoding("utf-8");
    p.stdin.write(text + "\n");
    p.stdin.end();
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ error: "TTS error" });
  }
});

const server = http.createServer(app);

// ---------- Commands / Wake ----------
const WAKE_WORDS = [
  "buddy","buh dee","hey buddy","ok buddy","buddee",
  "buddie","buddi","budy","budde","buhdee","bud ee","baddy"
];

const COMMANDS_CANON = [
  "open chat","close chat","enter cockpit","back to view",
  "enter cockpit","open cockpit","close cockpit","back to view",
  "show hotspots","hide hotspots","mute audio","unmute audio",
  "open altimeter","close altimeter","open map","close map",
  "open landing","close landing","open radio","close radio",
  "open battery bus","close battery bus","open pfd","close pfd",
  "open engine","close engine","close checklist"
];
const COMMAND_ALIASES = {
  "open chatbot":"open chat","open the chat":"open chat","open the chatbot":"open chat",
  "open chart":"open chat","open chad":"open chat","open chaat":"open chat","oye chat":"open chat","oye chad":"open chat",
  "close chatbot":"close chat","close the chat":"close chat","close the chatbot":"close chat",
  "enter cockpit":"enter cockpit", "into a cockpit":"enter cockpit",
  "open p f d":"open pfd","close p f d":"close pfd"
};
const COMMAND_GRAMMAR = [...new Set([...COMMANDS_CANON, ...Object.keys(COMMAND_ALIASES)])];

function heardWake(t){ t=(t||"").toLowerCase(); return WAKE_WORDS.some(w=>t.includes(w)); }
function normalizeLite(t=""){
  return t.toLowerCase()
    .replace(/\bp\s*[\.\-]?\s*f\s*[\.\-]?\s*d\b/g, "pfd")
    .replace(/\s+/g," ")
    .trim();
}
function toCanonicalCommand(text){
  const t = normalizeLite(text);
  if (!t) return null;
  if (COMMAND_ALIASES[t]) return COMMAND_ALIASES[t];
  if (COMMANDS_CANON.includes(t)) return t;
  let best=null,score=0;
  for (const c of COMMANDS_CANON){
    const A=new Set(t.split(" ")), B=new Set(c.split(" "));
    let s=0; for(const w of A) if(B.has(w)) s++;
    if (t.startsWith(c)) s+=1.5;
    if (s>score){score=s;best=c;}
  }
  return (best && score>=2) ? best : null;
}

// Build recognizer per mode (use grammar to bias)
function makeRecognizer(mode){
  if (mode === "wake")     return new vosk.Recognizer({ model: voskModel, sampleRate: SAMPLE_RATE, grammar: WAKE_WORDS });
  if (mode === "commands") return new vosk.Recognizer({ model: voskModel, sampleRate: SAMPLE_RATE, grammar: COMMAND_GRAMMAR });
  return new vosk.Recognizer({ model: voskModel, sampleRate: SAMPLE_RATE }); // free
}

// ---------- WS: /stt ----------
const wss = new WebSocketServer({ server, path: "/stt" });

wss.on("connection", (ws, req) => {
  let mode = "wake";
  try {
    const u = new URL(req?.url || "", "http://localhost");
    if (u.searchParams.get("mode") === "free") mode = "free";
  } catch {}

  let rec = makeRecognizer(mode);
  let streaming = false;
  let lastWakeAt = 0;

  const switchMode = (m) => { try{ rec.free(); } catch{}; mode = m; rec = makeRecognizer(mode); };

  ws.send(JSON.stringify({ hello: "stt", mode }));

  ws.on("message", (msg, isBinary) => {
    if (!isBinary) {
      let data; try { data = JSON.parse(msg.toString()); } catch { return; }
      const action = (data?.action || "").toLowerCase();

      if (action === "start") { streaming = true; ws.send(JSON.stringify({ ready:true, mode })); return; }
      if (action === "stop")  { streaming = false; const r = rec.finalResult?.() || rec.result?.(); ws.send(JSON.stringify({ final:true, text:(r?.text||"").toLowerCase(), mode })); return; }
      if (action === "reset") { rec.reset(); ws.send(JSON.stringify({ reset:true, mode })); return; }

      if (data?.mode && ["wake","free","commands"].includes(data.mode)) {
        switchMode(data.mode);
        if (mode === "commands") lastWakeAt = Date.now();
        ws.send(JSON.stringify({ mode }));
      }
      return;
    }

    if (!streaming) return;

    // Feed PCM16 chunk to recognizer
    const ok = rec.acceptWaveform(msg);
    if (ok) {
      const r = rec.result();
      const text = (r?.text || "").toLowerCase().trim();
      if (!text) return;

      // Wake on full result
      if (mode === "wake" && heardWake(text)) {
        lastWakeAt = Date.now();
        switchMode("commands");
        ws.send(JSON.stringify({ wake:true, mode:"commands" }));
        setTimeout(() => { switchMode("wake"); ws.send(JSON.stringify({ mode:"wake" })); }, COMMAND_WINDOW_MS);
      }

      if (mode === "commands" || (lastWakeAt && (Date.now()-lastWakeAt) < COMMAND_WINDOW_MS)) {
        const canon = toCanonicalCommand(text);
        if (canon) ws.send(JSON.stringify({ command: canon, mode:"commands" }));
      }

      ws.send(JSON.stringify({ final:true, text, mode }));
    } else {
      // Partial result: allows faster wake
      const p = rec.partialResult();
      const partial = (p?.partial || "").toLowerCase().trim();
      if (!partial) return;

      if (mode === "wake" && heardWake(partial)) {
        lastWakeAt = Date.now();
        switchMode("commands");
        ws.send(JSON.stringify({ wake:true, mode:"commands" }));
        setTimeout(() => { switchMode("wake"); ws.send(JSON.stringify({ mode:"wake" })); }, COMMAND_WINDOW_MS);
      }

      ws.send(JSON.stringify({ partial:true, text: partial, mode }));
    }
  });

  ws.on("close", () => { try { rec.free(); } catch {} });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP listening on http://localhost:${PORT} (WS: /stt, /speak)`);
  console.log(`STT expects raw PCM16 mono @ ${SAMPLE_RATE} Hz over WS binary frames`);
});
