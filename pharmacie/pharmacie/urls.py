"""
URL configuration for pharmacie project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.api_views import (
    current_user,
    produits_with_stock,
    quick_order,
    stock_reception,
    dashboard_kpis,
    deliver_order,
    journal_list,
    stock_list,
    dashboard_magasins_orders,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/user/me/", current_user, name="current_user"),
    path("api/produits-with-stock/", produits_with_stock, name="produits_with_stock"),
    path("api/commandes/livrer/", deliver_order, name="deliver_order"),
    path("api/commandes-rapides/", quick_order, name="quick_order"),
    path("api/stock/reception/", stock_reception, name="stock_reception"),
    path("api/dashboard/kpis/", dashboard_kpis, name="dashboard_kpis"),
    path(
        "api/dashboard/magasins-orders/",
        dashboard_magasins_orders,
        name="dashboard_magasins_orders",
    ),
    path("api/stock/", stock_list, name="stock_list"),
    path("api/journals/", journal_list, name="journal_list"),
    path("api/", include("core.api_urls")),
]
