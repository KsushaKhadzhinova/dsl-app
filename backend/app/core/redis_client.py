"""Единая точка создания клиента Redis (очередь задач, кэш рендера, дневная
квота AI) — см. docs/architecture/00-system-architecture.md, §6."""

from functools import lru_cache

import redis

from app.core.config import get_settings


@lru_cache
def get_redis_client() -> redis.Redis:
    return redis.Redis.from_url(get_settings().redis_url, decode_responses=True)
