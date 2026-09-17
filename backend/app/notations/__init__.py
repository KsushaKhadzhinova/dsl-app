"""Реестр плагинов нотаций (Open/Closed Principle — см. §5 архитектуры).
Каждый модуль в этом пакете регистрирует себя вызовом `register()` при импорте;
`load_all()` импортирует все известные плагины один раз при старте приложения."""

from app.domain.interfaces import NotationProfile

_REGISTRY: dict[str, NotationProfile] = {}


def register(profile: NotationProfile) -> None:
    _REGISTRY[profile.key] = profile


def get(key: str) -> NotationProfile:
    try:
        return _REGISTRY[key]
    except KeyError as exc:
        raise ValueError(f"Нотация не зарегистрирована: {key}") from exc


def list_all() -> list[NotationProfile]:
    return list(_REGISTRY.values())


def load_all() -> None:
    from app.notations import bpmn, erd, uml_class  # noqa: F401
