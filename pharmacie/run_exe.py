"""
Custom entry point for PyInstaller executable
"""

import sys
import os

# Add the directory containing the exe to the path
if getattr(sys, "frozen", False):
    base_path = os.path.dirname(sys.executable)
    sys.path.insert(0, base_path)
    os.chdir(base_path)

# Set Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pharmacie.settings")

from django.core.management import execute_from_command_line

if __name__ == "__main__":
    execute_from_command_line(sys.argv)
