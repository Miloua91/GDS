from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.request import Request
from django.db.models import QuerySet, Sum
from django.utils import timezone
from datetime import datetime
from rest_framework import status as rf_status
from .models import (
    Produit, LotProduit, MouvementStock, Fournisseur,
    CommandeService, LigneCommandeService, Magasin, Service, Utilisateur,
    Role, Permission, Journal
)
from .serializers import (
    ProduitSerializer, LotSerializer, MouvementSerializer,
    FournisseurSerializer, ServiceSerializer, CommandeSerializer,
    MagasinSerializer, UtilisateurSerializer, UtilisateurCreateSerializer,
    RoleSerializer, PermissionSerializer
)


class LoggingMixin:
    """Mixin to automatically log all CRUD operations"""
    
    def get_categorie(self):
        """Override in subclasses to define the category"""
        return 'SYSTEM'
    
    def get_entity_name(self):
        """Override in subclasses to define entity name"""
        return self.__class__.__name__
    
    def perform_create(self, serializer):
        instance = serializer.save()
        log_journal(
            request=self.request,
            categorie=self.get_categorie(),
            action='CREATE',
            description=f'Création de {self.get_entity_name()} #{instance.id}',
            entity_type=self.get_entity_name(),
            entity_id=instance.id,
            entity_description=str(instance),
        )
    
    def perform_update(self, serializer):
        instance = serializer.save()
        log_journal(
            request=self.request,
            categorie=self.get_categorie(),
            action='UPDATE',
            description=f'Modification de {self.get_entity_name()} #{instance.id}',
            entity_type=self.get_entity_name(),
            entity_id=instance.id,
            entity_description=str(instance),
        )
    
    def perform_destroy(self, instance):
        entity_id = instance.id
        entity_desc = str(instance)
        super().perform_destroy(instance)
        log_journal(
            request=self.request,
            categorie=self.get_categorie(),
            action='DELETE',
            description=f'Suppression de {self.get_entity_name()} #{entity_id}',
            entity_type=self.get_entity_name(),
            entity_id=entity_id,
            entity_description=entity_desc,
        )


def log_journal(request, categorie, action, description, entity_type=None, entity_id=None, entity_description=None, ancien_statut=None, nouveau_statut=None, details=None):
    """Helper function to create journal entries"""
    utilisateur = None
    if request and hasattr(request, 'user') and request.user.is_authenticated:
        utilisateur = request.user
    
    Journal.objects.create(
        categorie=categorie,
        action=action,
        description=description,
        utilisateur=utilisateur,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_description=entity_description,
        ancien_statut=ancien_statut,
        nouveau_statut=nouveau_statut,
        details=details or {}
    )


RESOURCES = ['produits', 'lots', 'mouvements', 'fournisseurs', 'commandes', 'magasins', 'services', 'utilisateurs', 'roles', 'dashboard', 'journals']

def build_permissions(utilisateur):
    """Build permissions dict from user's role"""
    permissions = {}
    
    # If user is superuser, give all permissions
    if utilisateur.is_superuser:
        for resource in RESOURCES:
            permissions[f'can_view_{resource}'] = True
            permissions[f'can_add_{resource}'] = True
            permissions[f'can_change_{resource}'] = True
            permissions[f'can_delete_{resource}'] = True
        return permissions
    
    # Build from role
    if utilisateur.role:
        perms = utilisateur.role.permissions.all()
        for resource in RESOURCES:
            permissions[f'can_view_{resource}'] = perms.filter(resource=resource, can_view=True).exists()
            permissions[f'can_add_{resource}'] = perms.filter(resource=resource, can_add=True).exists()
            permissions[f'can_change_{resource}'] = perms.filter(resource=resource, can_change=True).exists()
            permissions[f'can_delete_{resource}'] = perms.filter(resource=resource, can_delete=True).exists()
    else:
        # No role - no permissions by default
        for resource in RESOURCES:
            permissions[f'can_view_{resource}'] = False
            permissions[f'can_add_{resource}'] = False
            permissions[f'can_change_{resource}'] = False
            permissions[f'can_delete_{resource}'] = False
    
    return permissions


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    permissions = build_permissions(user)
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'fonction': user.fonction,
        'role': user.role.name if user.role else None,
        'role_id': user.role.id if user.role else None,
        'service': user.service.nom if user.service else None,
        'service_id': user.service.id if user.service else None,
        'permissions': permissions,
    })


class Pagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        response['X-Total-Count'] = self.page.paginator.count
        return response


def check_permission(user, resource, action):
    """Helper to check user permission"""
    if user.is_superuser:
        return True
    return user.has_permission(resource, action)


def apply_filtering(queryset, request, search_fields):
    """Apply search filtering to queryset"""
    search = request.query_params.get('search')
    if search:
        from django.db.models import Q
        query = Q()
        for field in search_fields:
            query |= Q(**{f'{field}__icontains': search})
        queryset = queryset.filter(query)
    return queryset


class ProduitViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Produit.objects.all()
    
    def get_categorie(self):
        return 'PRODUIT'
    
    def get_entity_name(self):
        return 'Produit'
    serializer_class = ProduitSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not check_permission(user, 'produits', 'view'):
            return Produit.objects.none()
        
        queryset = super().get_queryset()
        queryset = apply_filtering(queryset, self.request, ['code_national', 'code_interne', 'denomination', 'dci', 'denomination_commerciale'])
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
        return queryset


class LotViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = LotProduit.objects.select_related('produit').all()
    serializer_class = LotSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_categorie(self):
        return 'STOCK'
    
    def get_entity_name(self):
        return 'Lot'

    def get_queryset(self):
        user = self.request.user
        if not check_permission(user, 'lots', 'view'):
            return LotProduit.objects.none()
        
        queryset = super().get_queryset()
        
        # Search by lot number or product name
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(numero_lot__icontains=search) |
                Q(produit__denomination__icontains=search) |
                Q(produit__code_national__icontains=search) |
                Q(produit__dci__icontains=search)
            )
        
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
        return queryset


class MouvementViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = MouvementStock.objects.select_related(
        'produit', 'lot', 'magasin_source', 'magasin_destination'
    ).all()
    serializer_class = MouvementSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_categorie(self):
        return 'STOCK'
    
    def get_entity_name(self):
        return 'Mouvement'

    def get_queryset(self):
        user = self.request.user
        if not check_permission(user, 'mouvements', 'view'):
            return MouvementStock.objects.none()
        
        queryset = super().get_queryset()
        queryset = apply_filtering(queryset, self.request, ['type_mouvement', 'numero_mouvement'])
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
        return queryset


class FournisseurViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_categorie(self):
        return 'SYSTEM'
    
    def get_entity_name(self):
        return 'Fournisseur'

    def get_queryset(self):
        user = self.request.user
        if not check_permission(user, 'fournisseurs', 'view'):
            return Fournisseur.objects.none()
        
        queryset = super().get_queryset()
        queryset = apply_filtering(queryset, self.request, ['code_fournisseur', 'raison_sociale'])
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
        return queryset


class ServiceViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_categorie(self):
        return 'SYSTEM'
    
    def get_entity_name(self):
        return 'Service'

    def get_queryset(self):
        user = self.request.user
        if not check_permission(user, 'services', 'view'):
            return Service.objects.none()
        
        queryset = super().get_queryset()
        queryset = apply_filtering(queryset, self.request, ['code_service', 'nom'])
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
        return queryset


class CommandeViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = CommandeService.objects.select_related('service').prefetch_related('lignes__produit').all()
    serializer_class = CommandeSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_categorie(self):
        return 'COMMANDE'
    
    def get_entity_name(self):
        return 'Commande'

    def get_queryset(self):
        user = self.request.user
        if not check_permission(user, 'commandes', 'view'):
            return CommandeService.objects.none()
        
        queryset = super().get_queryset()
        
        # Filter by service for non-admin users (users without full change permissions)
        service_filter = self.request.query_params.get('service')
        if service_filter:
            queryset = queryset.filter(service_id=service_filter)
        else:
            # Check if user has change permission (can manage orders)
            has_change_perm = False
            if hasattr(user, 'role') and user.role:
                has_change_perm = user.role.permissions.filter(resource='commandes', can_change=True).exists()
            
            # If no change permission and has service, filter by service
            if not has_change_perm and hasattr(user, 'service') and user.service:
                queryset = queryset.filter(service=user.service)
        
        # Filter by statut if provided
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        # Search filtering
        queryset = apply_filtering(queryset, self.request, ['numero_commande', 'statut'])
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-date_demande')
        return queryset

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_statut = instance.statut
        response = super().partial_update(request, *args, **kwargs)
        
        if response.status_code in [200, 201]:
            new_statut = request.data.get('statut')
            if new_statut and new_statut != old_statut:
                action = 'UPDATE'
                if new_statut == 'VALIDEE':
                    action = 'VALIDATE'
                elif new_statut == 'ANNULEE':
                    action = 'ANNUL'
                elif new_statut == 'LIVREE':
                    action = 'LIVRE'
                
                log_journal(
                    request=request,
                    categorie='COMMANDE',
                    action=action,
                    description=f'Statut de la commande {instance.numero_commande} modifié: {old_statut} → {new_statut}',
                    entity_type='CommandeService',
                    entity_id=instance.id,
                    entity_description=instance.numero_commande,
                    ancien_statut=old_statut,
                    nouveau_statut=new_statut
                )
        
        return response


class MagasinViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Magasin.objects.all()
    serializer_class = MagasinSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_categorie(self):
        return 'SYSTEM'
    
    def get_entity_name(self):
        return 'Magasin'

    def get_queryset(self):
        user = self.request.user
        if not check_permission(user, 'magasins', 'view'):
            return Magasin.objects.none()
        
        queryset = super().get_queryset()
        queryset = apply_filtering(queryset, self.request, ['code_magasin', 'nom'])
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
        return queryset


class RoleViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_categorie(self):
        return 'UTILISATEUR'
    
    def get_entity_name(self):
        return 'Role'

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = apply_filtering(queryset, self.request, ['name'])
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
        return queryset


class PermissionViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_categorie(self):
        return 'UTILISATEUR'
    
    def get_entity_name(self):
        return 'Permission'

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = apply_filtering(queryset, self.request, ['resource'])
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
        return queryset


class UtilisateurViewSet(LoggingMixin, viewsets.ModelViewSet):
    queryset = Utilisateur.objects.select_related('role', 'service').all()
    serializer_class = UtilisateurSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]

    def get_categorie(self):
        return 'UTILISATEUR'
    
    def get_entity_name(self):
        return 'Utilisateur'

    def get_serializer_class(self):
        if self.action == 'create':
            return UtilisateurCreateSerializer
        return UtilisateurSerializer

    def get_queryset(self):
        user = self.request.user
        if not check_permission(user, 'utilisateurs', 'view'):
            return Utilisateur.objects.none()
        
        queryset = super().get_queryset()
        queryset = apply_filtering(queryset, self.request, ['username', 'first_name', 'last_name', 'email'])
        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('id')
        return queryset

    def check_permissions(self, request):
        user = request.user
        action = request.method.lower()
        action_map = {
            'post': 'add',
            'put': 'change',
            'patch': 'change',
            'delete': 'delete',
        }
        perm_action = action_map.get(action, 'view')
        if not check_permission(user, 'utilisateurs', perm_action):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(f"Vous n'avez pas la permission de {perm_action} des utilisateurs")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def produits_with_stock(request):
    """Get products with aggregated stock information"""
    queryset = Produit.objects.filter(actif=True).annotate(
        stock_total=Sum('lotproduit__quantite_actuelle')
    ).order_by('denomination')
    
    search = request.query_params.get('search')
    if search:
        from django.db.models import Q
        queryset = queryset.filter(
            Q(code_national__icontains=search) |
            Q(code_interne__icontains=search) |
            Q(denomination__icontains=search) |
            Q(dci__icontains=search)
        )
    
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 25))
    start = (page - 1) * page_size
    end = start + page_size
    
    total = queryset.count()
    produits = queryset[start:end]
    
    data = [{
        'id': p.id,
        'code_national': p.code_national,
        'code_interne': p.code_interne,
        'denomination': p.denomination,
        'dci': p.dci,
        'forme_pharmaceutique': p.forme_pharmaceutique,
        'dosage': p.dosage,
        'stock_total': p.stock_total or 0,
    } for p in produits]
    
    return Response({
        'count': total,
        'results': data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_order(request):
    """Create a quick order with multiple products"""
    service_id = request.data.get('service_id')
    lignes = request.data.get('lignes', [])
    
    if not service_id:
        return Response({'error': 'service_id is required'}, status=400)
    
    if not lignes:
        return Response({'error': 'At least one product is required'}, status=400)
    
    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return Response({'error': 'Service not found'}, status=404)
    
    today = timezone.now().strftime('%Y%m%d')
    last_order = CommandeService.objects.filter(
        numero_commande__startswith=f'CMD-{today}'
    ).order_by('-numero_commande').first()
    
    if last_order:
        last_num = int(last_order.numero_commande.split('-')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    
    numero_commande = f"CMD-{today}-{new_num:04d}"
    
    commande = CommandeService.objects.create(
        numero_commande=numero_commande,
        service=service,
        statut='EN_ATTENTE',
        priorite='NORMALE'
    )
    
    order_lines = []
    for ligne in lignes:
        produit_id = ligne.get('produit_id')
        quantite = ligne.get('quantite_demandee')
        
        if not produit_id or not quantite:
            continue
            
        try:
            produit = Produit.objects.get(id=produit_id)
        except Produit.DoesNotExist:
            continue
        
        ligne_commande = LigneCommandeService.objects.create(
            commande=commande,
            produit=produit,
            quantite_demandee=quantite,
            quantite_livree=0,
            statut='EN_ATTENTE'
        )
        order_lines.append({
            'id': ligne_commande.id,
            'produit_id': produit.id,
            'produit_denomination': produit.denomination,
            'quantite_demandee': quantite,
            'quantite_livree': 0,
            'statut': 'EN_ATTENTE'
        })
    
    log_journal(
        request=request,
        categorie='COMMANDE',
        action='CREATE',
        description=f'Nouvelle commande créée: {numero_commande} pour le service {service.nom}',
        entity_type='CommandeService',
        entity_id=commande.id,
        entity_description=numero_commande,
        nouveau_statut='EN_ATTENTE',
        details={'service': service.nom, 'nombre_lignes': len(order_lines)}
    )
    
    return Response({
        'id': commande.id,
        'numero_commande': numero_commande,
        'service_id': service.id,
        'service_nom': service.nom,
        'statut': commande.statut,
        'priorite': commande.priorite,
        'date_demande': commande.date_demande,
        'lignes': order_lines
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deliver_order(request):
    """Deliver an order and deduct stock"""
    commande_id = request.data.get('commande_id')
    
    if not commande_id:
        return Response({'error': 'commande_id is required'}, status=400)
    
    try:
        commande = CommandeService.objects.get(id=commande_id)
    except CommandeService.DoesNotExist:
        return Response({'error': 'Commande not found'}, status=404)
    
    if commande.statut != 'EN_COURS':
        return Response({'error': 'La commande doit être en cours pour être livrée'}, status=400)
    
    today = timezone.now().strftime('%Y%m%d')
    last_mouvement = MouvementStock.objects.filter(
        numero_mouvement__startswith=f'MVT-{today}'
    ).order_by('-numero_mouvement').first()
    
    if last_mouvement:
        last_num = int(last_mouvement.numero_mouvement.split('-')[-1])
    else:
        last_num = 0
    
    for ligne in commande.lignes.all():
        quantite_a_livrer = ligne.quantite_demandee - ligne.quantite_livree
        if quantite_a_livrer <= 0:
            continue
        
        lots = LotProduit.objects.filter(
            produit=ligne.produit,
            quantite_actuelle__gt=0,
            statut='DISPONIBLE'
        ).order_by('date_peremption')
        
        remaining = quantite_a_livrer
        for lot in lots:
            if remaining <= 0:
                break
            
            available = lot.quantite_actuelle
            deduct = min(available, remaining)
            
            lot.quantite_actuelle -= deduct
            lot.save()
            
            last_num += 1
            numero_mouvement = f"MVT-{today}-{last_num:05d}"
            
            MouvementStock.objects.create(
                numero_mouvement=numero_mouvement,
                produit=ligne.produit,
                lot=lot,
                type_mouvement='SORTIE_SERVICE',
                quantite=deduct,
                date_mouvement=timezone.now()
            )
            
            remaining -= deduct
            ligne.quantite_livree += deduct
        
        if remaining > 0:
            ligne.quantite_livree += (quantite_a_livrer - remaining)
        else:
            ligne.quantite_livree = ligne.quantite_demandee
        
        if ligne.quantite_livree >= ligne.quantite_demandee:
            ligne.statut = 'LIVREE'
        
        ligne.save()
    
    all_delivered = all(
        ligne.quantite_livree >= ligne.quantite_demandee 
        for ligne in commande.lignes.all()
    )
    
    if all_delivered:
        commande.statut = 'LIVREE'
    else:
        commande.statut = 'EN_COURS'
    
    ancien_statut = 'EN_COURS'
    commande.save()
    
    log_journal(
        request=request,
        categorie='COMMANDE',
        action='LIVRE',
        description=f'Commande livrée: {commande.numero_commande}',
        entity_type='CommandeService',
        entity_id=commande.id,
        entity_description=commande.numero_commande,
        ancien_statut=ancien_statut,
        nouveau_statut=commande.statut
    )
    
    return Response({
        'id': commande.id,
        'numero_commande': commande.numero_commande,
        'statut': commande.statut,
        'message': 'Commande livrée et stock déduit' if commande.statut == 'LIVREE' else 'Partiellement livrée'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stock_reception(request):
    """Receive stock with lots/batches and optional document"""
    fournisseur_id = request.data.get('fournisseur_id')
    lignes = request.data.get('lignes', [])
    document = request.data.get('document', None)
    
    if not fournisseur_id:
        return Response({'error': 'fournisseur_id is required'}, status=400)
    
    if not lignes:
        return Response({'error': 'At least one product is required'}, status=400)
    
    try:
        fournisseur = Fournisseur.objects.get(id=fournisseur_id)
    except Fournisseur.DoesNotExist:
        return Response({'error': 'Fournisseur not found'}, status=404)
    
    lots_created = []
    
    for ligne in lignes:
        produit_id = ligne.get('produit_id')
        numero_lot = ligne.get('numero_lot')
        quantite = ligne.get('quantite')
        date_fabrication = ligne.get('date_fabrication')
        date_peremption = ligne.get('date_peremption')
        date_reception = ligne.get('date_reception') or timezone.now().date()
        prix_unitaire = ligne.get('prix_unitaire')
        
        if not produit_id or not numero_lot or not quantite:
            continue
        
        try:
            produit = Produit.objects.get(id=produit_id)
        except Produit.DoesNotExist:
            continue
        
        lot, created = LotProduit.objects.get_or_create(
            produit=produit,
            numero_lot=numero_lot,
            defaults={
                'quantite_initiale': quantite,
                'quantite_actuelle': quantite,
                'quantite_reservee': 0,
                'date_fabrication': date_fabrication,
                'date_peremption': date_peremption,
                'date_reception': date_reception,
                'prix_unitaire_achat': prix_unitaire,
                'statut': 'DISPONIBLE'
            }
        )
        
        if not created:
            lot.quantite_actuelle += quantite
            lot.save()
        
        today = timezone.now().strftime('%Y%m%d')
        last_mouvement = MouvementStock.objects.filter(
            numero_mouvement__startswith=f'MVT-{today}'
        ).order_by('-numero_mouvement').first()
        
        if last_mouvement:
            last_num = int(last_mouvement.numero_mouvement.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        numero_mouvement = f"MVT-{today}-{new_num:05d}"
        
        MouvementStock.objects.create(
            numero_mouvement=numero_mouvement,
            produit=produit,
            lot=lot,
            type_mouvement='ENTREE_ACHAT',
            quantite=quantite,
            date_mouvement=timezone.now()
        )
        
        lots_created.append({
            'id': lot.id,
            'produit_id': produit.id,
            'produit_denomination': produit.denomination,
            'numero_lot': lot.numero_lot,
            'quantite': quantite,
            'date_peremption': lot.date_peremption,
        })
    
    log_journal(
        request=request,
        categorie='STOCK',
        action='RECEPTION',
        description=f'Réception de stock du fournisseur {fournisseur.raison_sociale}: {len(lots_created)} lot(s)',
        entity_type='Fournisseur',
        entity_id=fournisseur.id,
        entity_description=fournisseur.raison_sociale,
        details={'lots': lots_created, 'nombre_lots': len(lots_created)}
    )
    
    return Response({
        'fournisseur_id': fournisseur.id,
        'fournisseur_nom': fournisseur.raison_sociale,
        'document': document,
        'lots': lots_created,
        'nombre_lots': len(lots_created)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_kpis(request):
    """Get dashboard KPIs"""
    from django.db.models import Count, Q, F
    from django.db.models.functions import Coalesce
    from django.db import connection
    
    today = timezone.now().date()
    thirty_days = today + timezone.timedelta(days=30)
    ninety_days = today + timezone.timedelta(days=90)
    
    lots_with_price = LotProduit.objects.filter(
        statut='DISPONIBLE',
        prix_unitaire_achat__isnull=False
    )
    total_stock_value = sum(
        float(lot.quantite_actuelle) * float(lot.prix_unitaire_achat or 0)
        for lot in lots_with_price
    )
    
    products_with_stock = LotProduit.objects.filter(
        quantite_actuelle__gt=0,
        statut='DISPONIBLE'
    ).values('produit').distinct().count()
    
    total_products = Produit.objects.filter(actif=True).count()
    ruptures_count = total_products - products_with_stock
    
    lots_expiring_30 = LotProduit.objects.filter(
        date_peremption__lte=thirty_days,
        date_peremption__gte=today,
        quantite_actuelle__gt=0
    ).count()
    
    lots_expiring_90 = LotProduit.objects.filter(
        date_peremption__lte=ninety_days,
        date_peremption__gte=today,
        quantite_actuelle__gt=0
    ).count()
    
    low_stock_products = []
    low_stock_produits = Produit.objects.filter(
        actif=True
    ).annotate(
        stock_total=Sum('lotproduit__quantite_actuelle')
    ).filter(
        stock_total__lt=F('stock_securite'),
        stock_securite__gt=0
    )[:10]
    
    for p in low_stock_produits:
        low_stock_products.append({
            'id': p.id,
            'denomination': p.denomination,
            'stock_total': p.stock_total or 0,
            'stock_securite': p.stock_securite,
        })
    
    expiring_lots = []
    expiring = LotProduit.objects.filter(
        date_peremption__lte=thirty_days,
        date_peremption__gte=today,
        quantite_actuelle__gt=0
    ).select_related('produit')[:10]
    
    for lot in expiring:
        expiring_lots.append({
            'id': lot.id,
            'produit_denomination': lot.produit.denomination,
            'numero_lot': lot.numero_lot,
            'quantite': lot.quantite_actuelle,
            'date_peremption': lot.date_peremption,
            'jours_restants': (lot.date_peremption - today).days,
        })
    
    pending_orders = CommandeService.objects.filter(
        statut__in=['EN_ATTENTE', 'VALIDEE']
    ).count()
    
    return Response({
        'stock_value': float(total_stock_value),
        'ruptures_count': ruptures_count,
        'total_products': total_products,
        'products_with_stock': products_with_stock,
        'lots_expiring_30_days': lots_expiring_30,
        'lots_expiring_90_days': lots_expiring_90,
        'low_stock_products': low_stock_products,
        'expiring_lots': expiring_lots,
        'pending_orders': pending_orders,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_list(request):
    """Get aggregated stock by product"""
    from django.db.models import Sum, Count, Q
    
    # Get all products with their aggregated stock
    products = Produit.objects.filter(actif=True).annotate(
        total_stock=Sum('lotproduit__quantite_actuelle'),
        lots_count=Count('lotproduit')
    ).order_by('denomination')
    
    # Apply search filter
    search = request.query_params.get('search')
    if search:
        products = products.filter(
            Q(denomination__icontains=search) |
            Q(code_national__icontains=search) |
            Q(code_interne__icontains=search) |
            Q(dci__icontains=search)
        )
    
    # Pagination
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 100))
    start = (page - 1) * page_size
    end = start + page_size
    
    total = products.count()
    products_page = products[start:end]
    
    results = []
    for p in products_page:
        results.append({
            'id': p.id,
            'code_national': p.code_national,
            'code_interne': p.code_interne,
            'denomination': p.denomination,
            'forme_pharmaceutique': p.forme_pharmaceutique,
            'dosage': p.dosage,
            'dci': p.dci,
            'stock_securite': p.stock_securite,
            'stock_alerte': p.stock_alerte,
            'total_stock': p.total_stock or 0,
            'lots_count': p.lots_count,
        })
    
    return Response({
        'results': results,
        'count': total,
        'total_pages': (total + page_size - 1) // page_size,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def journal_list(request):
    """Get journal entries with optional filtering"""
    categorie = request.query_params.get('categorie')
    action = request.query_params.get('action')
    
    queryset = Journal.objects.all().select_related('utilisateur')
    
    if categorie:
        queryset = queryset.filter(categorie=categorie)
    if action:
        queryset = queryset.filter(action=action)
    
    # Search
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(description__icontains=search)
    
    # Pagination
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 25))
    start = (page - 1) * page_size
    end = start + page_size
    
    total = queryset.count()
    journals = queryset[start:end]
    
    data = [{
        'id': j.id,
        'categorie': j.categorie,
        'action': j.action,
        'description': j.description,
        'utilisateur': j.utilisateur.username if j.utilisateur else None,
        'entity_type': j.entity_type,
        'entity_id': j.entity_id,
        'entity_description': j.entity_description,
        'ancien_statut': j.ancien_statut,
        'nouveau_statut': j.nouveau_statut,
        'details': j.details,
        'date_creation': j.date_creation,
    } for j in journals]
    
    return Response({
        'count': total,
        'results': data,
    })
