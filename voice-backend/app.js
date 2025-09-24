
// const path = require("path");
// const http = require("http");
// const express = require("express");
// const { WebSocketServer } = require("ws");
// const { spawn } = require("child_process");

// const PORT = process.env.PORT || 3000;

// // Python inside venv
// const PYTHON = path.resolve(__dirname, "venv", "Scripts", "python.exe");
// const ASR_SCRIPT = path.resolve(__dirname, "voice_asr.py");

// const app = express();
// const server = http.createServer(app);

// app.get("/", (_, res) =>
//   res.status(200).send("STT WebSocket server (Faster-Whisper, per-client)")
// );

// const wss = new WebSocketServer({ server, path: "/stt" });

// // --- safety limits ---
// const MAX_CLIENTS = 5;
// const MAX_IDLE_MINUTES = 10;

// wss.on("connection", (ws) => {
//   if (wss.clients.size > MAX_CLIENTS) {
//     console.warn("[WS] Too many clients, rejecting connection");
//     ws.close();
//     return;
//   }

//   console.log("[WS] connected");

//   // Spawn one Python process per client
//   const py = spawn(PYTHON, [ASR_SCRIPT]);

//   let lastActivity = Date.now();

//   // --- Idle timeout check ---
//   const idleCheck = setInterval(() => {
//     if (Date.now() - lastActivity > MAX_IDLE_MINUTES * 60 * 1000) {
//       console.log("[WS] idle timeout, closing client");
//       ws.close();
//     }
//   }, 60 * 1000);

//   // --- Heartbeat ping (safety) ---
//   const heartbeat = setInterval(() => {
//     if (ws.readyState === ws.OPEN) {
//       ws.ping();
//     }
//   }, 20000);

//   // --- Handle Python stdout ---
//   py.stdout.on("data", (data) => {
//     const lines = data.toString().trim().split("\n");
//     for (const line of lines) {
//       if (!line) continue;
//       try {
//         const msg = JSON.parse(line);

//         if (msg.event === "loading_model") {
//           console.log(
//             `[Python] Loading model ${msg.model} on ${msg.device} (${msg.compute_type})`
//           );
//         } else if (msg.event === "ready") {
//           console.log("[Python] Ready:", msg.message);
//         } else if (msg.event === "transcription") {
//           console.log("[Python] ✅", msg.text);
//           lastActivity = Date.now();
//           ws.send(JSON.stringify({ text: msg.text, final: true }));
//         } else {
//           console.log("[Python]", msg);
//         }
//       } catch {
//         console.log("[Python raw]", line);
//       }
//     }
//   });

//   // --- Handle Python stderr ---
//   py.stderr.on("data", (data) => {
//     console.error("[Python error]", data.toString());
//   });

//   // --- Handle Python exit ---
//   py.on("close", (code) => {
//     console.log("[Python exited]", code);
//     clearInterval(idleCheck);
//     clearInterval(heartbeat);
//     try {
//       ws.send(JSON.stringify({ error: "ASR process exited" }));
//     } catch {}
//     ws.close();
//   });

//   // --- Handle WS close ---
//   ws.on("close", () => {
//     console.log("[WS] closed");
//     clearInterval(idleCheck);
//     clearInterval(heartbeat);
//     py.kill("SIGINT");
//   });
// });

// server.listen(PORT, () => {
//   console.log(`HTTP listening on http://localhost:${PORT} (WS: /stt)`);
// });
const path = require("path");
const http = require("http");
const express = require("express");
const { WebSocketServer } = require("ws");
const { spawn } = require("child_process");

const PORT = process.env.PORT || 3000;

// Python inside venv
const PYTHON = path.resolve(__dirname, "venv", "Scripts", "python.exe");
const ASR_SCRIPT = path.resolve(__dirname, "voice_asr.py");

const app = express();
const server = http.createServer(app);

app.get("/", (_, res) =>
  res.status(200).send("STT WebSocket server (Faster-Whisper, per-client)")
);

const wss = new WebSocketServer({ server, path: "/stt" });

// --- safety limits ---
const MAX_CLIENTS = 5;
const MAX_IDLE_MINUTES = 10;

wss.on("connection", (ws) => {
  if (wss.clients.size > MAX_CLIENTS) {
    console.warn("[WS] Too many clients, rejecting connection");
    ws.close();
    return;
  }

  console.log("[WS] connected");

  // Spawn one Python process per client
  const py = spawn(PYTHON, [ASR_SCRIPT]);

  let lastActivity = Date.now();

  // --- Idle timeout check ---
  const idleCheck = setInterval(() => {
    if (Date.now() - lastActivity > MAX_IDLE_MINUTES * 60 * 1000) {
      console.log("[WS] idle timeout, closing client");
      ws.close();
    }
  }, 60 * 1000);

  // --- Heartbeat ping ---
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) ws.ping();
  }, 20000);

  // --- Forward audio from WS → Python stdin ---
  ws.on("message", (data) => {
    if (Buffer.isBuffer(data)) {
      py.stdin.write(data); // PCM16 audio chunk
      lastActivity = Date.now();
    }
  });

  // --- Handle Python stdout ---
  py.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (!line) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.event === "loading_model") {
          console.log(
            `[Python] Loading model ${msg.model} on ${msg.device} (${msg.compute_type})`
          );
        } else if (msg.event === "ready") {
          console.log("[Python] Ready:", msg.message);
        } else if (msg.event === "transcription") {
          console.log("[Python] ✅", msg.text);
          lastActivity = Date.now();
          ws.send(JSON.stringify({ text: msg.text, final: true }));
        } else {
          console.log("[Python]", msg);
        }
      } catch {
        console.log("[Python raw]", line);
      }
    }
  });

  // --- Handle Python stderr ---
  py.stderr.on("data", (data) => {
    console.error("[Python error]", data.toString());
  });

  // --- Handle Python exit ---
  py.on("close", (code) => {
    console.log("[Python exited]", code);
    clearInterval(idleCheck);
    clearInterval(heartbeat);
    try {
      ws.send(JSON.stringify({ error: "ASR process exited" }));
    } catch {}
    ws.close();
  });

  // --- Handle WS close ---
  ws.on("close", () => {
    console.log("[WS] closed");
    clearInterval(idleCheck);
    clearInterval(heartbeat);
    try { py.stdin.end(); } catch {}
    py.kill("SIGINT");
  });
});

server.listen(PORT, () => {
  console.log(`HTTP listening on http://localhost:${PORT} (WS: /stt)`);
});
