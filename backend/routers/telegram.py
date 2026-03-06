"""Telegram Bot API Router - Endpoints for bot management."""

import logging
import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

from services.telegram_service import TelegramBotService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/telegram", tags=["telegram"])

# In-memory token storage (per-session, for demo)
_bot_tokens: dict[str, str] = {}


def _get_token() -> str:
    """Get the stored bot token."""
    token = _bot_tokens.get("default") or os.environ.get("TELEGRAM_BOT_TOKEN", "")
    if not token:
        raise HTTPException(status_code=400, detail="Bot token not configured")
    return token


# ─── Request/Response Models ───


class TokenRequest(BaseModel):
    token: str


class ChatIdRequest(BaseModel):
    chat_id: str


class SendMessageRequest(BaseModel):
    chat_id: str
    text: str
    parse_mode: str = "HTML"
    buttons: list[dict] | None = None


class SendPhotoRequest(BaseModel):
    chat_id: str
    photo_url: str
    caption: str = ""
    parse_mode: str = "HTML"
    buttons: list[dict] | None = None


class WebhookRequest(BaseModel):
    url: str


class BotInfoResponse(BaseModel):
    ok: bool
    username: str | None = None
    first_name: str | None = None
    bot_id: int | None = None
    error: str | None = None


class ChatInfoResponse(BaseModel):
    ok: bool
    chat_id: str | None = None
    title: str | None = None
    chat_type: str | None = None
    member_count: int | None = None
    description: str | None = None
    photo_url: str | None = None
    error: str | None = None


# ─── Endpoints ───


@router.post("/connect", response_model=BotInfoResponse)
async def connect_bot(data: TokenRequest):
    """Connect a bot by verifying its token and storing it."""
    service = TelegramBotService(data.token)
    result = await service.get_me()

    if result.get("ok"):
        bot = result["result"]
        _bot_tokens["default"] = data.token
        return BotInfoResponse(
            ok=True,
            username=bot.get("username"),
            first_name=bot.get("first_name"),
            bot_id=bot.get("id"),
        )
    return BotInfoResponse(ok=False, error=result.get("description", "Connection failed"))


@router.post("/disconnect")
async def disconnect_bot():
    """Disconnect the bot and clear the stored token."""
    _bot_tokens.pop("default", None)
    return {"ok": True, "message": "Bot disconnected"}


@router.get("/status", response_model=BotInfoResponse)
async def get_bot_status():
    """Get current bot connection status."""
    token = _bot_tokens.get("default")
    if not token:
        return BotInfoResponse(ok=False, error="No bot connected")

    service = TelegramBotService(token)
    result = await service.get_me()

    if result.get("ok"):
        bot = result["result"]
        return BotInfoResponse(
            ok=True,
            username=bot.get("username"),
            first_name=bot.get("first_name"),
            bot_id=bot.get("id"),
        )
    return BotInfoResponse(ok=False, error="Token invalid or expired")


@router.post("/verify-chat", response_model=ChatInfoResponse)
async def verify_chat(data: ChatIdRequest):
    """Verify a chat ID and get chat information from Telegram API."""
    token = _get_token()
    service = TelegramBotService(token)

    chat_result = await service.get_chat(data.chat_id)
    if not chat_result.get("ok"):
        return ChatInfoResponse(
            ok=False,
            error=chat_result.get("description", "Chat not found or bot not in group"),
        )

    chat = chat_result["result"]

    # Get member count
    count_result = await service.get_chat_member_count(data.chat_id)
    member_count = count_result.get("result", 0) if count_result.get("ok") else 0

    return ChatInfoResponse(
        ok=True,
        chat_id=str(chat.get("id")),
        title=chat.get("title", chat.get("first_name", "Unknown")),
        chat_type=chat.get("type"),
        member_count=member_count,
        description=chat.get("description"),
    )


@router.post("/send-message")
async def send_message(data: SendMessageRequest):
    """Send a message to a Telegram chat."""
    token = _get_token()
    service = TelegramBotService(token)

    reply_markup = None
    if data.buttons:
        inline_keyboard = []
        for btn in data.buttons:
            inline_keyboard.append(
                [{"text": btn.get("text", ""), "url": btn.get("url", "")}]
            )
        reply_markup = {"inline_keyboard": inline_keyboard}

    result = await service.send_message(
        chat_id=data.chat_id,
        text=data.text,
        parse_mode=data.parse_mode,
        reply_markup=reply_markup,
    )

    if result.get("ok"):
        return {"ok": True, "message_id": result["result"]["message_id"]}
    raise HTTPException(status_code=400, detail=result.get("description", "Send failed"))


@router.post("/send-photo")
async def send_photo(data: SendPhotoRequest):
    """Send a photo to a Telegram chat."""
    token = _get_token()
    service = TelegramBotService(token)

    reply_markup = None
    if data.buttons:
        inline_keyboard = []
        for btn in data.buttons:
            inline_keyboard.append(
                [{"text": btn.get("text", ""), "url": btn.get("url", "")}]
            )
        reply_markup = {"inline_keyboard": inline_keyboard}

    result = await service.send_photo(
        chat_id=data.chat_id,
        photo=data.photo_url,
        caption=data.caption,
        parse_mode=data.parse_mode,
        reply_markup=reply_markup,
    )

    if result.get("ok"):
        return {"ok": True, "message_id": result["result"]["message_id"]}
    raise HTTPException(status_code=400, detail=result.get("description", "Send failed"))


@router.post("/webhook/set")
async def set_webhook(data: WebhookRequest):
    """Set webhook URL for the bot."""
    token = _get_token()
    service = TelegramBotService(token)
    result = await service.set_webhook(data.url)

    if result.get("ok"):
        return {"ok": True, "message": "Webhook set successfully"}
    raise HTTPException(
        status_code=400, detail=result.get("description", "Failed to set webhook")
    )


@router.post("/webhook/delete")
async def delete_webhook():
    """Delete webhook."""
    token = _get_token()
    service = TelegramBotService(token)
    result = await service.delete_webhook()

    if result.get("ok"):
        return {"ok": True, "message": "Webhook deleted"}
    raise HTTPException(
        status_code=400, detail=result.get("description", "Failed to delete webhook")
    )


@router.get("/webhook/info")
async def get_webhook_info():
    """Get current webhook info."""
    token = _get_token()
    service = TelegramBotService(token)
    result = await service.get_webhook_info()

    if result.get("ok"):
        return {"ok": True, "result": result["result"]}
    raise HTTPException(
        status_code=400, detail=result.get("description", "Failed to get webhook info")
    )


@router.post("/webhook/incoming")
async def incoming_webhook(request: Request):
    """Handle incoming webhook updates from Telegram."""
    try:
        update = await request.json()
        logger.info(f"Received webhook update: {update.get('update_id')}")
        # Process the update here (message handling, filter matching, etc.)
        return {"ok": True}
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        return {"ok": False}