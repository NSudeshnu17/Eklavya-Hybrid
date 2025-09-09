// sttBridge.js — opens /stt?mode=free, streams mic PCM16, dispatches 'voice:stream' events
let ws, ctx, node, gain, src, stream;
let running = false;

async function ensureWorklet(context) {
  const code = `
    class PCM16Worklet extends AudioWorkletProcessor {
      constructor(){ super(); this.b=[]; this.r=sampleRate/16000; this.a=0; }
      process(inputs){
        const ch = inputs[0][0]; if(!ch) return true;
        for(let i=0;i<ch.length;i++){
          this.a += 1;
          if (this.a >= this.r){ this.a -= this.r; this.b.push(ch[i]); }
          if (this.b.length >= 3200){ // ~200ms @16k
            const out = new Int16Array(this.b.length);
            for(let j=0;j<this.b.length;j++){
              let s = Math.max(-1, Math.min(1, this.b[j]));
              out[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            this.port.postMessage(out.buffer, [out.buffer]);
            this.b.length = 0;
          }
        }
        return true;
      }
    }
    registerProcessor('pcm16-worklet', PCM16Worklet);
  `;
  const url = URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
  await context.audioWorklet.addModule(url);
}

export async function startDictation(wsUrl) {
  if (running) return;
  running = true;

  // 1) WS (force free dictation with ?mode=free)
  ws = new WebSocket(wsUrl.includes('?') ? wsUrl : `${wsUrl}?mode=free`);
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => { try { ws.send(JSON.stringify({ action: 'start', mode: 'free' })); } catch {} };
  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      const text = data?.text;
      if (typeof text === 'string') {
        window.dispatchEvent(new CustomEvent('voice:stream', { detail: { text } }));
      }
    } catch {}
  };
  ws.onerror = () => {};
  ws.onclose = () => { ws = null; };

  // 2) Mic → AudioWorklet → PCM16 → WS
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
    await ensureWorklet(ctx);
    src = ctx.createMediaStreamSource(stream);
    node = new AudioWorkletNode(ctx, 'pcm16-worklet');
    gain = ctx.createGain(); gain.gain.value = 0;

    node.port.onmessage = (e) => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(e.data); // binary PCM16 chunks
    };

    src.connect(node).connect(gain).connect(ctx.destination);
  } catch (err) {
    running = false;
    throw err;
  }
}

export function stopDictation() {
  if (!running) return;
  running = false;

  try { ws && ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ action: 'stop' })); } catch {}
  try { ws && ws.close(); } catch {}
  ws = null;

  try { node && node.disconnect(); gain && gain.disconnect(); src && src.disconnect(); } catch {}
  try { ctx && ctx.close(); } catch {}
  try { stream && stream.getTracks().forEach(t => t.stop()); } catch {}
  node = gain = src = ctx = stream = null;
}
