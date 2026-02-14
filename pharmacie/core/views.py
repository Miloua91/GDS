from django.shortcuts import render
from .pagination import ReactAdminPagination

class ProduitViewSet(ModelViewSet):
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    pagination_class = ReactAdminPagination
