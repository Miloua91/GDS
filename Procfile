release: python pharmacie/manage.py migrate --noinput
web: cd pharmacie && gunicorn pharmacie.pharmacie.wsgi:application --bind 0.0.0.0:$PORT --workers 2
