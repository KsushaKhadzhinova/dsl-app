"""Заглушка AI-провайдера — используется, пока не подключён реальный ключ
(см. docs/architecture/01-ai-provider-setup.md). Не обращается в сеть, не падает,
возвращает предсказуемый ответ, чтобы весь остальной пайплайн (валидация, рендер,
сохранение) можно было разрабатывать и тестировать уже сейчас."""


class StubAIProvider:
    key = "stub"

    async def generate_dsl_from_text(self, *, prompt: str, notation: str) -> str:
        return (
            f"// AI-заглушка: ключ не подключён (AI_PROVIDER=stub).\n"
            f'// Запрос: "{prompt}"\n'
            f'diagram {notation} "Черновик" {{\n'
            f'  entity placeholder "Заполнить вручную" pk=id\n'
            f"}}\n"
        )

    async def fix_dsl(self, *, dsl_code: str, error_message: str) -> str:
        return dsl_code + f"\n// AI-заглушка: не может исправить «{error_message}» без ключа.\n"
