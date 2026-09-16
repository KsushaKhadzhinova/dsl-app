"""Дневная квота AI-запросов на пользователя — счётчик в Redis с TTL ~24ч
(FR-AI-12 / NFR-SEC-07, решено см. docs/requirements/00-overview.md §5, п. 5).
Не зависит от конкретного клиента Redis — принимает любой объект с интерфейсом
`incr`/`expire`/`ttl` (`redis.Redis` в проде, `fakeredis.FakeRedis` в тестах)."""

from datetime import date, timedelta
from typing import Protocol

_SECONDS_PER_DAY = int(timedelta(days=1).total_seconds())


class RedisLike(Protocol):
    def incr(self, name: str) -> int: ...
    def expire(self, name: str, seconds: int) -> bool: ...
    def ttl(self, name: str) -> int: ...
    def get(self, name: str) -> str | bytes | None: ...


class AiQuotaExceeded(Exception):
    def __init__(self, *, limit: int, used: int) -> None:
        super().__init__(f"Превышена дневная квота AI-запросов: {used}/{limit}.")
        self.limit = limit
        self.used = used


class AiQuotaLimiter:
    def __init__(self, client: RedisLike, daily_quota: int) -> None:
        self._client = client
        self._daily_quota = daily_quota

    def _key(self, user_id: str) -> str:
        return f"ai_quota:{user_id}:{date.today().isoformat()}"

    def check_and_increment(self, user_id: str) -> int:
        key = self._key(user_id)
        used = self._client.incr(key)
        if used == 1:
            self._client.expire(key, _SECONDS_PER_DAY)
        if used > self._daily_quota:
            raise AiQuotaExceeded(limit=self._daily_quota, used=used)
        return used

    def remaining(self, user_id: str) -> int:
        key = self._key(user_id)
        used = int(self._client.get(key) or 0)
        return max(self._daily_quota - used, 0)
