"""Resolve image URLs into OpenAI-compatible data URLs."""

from __future__ import annotations

import base64
import re
from urllib.parse import parse_qs, urlparse

import httpx

_DRIVE_FILE_ID = re.compile(r"drive\.google\.com/file/d/([^/]+)")
_IMAGE_MAGIC = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"GIF87a": "image/gif",
    b"GIF89a": "image/gif",
    b"RIFF": "image/webp",  # refined below
}


def _google_drive_direct_url(url: str) -> str | None:
    match = _DRIVE_FILE_ID.search(url)
    if match:
        return f"https://drive.google.com/uc?export=download&id={match.group(1)}"

    parsed = urlparse(url)
    if "drive.google.com" not in parsed.netloc:
        return None

    file_id = parse_qs(parsed.query).get("id", [None])[0]
    if file_id:
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    return None


def _sniff_content_type(data: bytes, header_type: str) -> str:
    content_type = header_type.split(";")[0].strip().lower()
    if content_type.startswith("image/") and content_type != "image/webp":
        return content_type

    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "image/webp"
    return content_type


def resolve_image_for_openai(image_url: str) -> str:
    """
    Fetch an image and return a data URL OpenAI can consume.

    Google Drive /view links are rewritten to a direct download URL first.
    OpenAI cannot reliably fetch Drive share pages itself.
    """
    fetch_url = _google_drive_direct_url(image_url) or image_url

    try:
        with httpx.Client(follow_redirects=True, timeout=30.0) as client:
            response = client.get(fetch_url)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise ValueError(f"Could not download image from URL: {exc}") from exc

    content_type = _sniff_content_type(
        response.content,
        response.headers.get("content-type", ""),
    )

    if content_type.startswith("text/html") or not content_type.startswith("image/"):
        raise ValueError(
            "Invalid image URL: the link did not return an image. "
            "Google Drive 'share' links often fail — set sharing to "
            "'Anyone with the link', or use a direct public image URL "
            "(imgur, S3, Cloudinary, etc.)."
        )

    encoded = base64.b64encode(response.content).decode("ascii")
    return f"data:{content_type};base64,{encoded}"
