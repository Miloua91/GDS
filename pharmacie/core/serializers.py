from rest_framework import serializers
from .models import (
    Produit,
    LotProduit,
    MouvementStock,
    Fournisseur,
    CommandeService,
    LigneCommandeService,
    Magasin,
    Service,
    Utilisateur,
    Role,
    Permission,
)


class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = "__all__"


class LotSerializer(serializers.ModelSerializer):
    produit_denomination = serializers.CharField(
        source="produit.denomination", read_only=True
    )
    produit_code_national = serializers.CharField(
        source="produit.code_national", read_only=True
    )
    produit_code_interne = serializers.CharField(
        source="produit.code_interne", read_only=True
    )
    produit_forme = serializers.CharField(
        source="produit.forme_pharmaceutique", read_only=True
    )
    produit_dosage = serializers.CharField(source="produit.dosage", read_only=True)
    produit_dci = serializers.CharField(source="produit.dci", read_only=True)
    produit_stock_securite = serializers.IntegerField(
        source="produit.stock_securite", read_only=True
    )
    produit_stock_alerte = serializers.IntegerField(
        source="produit.stock_alerte", read_only=True
    )
    magasin_nom = serializers.CharField(source="magasin.nom", read_only=True)

    class Meta:
        model = LotProduit
        fields = [
            "id",
            "produit",
            "magasin",
            "magasin_nom",
            "numero_lot",
            "date_fabrication",
            "date_peremption",
            "date_reception",
            "quantite_initiale",
            "quantite_actuelle",
            "quantite_reservee",
            "statut",
            "prix_unitaire_achat",
            "produit_denomination",
            "produit_code_national",
            "produit_code_interne",
            "produit_forme",
            "produit_dosage",
            "produit_dci",
            "produit_stock_securite",
            "produit_stock_alerte",
        ]


class MouvementSerializer(serializers.ModelSerializer):
    produit_denomination = serializers.CharField(
        source="produit.denomination", read_only=True
    )
    lot_numero = serializers.CharField(source="lot.numero_lot", read_only=True)
    magasin_source_nom = serializers.CharField(
        source="magasin_source.nom", read_only=True
    )
    magasin_destination_nom = serializers.CharField(
        source="magasin_destination.nom", read_only=True
    )

    class Meta:
        model = MouvementStock
        fields = "__all__"


class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class LigneCommandeSerializer(serializers.ModelSerializer):
    produit_denomination = serializers.CharField(
        source="produit.denomination", read_only=True
    )

    class Meta:
        model = LigneCommandeService
        fields = "__all__"


class CommandeSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source="service.nom", read_only=True)
    lignes = LigneCommandeSerializer(many=True, read_only=True)

    class Meta:
        model = CommandeService
        fields = "__all__"


class MagasinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Magasin
        fields = "__all__"


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = "__all__"


class PermissionIdField(serializers.ListField):
    def to_internal_value(self, data):
        if not isinstance(data, list):
            self.fail("not_a_list")

        validated = []
        for item in data:
            if isinstance(item, dict):
                validated.append(item.get("id") or item.get("pk"))
            else:
                validated.append(item)

        return super().to_internal_value(validated)


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = PermissionIdField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description",
            "is_active",
            "permissions",
            "permission_ids",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        permissions = validated_data.pop("permission_ids", [])
        role = Role.objects.create(**validated_data)
        role.permissions.set(permissions)
        return role

    def update(self, instance, validated_data):
        permissions = validated_data.pop("permission_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if permissions is not None:
            instance.permissions.set(permissions)
        return instance


class UtilisateurSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source="role.name", read_only=True)
    service_nom = serializers.CharField(source="service.nom", read_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "fonction",
            "specialite",
            "telephone",
            "numero_ordre",
            "is_active",
            "is_staff",
            "date_joined",
            "role",
            "role_name",
            "service",
            "service_nom",
        ]
        read_only_fields = ["id", "date_joined"]


class UtilisateurCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "fonction",
            "specialite",
            "telephone",
            "numero_ordre",
            "is_active",
            "is_staff",
            "role",
            "service",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()
        return user
