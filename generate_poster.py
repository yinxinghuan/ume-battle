#!/usr/bin/env python3
"""
Generate UMe Battle poster image via online AI API (txt2img mode).

Usage: ~/miniconda3/bin/python3 generate_poster.py
"""

import json
import os
import ssl
import subprocess
import sys
import time
import urllib.request
import urllib.error

API_URL     = "http://aiservice.wdabuliu.com:8019/genl_image"
API_TIMEOUT = 360
USER_ID     = 123456

OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "src/UmeBattle/img/poster.png",
)

PROMPT = (
    "epic video game poster art, perfect square composition, anime chibi style illustration, "
    "six cute cartoon mascot characters in dynamic battle poses arranged in a dramatic V-formation, "
    "center front: pink round bunny with large standing ears, black teardrop eyes, small nose, blue bow on head, holding a boba milk tea cup with pink straw, "
    "left front: yellow teardrop-shaped creature with black X eyes, wide open mouth showing white teeth and orange inside, fierce expression, "
    "right front: dark brown round cat with white oval eyes, golden halo above head, white angel wings on back, glossy finish, "
    "back left: dark green round short body with military helmet, face is avocado cross-section with cream white and brown pit center, small wing-like arms, "
    "back center: red round-headed bear with white big nose, wearing a watermelon-striped swim ring around waist, "
    "back right: yellow round chubby chick with green leaf on top of head, squinting eyes, tiny mouth, "
    "elemental energy effects: fire water and nature swirling around the characters, "
    "dramatic dark purple and deep blue background with energy bursts and light rays, "
    "battle arena atmosphere, dynamic action composition, "
    'large bold glowing white and gold title text "UMe BATTLE" prominently at the top center, '
    'smaller subtitle text "CHOOSE YOUR FIGHTER" below the title, '
    "professional game cover art, 8k quality, vibrant saturated colors, dramatic lighting"
)

_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE


def call_api(prompt: str) -> str | None:
    payload = json.dumps({
        "query": "",
        "params": {
            "prompt": prompt,
            "user_id": USER_ID,
        },
    }).encode()

    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    print("  Calling API (may take ~200s)...", flush=True)
    try:
        with urllib.request.urlopen(req, timeout=API_TIMEOUT) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            result = json.loads(body)
        except Exception:
            print(f"  ERROR: HTTP {e.code} — {body}")
            return None

    code = result.get("code")
    if code == 200:
        return result["url"]
    if code == 429:
        return "RATE_LIMIT"
    print(f"  API returned code={code}: {result}")
    return None


def download_image(url: str, out_path: str) -> None:
    print(f"  Downloading result...")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)

    src_ext = os.path.splitext(url.split("?")[0])[1].lower()
    dst_ext = os.path.splitext(out_path)[1].lower()
    tmp_path = out_path if src_ext == dst_ext else out_path + src_ext

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60, context=_SSL_CTX) as resp:
        data = resp.read()
    with open(tmp_path, "wb") as f:
        f.write(data)

    if src_ext != dst_ext and dst_ext in (".png", ".jpg", ".jpeg"):
        fmt = "png" if dst_ext == ".png" else "jpeg"
        subprocess.run(["sips", "-s", "format", fmt, tmp_path, "--out", out_path],
                       check=True, capture_output=True)
        os.remove(tmp_path)
        print(f"  Converted {src_ext} -> {dst_ext}")
    elif tmp_path != out_path:
        os.rename(tmp_path, out_path)

    size_kb = os.path.getsize(out_path) // 1024
    print(f"  Saved -> {out_path}  ({size_kb} KB)")


def main():
    print("UMe Battle Poster Generator (Online API)")
    print(f"Output: {OUTPUT_PATH}\n")

    # Retry loop for rate limit
    while True:
        result_url = call_api(PROMPT)
        if result_url == "RATE_LIMIT":
            print("  Rate limited — waiting 78s...")
            time.sleep(78)
            continue
        break

    if not result_url:
        print("ERROR: Generation failed")
        sys.exit(1)

    print(f"  Result URL: {result_url}")
    download_image(result_url, OUTPUT_PATH)
    print("\nDone!")


if __name__ == "__main__":
    main()
