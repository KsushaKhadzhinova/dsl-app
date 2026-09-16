"""Реализация AIProvider поверх официального SDK OpenAI (GPT) —
см. docs/architecture/01-ai-provider-setup.md, раздел «OpenAI»."""

import openai

from app.integrations.ai._prompts import SYSTEM_PROMPT, build_fix_message, build_generate_message

DEFAULT_MODEL = "gpt-4o-mini"


class OpenAIProvider:
    key = "openai"

    def __init__(self, api_key: str, model: str = DEFAULT_MODEL) -> None:
        self._client = openai.AsyncOpenAI(api_key=api_key)
        self._model = model

    async def generate_dsl_from_text(self, *, prompt: str, notation: str) -> str:
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": build_generate_message(prompt=prompt, notation=notation),
                },
            ],
        )
        return response.choices[0].message.content

    async def fix_dsl(self, *, dsl_code: str, error_message: str) -> str:
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": build_fix_message(dsl_code=dsl_code, error_message=error_message),
                },
            ],
        )
        return response.choices[0].message.content
