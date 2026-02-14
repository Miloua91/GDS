#!/bin/bash
# Start Gunicorn for Pharma Django project

cd "$(dirname "$0")/pharmacie"

# Activate virtual environment if it exists
if [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Run gunicorn
exec gunicorn --config gunicorn.conf.py pharmacie.wsgi:application
