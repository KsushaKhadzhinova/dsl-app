"""Экспорт «на устройство» — единственный StorageProvider, не требующий OAuth.
GitHub/Google Drive провайдеры добавляются сюда же по мере получения OAuth-приложений
(см. §8 в docs/architecture/00-system-architecture.md, ответы 8–9)."""


class LocalDownloadProvider:
    key = "local"

    async def save(self, *, path: str, content: str, token: str | None) -> str:
        return path
