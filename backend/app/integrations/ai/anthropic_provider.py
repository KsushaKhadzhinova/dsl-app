"""Реализация AIProvider поверх официального SDK Anthropic (Claude) —
см. docs/architecture/01-ai-provider-setup.md, раздел «Anthropic»."""

import anthropic

from app.integrations.ai._prompts import SYSTEM_PROMPT, build_fix_message, build_generate_message

DEFAULT_MODEL = "claude-3-5-haiku-20241022"


class AnthropicAIProvider:
    key = "anthropic"

    def __init__(self, api_key: str, model: str = DEFAULT_MODEL) -> None:
        self._client = anthropic.AsyncAnthropic(api_key=api_key)
        self._model = model

    async def generate_dsl_from_text(self, *, prompt: str, notation: str) -> str:
        message = await self._client.messages.create(
            model=self._model,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": build_generate_message(prompt=prompt, notation=notation),
                }
            ],
        )
        return message.content[0].text

    async def fix_dsl(self, *, dsl_code: str, error_message: str) -> str:
        message = await self._client.messages.create(
            model=self._model,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": build_fix_message(dsl_code=dsl_code, error_message=error_message),
                }
            ],
        )
        return message.content[0].text
