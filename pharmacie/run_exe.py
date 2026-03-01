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
from django.core.management import execute_from_command_line

django.setup()

# Force imports that are commonly missed in frozen builds due dynamic loading.
# These imports are intentionally unused and ensure app initialization is stable.
import core.api_urls  # noqa: F401,E402
import core.models  # noqa: F401,E402
import core.serializers  # noqa: F401,E402
import rest_framework_simplejwt.authentication  # noqa: F401,E402

if __name__ == "__main__":
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
