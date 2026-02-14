from django.contrib import admin
from .models import (
    Produit,
    LotProduit,
    Fournisseur,
    Magasin,
    MouvementStock,
    Service,
    CommandeService,
    LigneCommandeService,
    Utilisateur,
    Role,
    Permission
)


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ("code_national", "denomination", "dosage", "type_produit", "statut")
    search_fields = ("code_national", "denomination", "dci")
    list_filter = ("type_produit", "statut", "categorie_surveillance")


@admin.register(LotProduit)
class LotProduitAdmin(admin.ModelAdmin):
    list_display = (
        "produit",
        "numero_lot",
        "date_peremption",
        "quantite_actuelle"
    )
    list_filter = ("date_peremption",)
    search_fields = ("numero_lot", "produit__denomination")


@admin.register(Magasin)
class MagasinAdmin(admin.ModelAdmin):
    list_display = ("code_magasin", "nom", "type_magasin", "actif")

@admin.register(Fournisseur)
class FournisseurAdmin(admin.ModelAdmin):
    list_display = ("code_fournisseur", "raison_sociale", "type_fournisseur", "wilaya")
    search_fields = ("raison_sociale",)


@admin.register(MouvementStock)
class MouvementStockAdmin(admin.ModelAdmin):
    list_display = (
        "numero_mouvement",
        "produit",
        "type_mouvement",
        "quantite",
        "date_mouvement"
    )
    list_filter = ("type_mouvement",)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("code_service", "nom", "specialite")


class LigneCommandeInline(admin.TabularInline):
    model = LigneCommandeService
    extra = 1


@admin.register(CommandeService)
class CommandeServiceAdmin(admin.ModelAdmin):
    list_display = ("numero_commande", "service", "statut", "priorite")
    inlines = [LigneCommandeInline]


@admin.register(Utilisateur)
class UtilisateurAdmin(admin.ModelAdmin):
    list_display = ("username", "fonction", "role", "is_staff", "is_active")
    list_filter = ("fonction", "role", "is_staff", "is_active")
    search_fields = ("username", "first_name", "last_name", "email")


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ("name", "codename", "resource", "can_view", "can_add", "can_change", "can_delete")
    list_filter = ("resource",)
    search_fields = ("name", "codename")
    ordering = ("resource", "codename")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at")
    list_filter = ("is_active",)
    filter_horizontal = ("permissions",)
    search_fields = ("name", "description")
