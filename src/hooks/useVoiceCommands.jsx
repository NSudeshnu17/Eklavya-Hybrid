// useVoiceCommands.jsx — single persistent WS, PCM16 streaming, wake/commands modes
import { useState, useEffect, useCallback, useRef } from 'react';
import { playTTS } from "../utils/tts";

const WAKE_WORDS = ["buddy","buddie","buddi","budy","budde","buhdee","bud ee","baddy"];

export default function useVoiceCommands(commands = [], websocketUrl = 'ws://localhost:3000/stt') {
  const [isAwake, setIsAwake] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isListening, setIsListening] = useState(true);
  const [browserSupportsSpeechRecognition] = useState(true);

  // --- internals
  const wsRef = useRef(null);
  const didInitRef = useRef(false);       // Guard StrictMode double-mount
  const wakeTimerRef = useRef(null);
  const workletUrlRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const nodeRef = useRef(null);
  const gainRef = useRef(null);

  const lastTextRef = useRef("");         // dedupe frames w/o triggering renders
  const lastModeRef = useRef("wake");     // remember server mode
  const wsOpensRef = useRef(0);           // optional: debug counter

  // ---- SINGLE WebSocket (persists for session unless URL changes)
  useEffect(() => {
    if (didInitRef.current) return;       // StrictMode: prevent double init
    didInitRef.current = true;

    const ws = new WebSocket(websocketUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;
    wsOpensRef.current += 1;
    console.log(`[STT] WS opened x${wsOpensRef.current}`);

    ws.onopen = () => {
      try { ws.send(JSON.stringify({ action: 'start' })); } catch {}
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // De-dupe identical text frames using a ref (no state dep)
        if (typeof data?.text === 'string' && data.text && data.text === (lastTextRef.current || '')) {
          return;
        }

        // Canonical command from server → run callback
        if (data?.command) {
          const cmd = data.command.toLowerCase();
          const hit = (commands || []).find(c => c.command.toLowerCase() === cmd);
          if (hit) { hit.callback?.(); }
        }

        // Track server mode transitions
        if (data?.mode) lastModeRef.current = data.mode;

        // Awake while server is in commands/free or on explicit wake
        if (data?.wake || data?.mode === 'free' || data?.mode === 'commands') {
          setIsAwake(true);
          if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
          wakeTimerRef.current = setTimeout(() => {
            setIsAwake(false);
            try { wsRef.current?.send(JSON.stringify({ mode: 'wake' })); } catch {}
          }, 12000);
        } else if (data?.mode === 'wake') {
          setIsAwake(false);
          if (wakeTimerRef.current) { clearTimeout(wakeTimerRef.current); wakeTimerRef.current = null; }
        }

        if (typeof data?.text === 'string') {
          lastTextRef.current = data.text;
          setFinalTranscript(data.text);
        }
      } catch {}
    };

    ws.onerror = (e) => console.error('STT WS error:', e);
    ws.onclose = () => { wsRef.current = null; console.log('[STT] WS closed'); };

    // no cleanup here; keep single WS for the whole session
  }, [websocketUrl, commands]);   // IMPORTANT: no finalTranscript in deps

  // ---- Mic → AudioWorklet → PCM16@16k → WS (binds only while listening)
  async function ensureWorklet(ctx){
    if (workletUrlRef.current) return;
    const code = `
      class PCM16Worklet extends AudioWorkletProcessor {
        constructor(){ super(); this.b=[]; this.r=sampleRate/16000; this.a=0; }
        process(inputs){
          const ch = inputs[0][0]; if(!ch) return true;
          for(let i=0;i<ch.length;i++){
            this.a += 1;
            if (this.a >= this.r){ this.a -= this.r; this.b.push(ch[i]); }
            if (this.b.length >= 320){
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
    await ctx.audioWorklet.addModule(url);
    workletUrlRef.current = url;
  }

  useEffect(() => {
    let stopped = false;
    if (!isListening) return;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation:true, noiseSuppression:true, autoGainControl:false, channelCount:1, sampleRate:48000 }
        });
        streamRef.current = stream;

        const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
        audioCtxRef.current = ctx;
        await ensureWorklet(ctx);

        const src = ctx.createMediaStreamSource(stream);
        const node = new AudioWorkletNode(ctx, 'pcm16-worklet');
        const gain = ctx.createGain(); gain.gain.value = 0.0; // silent

        node.port.onmessage = (e) => {
          const ws = wsRef.current;
          if (stopped) return;
          if (ws && ws.readyState === WebSocket.OPEN) ws.send(e.data);
        };

        src.connect(node).connect(gain).connect(ctx.destination);
        nodeRef.current = node; gainRef.current = gain;

        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          try { ws.send(JSON.stringify({ action:'start' })); } catch {}
        }
      } catch (err) { console.error('Mic/worklet error:', err); }
    };
    start();

    return () => {
      stopped = true;
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) { try { ws.send(JSON.stringify({ action:'stop' })); } catch {} }
      try { nodeRef.current?.disconnect(); gainRef.current?.disconnect(); } catch {}
      try { audioCtxRef.current?.close(); } catch {}
      try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch {}
      nodeRef.current = null; gainRef.current = null; audioCtxRef.current = null; streamRef.current = null;
    };
  }, [isListening]);

  // (optional) local wake assist
  useEffect(() => {
    const t = (finalTranscript || "").toLowerCase();
    if (!isAwake && WAKE_WORDS.some(w => t.includes(w))) {
      setIsAwake(true);
      try { wsRef.current?.send(JSON.stringify({ mode: 'commands' })); } catch {}
      if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
      wakeTimerRef.current = setTimeout(() => {
        setIsAwake(false);
        try { wsRef.current?.send(JSON.stringify({ mode: 'wake' })); } catch {}
      }, 8000);
    }
  }, [finalTranscript, isAwake]);

  // expose
  return { isAwake, setIsAwake, isListening, setIsListening, finalTranscript, browserSupportsSpeechRecognition };
}
