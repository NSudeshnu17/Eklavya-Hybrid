
# import sys, queue, time, json
# import numpy as np
# import sounddevice as sd
# import torch
# from faster_whisper import WhisperModel

# # ---------------------
# # CONFIG
# # ---------------------
# MODEL_SIZE = "small"
# DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# SAMPLE_RATE = 16000
# BASE_THRESHOLD = 0.012    # base sensitivity
# SILENCE_DURATION = 0.6    # seconds of silence to stop
# LANGUAGE = "en"
# BEAM_SIZE = 3
# COMPUTE_TYPE = "float16" if DEVICE == "cuda" else "int8"

# # ---------------------
# # MODEL INIT
# # ---------------------
# print(json.dumps({
#     "event": "loading_model",
#     "model": MODEL_SIZE,
#     "device": DEVICE,
#     "compute_type": COMPUTE_TYPE
# }))
# sys.stdout.flush()

# model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)

# # ---------------------
# # AUDIO QUEUE
# # ---------------------
# q = queue.Queue()

# def audio_callback(indata, frames, time_info, status):
#     if status:
#         print(json.dumps({"event": "audio_status", "status": str(status)}))
#         sys.stdout.flush()
#     if indata.ndim > 1:
#         indata = np.mean(indata, axis=1)  # convert to mono
#     q.put(indata.copy())

# # ---------------------
# # MAIN LOOP
# # ---------------------
# def main():
#     buffer = []
#     speaking = False
#     last_voice_time = None
#     adaptive_thresh = BASE_THRESHOLD

#     with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, dtype="float32", callback=audio_callback):
#         print(json.dumps({"event": "ready", "message": "Listening..."}))
#         sys.stdout.flush()

#         try:
#             while True:
#                 try:
#                     data = q.get(timeout=0.5)
#                 except queue.Empty:
#                     continue

#                 # --- Adaptive threshold ---
#                 energy = np.sqrt(np.mean(data**2))
#                 adaptive_thresh = 0.9 * adaptive_thresh + 0.1 * energy  # smooth noise floor

#                 if energy > max(BASE_THRESHOLD, adaptive_thresh * 1.2):
#                     buffer.append(data)
#                     speaking = True
#                     last_voice_time = time.time()
#                 elif speaking:
#                     buffer.append(data)
#                     if time.time() - last_voice_time > SILENCE_DURATION:
#                         # End utterance
#                         audio = np.concatenate(buffer)
#                         buffer = []
#                         speaking = False

#                         print(json.dumps({"event": "processing"}))
#                         sys.stdout.flush()

#                         try:
#                             segments, _ = model.transcribe(
#                                 audio,
#                                 beam_size=BEAM_SIZE,
#                                 language=LANGUAGE,
#                                 vad_filter=True
#                             )
#                             text = " ".join(seg.text for seg in segments).strip()

#                             print(json.dumps({
#                                 "event": "transcription",
#                                 "text": text,
#                                 "final": True
#                             }))
#                             sys.stdout.flush()
#                         except Exception as e:
#                             print(json.dumps({"event": "error", "message": str(e)}))
#                             sys.stdout.flush()
#         except KeyboardInterrupt:
#             print(json.dumps({"event": "stopping"}))
#             sys.stdout.flush()

# if __name__ == "__main__":
#     main()
import sys, time, json, numpy as np, torch
from faster_whisper import WhisperModel

# ---------------------
# CONFIG
# ---------------------
MODEL_SIZE = "small"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
SAMPLE_RATE = 16000
LANGUAGE = "en"
BEAM_SIZE = 3
COMPUTE_TYPE = "float16" if DEVICE == "cuda" else "int8"

CHUNK_SIZE = 3200  # ~0.2s of audio @16kHz
SILENCE_FRAMES = 8  # ~1.6s silence before finalizing

# ---------------------
# MODEL INIT
# ---------------------
print(json.dumps({
    "event": "loading_model",
    "model": MODEL_SIZE,
    "device": DEVICE,
    "compute_type": COMPUTE_TYPE
}))
sys.stdout.flush()

model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)

print(json.dumps({"event": "ready", "message": "Listening..."}))
sys.stdout.flush()

# ---------------------
# PCM Reader (stdin)
# ---------------------
buffer = b""
audio_frames = []
silence_count = 0

def rms_energy(sig):
    return np.sqrt(np.mean(sig ** 2)) if len(sig) > 0 else 0

try:
    while True:
        chunk = sys.stdin.buffer.read(CHUNK_SIZE)
        if not chunk:
            time.sleep(0.01)
            continue

        buffer += chunk
        if len(buffer) < CHUNK_SIZE:  # wait until full frame
            continue

        # Convert PCM16 → float32 numpy
        pcm16 = np.frombuffer(buffer[:CHUNK_SIZE], dtype=np.int16).astype(np.float32) / 32768.0
        buffer = buffer[CHUNK_SIZE:]

        energy = rms_energy(pcm16)
        if energy > 0.01:  # speaking
            audio_frames.append(pcm16)
            silence_count = 0
        else:  # silence
            if audio_frames:
                silence_count += 1
                audio_frames.append(pcm16)

                if silence_count >= SILENCE_FRAMES:
                    # Finalize utterance
                    audio = np.concatenate(audio_frames)
                    audio_frames = []
                    silence_count = 0

                    print(json.dumps({"event": "processing"}))
                    sys.stdout.flush()

                    try:
                        segments, _ = model.transcribe(
                            audio,
                            beam_size=BEAM_SIZE,
                            language=LANGUAGE,
                            vad_filter=True
                        )
                        text = " ".join(seg.text for seg in segments).strip()
                        if text:
                            print(json.dumps({
                                "event": "transcription",
                                "text": text,
                                "final": True
                            }))
                            sys.stdout.flush()
                    except Exception as e:
                        print(json.dumps({"event": "error", "message": str(e)}))
                        sys.stdout.flush()
except KeyboardInterrupt:
    print(json.dumps({"event": "stopping"}))
    sys.stdout.flush()
