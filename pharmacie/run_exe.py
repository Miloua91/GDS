"""Custom entry point for the PyInstaller executable."""

import io
import os
import shutil
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
from django.contrib.auth import get_user_model
from django.core.management import call_command, execute_from_command_line
from django.db import connection

django.setup()

# Force imports that are commonly missed in frozen builds due dynamic loading.
# These imports are intentionally unused and ensure app initialization is stable.
import core.api_urls  # noqa: F401,E402
import core.models  # noqa: F401,E402
import core.serializers  # noqa: F401,E402
import rest_framework_simplejwt.authentication  # noqa: F401,E402


def hydrate_bundled_database() -> None:
    """Copy bundled db.sqlite3 from _MEIPASS beside the exe when missing."""
    if not getattr(sys, "frozen", False):
        return

    db_engine = connection.settings_dict.get("ENGINE", "")
    if db_engine != "django.db.backends.sqlite3":
        return

    exe_dir = os.path.dirname(sys.executable)
    target_db = os.path.join(exe_dir, "db.sqlite3")
    if os.path.exists(target_db):
        return

    source_root = getattr(sys, "_MEIPASS", None)
    if not source_root:
        return

    source_db = os.path.join(source_root, "db.sqlite3")
    if not os.path.exists(source_db):
        print("[startup] Bundled db.sqlite3 not found in _MEIPASS; continuing.")
        return

    try:
        shutil.copy2(source_db, target_db)
        print(f"[startup] Copied bundled database to {target_db}")
    except Exception as exc:  # pragma: no cover - defensive for frozen runtime
        print(f"[startup] Failed to copy bundled database: {exc}")


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


def ensure_seed_data() -> None:
    """Seed a fresh SQLite database so login/API calls work on first launch."""
    db_engine = connection.settings_dict.get("ENGINE", "")
    if db_engine != "django.db.backends.sqlite3":
        return

    if os.environ.get("SKIP_AUTO_SEED") == "1":
        print("[startup] SKIP_AUTO_SEED=1 set. Skipping automatic seed.")
        return

    try:
        user_count = get_user_model().objects.count()
    except Exception as exc:  # pragma: no cover - defensive for frozen runtime
        print(f"[startup] user count check failed: {exc}")
        user_count = 0

    if user_count > 0:
        return

    print("[startup] No users found. Running seed_db...")
    call_command("seed_db", verbosity=1)


def should_prepare_database(argv: list[str]) -> bool:
    if len(argv) == 1:
        return True
    return "runserver" in argv


if __name__ == "__main__":
    if should_prepare_database(sys.argv):
        hydrate_bundled_database()
        ensure_database_ready()
        ensure_seed_data()

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
