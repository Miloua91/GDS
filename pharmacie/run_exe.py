"""Custom entry point for the PyInstaller executable."""

import io
import os
import sys

# Add the directory containing the exe to path and use it as runtime cwd.
if getattr(sys, "frozen", False):
    base_path = os.path.dirname(sys.executable)
    sys.path.insert(0, base_path)
    os.chdir(base_path)

    # Keep stdout/stderr usable in console mode.
    if sys.stdout is None:
        sys.stdout = io.StringIO()
    if sys.stderr is None:
        sys.stderr = io.StringIO()

# Set Django settings before importing Django internals.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pharmacie.settings")

import django
from django.core.management import call_command, execute_from_command_line
from django.db import connection

django.setup()

# Force imports that are commonly missed in frozen builds due dynamic loading.
# These imports are intentionally unused and ensure app initialization is stable.
import core.api_urls  # noqa: F401,E402
import core.models  # noqa: F401,E402
import core.serializers  # noqa: F401,E402
import rest_framework_simplejwt.authentication  # noqa: F401,E402


def ensure_database_ready() -> None:
    """Apply migrations automatically when bundled SQLite DB is empty/outdated."""
    db_engine = connection.settings_dict.get("ENGINE", "")
    if db_engine != "django.db.backends.sqlite3":
        return

    try:
        with connection.cursor() as cursor:
            tables = set(connection.introspection.table_names(cursor))
    except Exception as exc:  # pragma: no cover - defensive for frozen runtime
        print(f"[startup] database introspection failed: {exc}")
        tables = set()

    # If any expected auth/core table is missing, run migrations before serving requests.
    required_tables = {"django_migrations", "auth_permission", "core_utilisateur"}
    if required_tables.issubset(tables):
        return

    print("[startup] Database schema not initialized. Running migrations...")
    call_command("migrate", interactive=False, run_syncdb=True, verbosity=1)


def should_prepare_database(argv: list[str]) -> bool:
    if len(argv) == 1:
        return True
    return "runserver" in argv


django.setup()

# Force imports that are commonly missed in frozen builds due dynamic loading.
# These imports are intentionally unused and ensure app initialization is stable.
import core.api_urls  # noqa: F401,E402
import core.models  # noqa: F401,E402
import core.serializers  # noqa: F401,E402
import rest_framework_simplejwt.authentication  # noqa: F401,E402

if __name__ == "__main__":
    if should_prepare_database(sys.argv):
        ensure_database_ready()

    # Automatically start the server when the exe is launched directly.
    if len(sys.argv) == 1:
        execute_from_command_line(
            ["run_exe.py", "runserver", "0.0.0.0:8000", "--noreload"]
        )
    else:
        # Ensure --noreload is always set in a frozen process.
        if "runserver" in sys.argv and "--noreload" not in sys.argv:
            sys.argv.append("--noreload")
        execute_from_command_line(sys.argv)
