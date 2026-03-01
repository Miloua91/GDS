import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pharmacie.settings')

import django
django.setup()

import rest_framework_simplejwt.state
import rest_framework_simplejwt.serializers

import django.core.management

if __name__ == '__main__':
    django.core.management.execute_from_command_line(['server', 'runserver', '0.0.0.0:8000', '--noreload'])
