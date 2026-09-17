from unittest.mock import patch

from app.core.config import Settings
from app.core.observability import init_error_tracking


def test_no_dsn_skips_sentry_init():
    settings = Settings(glitchtip_dsn=None)

    with patch("app.core.observability.sentry_sdk.init") as mock_init:
        init_error_tracking(settings)

    mock_init.assert_not_called()


def test_empty_dsn_skips_sentry_init():
    settings = Settings(glitchtip_dsn="")

    with patch("app.core.observability.sentry_sdk.init") as mock_init:
        init_error_tracking(settings)

    mock_init.assert_not_called()


def test_dsn_set_initializes_sentry_with_it():
    dsn = "https://public@glitchtip.example.com/1"
    settings = Settings(glitchtip_dsn=dsn)

    with patch("app.core.observability.sentry_sdk.init") as mock_init:
        init_error_tracking(settings)

    mock_init.assert_called_once()
    assert mock_init.call_args.kwargs["dsn"] == dsn
