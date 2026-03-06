"""Telegram Bot API Service - Handles all Telegram Bot API interactions."""

import logging
import aiohttp
from typing import Optional

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE = "https://api.telegram.org/bot"


class TelegramBotService:
    """Service for interacting with Telegram Bot API."""

    def __init__(self, token: str):
        self.token = token
        self.base_url = f"{TELEGRAM_API_BASE}{token}"

    async def _request(self, method: str, data: Optional[dict] = None) -> dict:
        """Make a request to Telegram Bot API."""
        url = f"{self.base_url}/{method}"
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data or {}) as resp:
                    result = await resp.json()
                    return result
        except Exception as e:
            logger.error(f"Telegram API error: {e}")
            return {"ok": False, "description": str(e)}

    async def get_me(self) -> dict:
        """Get bot info to verify token."""
        return await self._request("getMe")

    async def get_chat(self, chat_id: str) -> dict:
        """Get chat info by chat_id."""
        return await self._request("getChat", {"chat_id": chat_id})

    async def get_chat_member_count(self, chat_id: str) -> dict:
        """Get member count of a chat."""
        return await self._request("getChatMemberCount", {"chat_id": chat_id})

    async def send_message(
        self,
        chat_id: str,
        text: str,
        parse_mode: str = "HTML",
        reply_markup: Optional[dict] = None,
    ) -> dict:
        """Send a message to a chat."""
        data: dict = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
        }
        if reply_markup:
            data["reply_markup"] = reply_markup
        return await self._request("sendMessage", data)

    async def send_photo(
        self,
        chat_id: str,
        photo: str,
        caption: str = "",
        parse_mode: str = "HTML",
        reply_markup: Optional[dict] = None,
    ) -> dict:
        """Send a photo to a chat."""
        data: dict = {
            "chat_id": chat_id,
            "photo": photo,
            "caption": caption,
            "parse_mode": parse_mode,
        }
        if reply_markup:
            data["reply_markup"] = reply_markup
        return await self._request("sendPhoto", data)

    async def set_webhook(self, url: str) -> dict:
        """Set webhook URL for the bot."""
        return await self._request("setWebhook", {"url": url})

    async def delete_webhook(self) -> dict:
        """Delete webhook."""
        return await self._request("deleteWebhook")

    async def get_webhook_info(self) -> dict:
        """Get current webhook info."""
        return await self._request("getWebhookInfo")