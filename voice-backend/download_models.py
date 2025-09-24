import os
import urllib.request
import zipfile

model_dir = "voice-backend/models"
os.makedirs(model_dir, exist_ok=True)

# -------------------------------
# 1. Vosk model (English-Indian)
# -------------------------------
vosk_url = "https://alphacephei.com/vosk/models/vosk-model-en-in-0.5.zip"
vosk_zip = os.path.join(model_dir, "vosk-model-en-in-0.5.zip")
vosk_folder = os.path.join(model_dir, "vosk-model-en-in-0.5")

if not os.path.exists(vosk_folder):
    print("⬇️ Downloading Vosk model...")
    urllib.request.urlretrieve(vosk_url, vosk_zip)

    print("📂 Extracting Vosk model...")
    with zipfile.ZipFile(vosk_zip, "r") as zip_ref:
        zip_ref.extractall(model_dir)

    os.remove(vosk_zip)
    print("✅ Vosk model ready.")
else:
    print("✅ Vosk model already exists.")

# -------------------------------
# 2. Piper voice model
# (example: en_US-amy-medium)
# -------------------------------
piper_url = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx"
piper_json_url = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json"

piper_dir = os.path.join(model_dir, "piper-voice")
os.makedirs(piper_dir, exist_ok=True)

piper_model = os.path.join(piper_dir, "voice.onnx")
piper_config = os.path.join(piper_dir, "voice.onnx.json")

if not os.path.exists(piper_model):
    print("⬇️ Downloading Piper voice model...")
    urllib.request.urlretrieve(piper_url, piper_model)
    urllib.request.urlretrieve(piper_json_url, piper_config)
    print("✅ Piper voice model ready.")
else:
    print("✅ Piper voice model already exists.")
