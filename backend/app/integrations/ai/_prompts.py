"""Общий системный промпт для реальных AI-провайдеров (Anthropic/OpenAI) —
жёстко ограничивает модель форматом ответа, иначе app/dsl/parser.py не сможет
распарсить результат (см. docs/architecture/01-ai-provider-setup.md, п. «Что ещё
нужно сделать в коде»)."""

SYSTEM_PROMPT = (
    "Ты — генератор кода на DSL проекта DiagramCode. Отвечай ТОЛЬКО кодом на этом DSL, "
    "без пояснений, без markdown-разметки (без ```), без текста до или после кода. "
    "Грамматика: diagram <нотация> \"<Название>\" { <узлы и связи> }. "
    "Узел: <kind> <id> \"<label>\" [attr=value ...]. "
    "Связь: a -> b, цепочки a -> b -> c, связь с условием a -[\"условие\"]-> b. "
    "Однострочные комментарии — // текст."
)


def build_generate_message(*, prompt: str, notation: str) -> str:
    return f'Нотация: {notation}\nОписание диаграммы на естественном языке: {prompt}'


def build_fix_message(*, dsl_code: str, error_message: str) -> str:
    return (
        f"Текущий код DSL:\n{dsl_code}\n\n"
        f"Ошибка валидации/парсинга:\n{error_message}\n\n"
        "Верни исправленный код DSL целиком."
    )
