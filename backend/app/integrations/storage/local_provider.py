"""Экспорт «на устройство» — единственный StorageProvider, не требующий OAuth.
GitHub/Google Drive провайдеры добавляются сюда же по мере получения OAuth-приложений
(см. §8 в docs/architecture/00-system-architecture.md, ответы 8–9)."""


class LocalDownloadProvider:
    key = "local"

    async def save(self, *, path: str, content: str, token: str | None) -> str:
        # Фактическую передачу файла в браузер делает фронтенд (Blob + <a download>);
        # бэкенду здесь достаточно отдать контент как есть через отдельный export-эндпоинт.
        return path
