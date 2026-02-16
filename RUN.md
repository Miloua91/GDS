# Development (Windows) - Run locally
cd pharmacie
python manage.py runserver

# Production (Koyeb/Linux) - Use this Procfile
# web: cd pharmacie && gunicorn pharmacie.pharmacie.wsgi:application --bind 0.0.0.0:$PORT --workers 2

# Alternative for Windows development (install waitress)
# pip install waitress
# web: cd pharmacie && waitress-serve pharmacie.pharmacie.wsgi:application --listen=0.0.0.0:$PORT
