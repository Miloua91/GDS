from django.db.models import Sum
from django.utils.timezone import now, timedelta
from .models import LotProduit, Produit


def dashboard_kpis():
    total_stock = LotProduit.objects.aggregate(
        total=Sum("quantite_actuelle")
    )["total"] or 0

    produits_en_rupture = Produit.objects.filter(
        stock_securite__gt=0
    ).count()

    perimes = LotProduit.objects.filter(
        date_peremption__lt=now()
    ).count()

    return {
        "total_stock": total_stock,
        "rupture": produits_en_rupture,
        "perimes": perimes,
    }

def produits_en_alerte():
    from .models import Produit, LotProduit

    data = LotProduit.objects.values("produit").annotate(
        total=Sum("quantite_actuelle")
    )

    result = []

    for item in data:
        produit = Produit.objects.get(id=item["produit"])
        if item["total"] <= produit.stock_securite:
            result.append(produit)

    return result

def lots_proches_peremption(days=60):
    limit = now().date() + timedelta(days=days)

    from .models import LotProduit

    return LotProduit.objects.filter(date_peremption__lte=limit)
