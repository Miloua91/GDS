"""
Custom entry point for PyInstaller executable
"""

import sys
import os
import io

# Add the directory containing the exe to the path
if getattr(sys, "frozen", False):
    base_path = os.path.dirname(sys.executable)
    sys.path.insert(0, base_path)
    os.chdir(base_path)

    # Fix for stdout/stderr in windowed mode
    if sys.stdout is None:
        sys.stdout = io.StringIO()
    if sys.stderr is None:
        sys.stderr = io.StringIO()

# Set Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pharmacie.settings")

from django.core.management import execute_from_command_line

if __name__ == "__main__":
    # Automatically start the server if no arguments provided
    if len(sys.argv) == 1:
        execute_from_command_line(
            ["run_exe.py", "runserver", "0.0.0.0:8000", "--noreload"]
        )
    else:
        # Ensure --noreload is always added to prevent issues
        if "runserver" in sys.argv and "--noreload" not in sys.argv:
            sys.argv.append("--noreload")
        execute_from_command_line(sys.argv)
