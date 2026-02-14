from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register("produits", api_views.ProduitViewSet)
router.register("lots", api_views.LotViewSet)
router.register("mouvements", api_views.MouvementViewSet)
router.register("fournisseurs", api_views.FournisseurViewSet)
router.register("services", api_views.ServiceViewSet)
router.register("commandes", api_views.CommandeViewSet)
router.register("magasins", api_views.MagasinViewSet)
router.register("utilisateurs", api_views.UtilisateurViewSet)
router.register("roles", api_views.RoleViewSet)
router.register("permissions", api_views.PermissionViewSet)

urlpatterns = router.urls
