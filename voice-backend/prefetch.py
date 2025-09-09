# #  -----------------Pre-fetching the model-----------
# # prefetch_model.py
# from huggingface_hub import snapshot_download
# p = snapshot_download(
#     repo_id="Systran/faster-distil-whisper-large-v3",
#     local_dir=r"./models/distil-large-v3",
#     # local_dir_use_symlinks=False,   # friendlier on Windows
#     force_download=True,
#     max_workers=1
# )
# print("Downloaded to:", p)

import os
import sys
import urllib.request

# ---- Pick ONE pair of URLs (model + config). ----
# Example A: English (GB) female, "low" quality (small, good to start)
MODEL_URL  = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/southern_english_female/low/en_GB-southern_english_female-low.onnx"
CONFIG_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/southern_english_female/low/en_GB-southern_english_female-low.onnx.json"

# Example B (alternative English US, uncomment to use):
# MODEL_URL  = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/low/voice.onnx"
# CONFIG_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/low/voice.onnx.json"

# Example C (Hindi, if you actually want Hindi speech):
# MODEL_URL  = "https://huggingface.co/rhasspy/piper-voices/resolve/main/hi/hi_IN/priyamvada/medium/hi_IN-priyamvada-medium.onnx"
# CONFIG_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/hi/hi_IN/priyamvada/medium/hi_IN-priyamvada-medium.onnx.json"

DEST_DIR = os.path.join("models", "piper-voice")
MODEL_OUT  = os.path.join(DEST_DIR, "voice.onnx")
CONFIG_OUT = os.path.join(DEST_DIR, "voice.onnx.json")

def download(url, out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    print(f"→ downloading {url}")
    urllib.request.urlretrieve(url, out_path)
    size_mb = os.path.getsize(out_path) / (1024*1024)
    print(f"✓ saved {out_path} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    try:
        download(MODEL_URL, MODEL_OUT)
        download(CONFIG_URL, CONFIG_OUT)
        print("\nAll set! Files are at:")
        print(" ", os.path.abspath(MODEL_OUT))
        print(" ", os.path.abspath(CONFIG_OUT))
        print("\nNow restart `node app.js` and POST /speak.")
    except Exception as e:
        print("Download failed:", e)
        sys.exit(1)
