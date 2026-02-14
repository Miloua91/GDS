# Pharma - Pharmaceutical Management System

A full-stack web application for managing pharmaceutical products, inventory, suppliers, and orders in a healthcare facility.

## Tech Stack

### Backend
- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Database**: SQLite3 (development)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **CORS**: django-corsheaders

### Frontend
- **Framework**: React with TanStack Start
- **Admin UI**: shadcn-admin-kit (built on React Admin)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State/Data Fetching**: TanStack Query (React Query)

## Project Structure

```
pharma/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── admin/       # Admin components (List, DataTable, etc.)
│   │   │   └── ui/          # Base UI components (shadcn)
│   │   ├── features/        # Feature-specific components
│   │   │   ├── produits/    # Products feature
│   │   │   ├── lots/        # Lots/batches feature
│   │   │   ├── mouvements/  # Stock movements feature
│   │   │   ├── fournisseurs/# Suppliers feature
│   │   │   ├── commandes/   # Orders feature
│   │   │   ├── dashboard/    # Dashboard/KPIs feature
│   │   │   ├── journal/     # Audit logging feature
│   │   │   ├── services/    # Services feature
│   │   │   └── utilisateurs/# Users feature
│   │   ├── lib/             # Utilities (auth, dataProvider, i18n)
│   │   └── routes/          # TanStack Router routes
│   └── package.json
│
├── pharmacie/                # Django backend
│   ├── core/                # Main Django app
│   │   ├── models/          # Database models
│   │   │   ├── base.py      # Base model with timestamps
│   │   │   ├── produits.py  # Product model
│   │   │   ├── stocks.py    # Lot/Batch model
│   │   │   ├── mouvements.py # Stock movement model
│   │   │   ├── fournisseurs.py # Supplier model
│   │   │   ├── commandes.py # Order model
│   │   │   ├── lignes_commandes.py # Order line model
│   │   │   ├── magasins.py  # Warehouse model
│   │   │   ├── services.py  # Service model
│   │   │   ├── utilisateurs.py # User model
│   │   │   ├── roles.py     # Role & Permission models
│   │   │   └── journal.py   # Audit logging model
│   │   ├── api_views.py     # DRF ViewSets
│   │   ├── serializers.py    # DRF Serializers
│   │   ├── views.py          # Django views
│   │   ├── api_urls.py      # API URL routing
│   │   └── admin.py          # Django admin config
│   └── pharmacie/
│       └── settings.py       # Django settings
│
└── venv/                    # Python virtual environment
```

## Database Models

### Core Entities

1. **Produit** (Product)
   - `code_national`: National drug code (unique)
   - `code_interne`: Internal code
   - `denomination`: Drug name
   - `forme_pharmaceutique`: Pharmaceutical form
   - `dosage`: Dosage
   - `dci`: Generic name
   - `type_produit`: Product type (MEDICAMENT, DISPOSITIF_MEDICAL, etc.)
   - `categorie_surveillance`: Surveillance category (NORMAL, PSYCHOTROPE, STUPEFIANT, etc.)
   - `statut`: Status (ACTIF, INACTIF, RETIRE, RUPTURE_NATIONALE)
   - `actif`: Boolean for active status

2. **LotProduit** (Product Lot/Batch)
   - `produit`: ForeignKey to Produit
   - `numero_lot`: Lot number
   - `date_fabrication`: Manufacturing date
   - `date_peremption`: Expiry date
   - `date_reception`: Reception date
   - `quantite_initiale`: Initial quantity
   - `quantite_actuelle`: Current quantity
   - `quantite_reservee`: Reserved quantity
   - `statut`: Lot status

3. **MouvementStock** (Stock Movement)
   - `numero_mouvement`: Movement number
   - `produit`: ForeignKey to Produit
   - `lot`: ForeignKey to LotProduit
   - `type_mouvement`: Movement type (ENTREE_ACHAT, SORTIE_SERVICE, TRANSFERT, PERIME, AJUSTEMENT)
   - `quantite`: Quantity
   - `magasin_source`: Source warehouse
   - `magasin_destination`: Destination warehouse
   - `date_mouvement`: Movement date

4. **Fournisseur** (Supplier)
   - `code_fournisseur`: Supplier code
   - `raison_sociale`: Company name
   - `sigle`: Acronym
   - `type_fournisseur`: Supplier type (FABRICANT, GROSSISTE, IMPORTATEUR, etc.)
   - `adresse`: Address
   - `wilaya`: State/Region
   - `telephone`: Phone
   - `email`: Email
   - `statut`: Status

5. **CommandeService** (Service Order)
   - `numero_commande`: Order number
   - `service`: ForeignKey to Service
   - `statut`: Order status (EN_ATTENTE, VALIDEE, EN_COURS, LIVREE, ANNULEE)
   - `priorite`: Priority (URGENTE, HAUTE, NORMALE, BASSE)
   - `date_demande`: Request date

6. **LigneCommandeService** (Order Line)
   - `commande`: ForeignKey to CommandeService
   - `produit`: ForeignKey to Produit
   - `quantite_demandee`: Requested quantity
   - `quantite_livree`: Delivered quantity
   - `statut`: Line status

7. **Magasin** (Warehouse)
   - `code_magasin`: Warehouse code
   - `nom`: Name
   - `type_magasin`: Warehouse type (PRINCIPAL, PSYCHOTROPES, CHAINE_FROID, CONSOMMABLES)
   - `batiment`: Building
   - `etage`: Floor
   - `niveau_securite`: Security level
   - `actif`: Active status

8. **Service** (Hospital Service)
   - `code_service`: Service code
   - `nom`: Name
   - `type_service`: Service type
   - `specialite`: Specialty
   - `nombre_lits`: Number of beds
   - `actif`: Active status

9. **Utilisateur** (User) - extends Django's AbstractUser
   - Inherits from Django's User model
   - `fonction`: Job function (ADMIN, PHARMACIEN, MEDECIN, RESPONSABLE, etc.)
   - `role`: ForeignKey to Role
   - `service`: ForeignKey to Service (assigned service for orders)

10. **Role** (Role)
    - `name`: Role name
    - `description`: Description
    - `is_active`: Active status

11. **Permission** (Permission)
    - `role`: ForeignKey to Role
    - `resource`: Resource name (produits, lots, mouvements, etc.)
    - `can_view`, `can_add`, `can_change`, `can_delete`: Boolean permissions

12. **Journal** (Audit Log)
    - `categorie`: Category (COMMANDE, STOCK, PRODUIT, UTILISATEUR, SYSTEM)
    - `action`: Action (CREATE, UPDATE, DELETE, VALIDATE, ANNUL, LIVRE, RECEPTION)
    - `description`: Description text
    - `utilisateur`: User who performed the action
    - `entity_type`, `entity_id`, `entity_description`: Reference to affected entity
    - `ancien_statut`, `nouveau_statut`: Old/new status for status changes
    - `details`: JSON field for additional details

## API Endpoints

The API is available at `/api/` with the following structure:

```
GET    /api/produits/              # List products
POST   /api/produits/              # Create product
GET    /api/produits/{id}/         # Get product
PUT    /api/produits/{id}/         # Update product
DELETE /api/produits/{id}/         # Delete product

GET    /api/lots/                  # List lots
POST   /api/lots/                  # Create lot
GET    /api/lots/{id}/             # Get lot
...

(same pattern for all resources)
```

### Custom Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/produits-with-stock/` | GET | List products with aggregated stock |
| `/api/commandes-rapides/` | POST | Create quick order |
| `/api/commandes/livrer/` | POST | Deliver order and deduct stock |
| `/api/stock/reception/` | POST | Receive stock with lots |
| `/api/dashboard/kpis/` | GET | Get dashboard KPIs |
| `/api/journals/` | GET | Get audit logs |

#### produits-with-stock

Returns products with aggregated stock from lots.

**Query Parameters:**
- `search`: Search by code_national, code_interne, denomination, dci
- `page`, `page_size`: Pagination

#### commandes-rapides (Quick Order)

Create a quick order with multiple products in a single request.

**Request Body:**
```json
{
  "service_id": 1,
  "lignes": [
    { "produit_id": 1, "quantite_demandee": 10 },
    { "produit_id": 2, "quantite_demandee": 5 }
  ]
}
```

#### commandes/livrer (Deliver Order)

Deliver an order and automatically deduct stock from lots.

**Request Body:**
```json
{
  "commande_id": 1
}
```

#### stock/reception (Stock Reception)

Receive stock from supplier and create lots.

**Request Body:**
```json
{
  "fournisseur_id": 1,
  "lignes": [
    {
      "produit_id": 1,
      "numero_lot": "LOT-001",
      "quantite": 100,
      "date_fabrication": "2025-01-01",
      "date_peremption": "2027-01-01",
      "prix_unitaire": 150.00
    }
  ]
}
```

#### dashboard/kpis (Dashboard KPIs)

Returns comprehensive dashboard metrics:

```json
{
  "stock_value": 50000.00,
  "ruptures_count": 5,
  "total_products": 100,
  "products_with_stock": 95,
  "lots_expiring_30_days": 3,
  "lots_expiring_90_days": 10,
  "low_stock_products": [...],
  "expiring_lots": [...],
  "pending_orders": 12
}
```

#### journals (Audit Logs)

Returns audit log entries with filtering.

**Query Parameters:**
- `categorie`: COMMANDE, STOCK, PRODUIT, UTILISATEUR, SYSTEM
- `action`: CREATE, UPDATE, DELETE, VALIDATE, ANNUL, LIVRE, RECEPTION
- `search`: Search in description
- `page`, `page_size`: Pagination

### Query Parameters

- **Pagination**: `?page=1&page_size=25`
- **Ordering**: `?ordering=field` or `?ordering=-field` (descending)
- **Search/Filter**: `?search=query` - performs case-insensitive search on configured fields

## Running the Application

### Backend

```bash
cd /home/mokh/Dev/pharma/pharmacie
source ../venv/bin/activate
python manage.py runserver
```

The API runs at `http://localhost:8000/`

### Frontend

```bash
cd /home/mokh/Dev/pharma/frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000/`

## Authentication

- The API uses JWT authentication via djangorestframework-simplejwt
- Login endpoint: POST `/api/token/` with `username` and `password`
- Returns access and refresh tokens
- Frontend stores access token in localStorage and sends it with each request via Authorization header

## Features

### 1. Dashboard (KPIs)

Located at `/dashboard` - accessible from sidebar.

**Metrics displayed:**
- Valeur du Stock - Total stock value
- Ruptures - Products out of stock
- Expirent dans 30j - Lots expiring within 30 days
- Commandes en attente - Pending orders
- Stock sous sécurité - Products below security threshold (alert)
- Lots expirant bientôt - Soon-expiring lots (alert)

### 2. Fast Order (Commande Rapide)

Located at `/commandes-rapides` - for doctors and department heads.

**Features:**
- Product search with real-time stock display
- Color-coded stock badges (green/yellow/red)
- Cart with quantity controls
- Service selector (pre-fills from user profile)
- Quick order submission

**Access:** Users with `can_add_commandes` permission

### 3. Stock Reception (Réception de Stock)

Located at `/stock-reception` - for pharmacy staff.

**Features:**
- Supplier selection
- Product search
- Lot entry with:
  - Lot number
  - Quantity
  - Manufacturing date
  - Expiration date
  - Unit price (optional)
- Batch creation with automatic stock movement

**Access:** Users with `can_add_lots` permission

### 4. Orders Management (Commandes)

Located at `/commandes` - with tabbed interface.

**Workflow:**
1. **EN_ATTENTE** - Order submitted (from Commande Rapide)
2. **VALIDEE** - Order validated by pharmacy
3. **EN_COURS** - Order being prepared
4. **LIVREE** - Order delivered (stock deducted)
5. **ANNULEE** - Order cancelled

**Features:**
- Tabbed view by status
- Quick status change buttons (Validate → En cours → Livrer)
- Order details with products
- Status change notifications
- Badge counts on tabs

### 5. Audit Logging (Journaux)

Located at `/journals` - tracks all system activities.

**Features:**
- Tabbed by category (Tout, Commandes, Stock, Produits, Utilisateurs)
- Search functionality
- Pagination
- Shows:
  - Category and action badges
  - Status changes (old → new)
  - User who performed action
  - Entity description
  - Timestamp

**Automatically logs:**
- All CRUD operations (create, update, delete) via LoggingMixin
- Order status changes (validation, cancellation, delivery)
- Stock reception
- Stock movements

### 6. Stock/Inventory (Stock)

Located at `/stock` - comprehensive stock overview.

**Features:**
- Dashboard cards: Total Products, In Alert, Out of Stock, Available
- Filter buttons by stock status
- Search by product name or code
- Table showing aggregated stock per product
- Color-coded status badges

**Access:** Users with `can_view_lots` or `can_view_produits` permissions

## Permissions System

Permissions are defined at the role level:

| Resource | Permissions |
|----------|-------------|
| produits | can_view, can_add, can_change, can_delete |
| lots | can_view, can_add, can_change, can_delete |
| mouvements | can_view, can_add, can_change, can_delete |
| fournisseurs | can_view, can_add, can_change, can_delete |
| commandes | can_view, can_add, can_change, can_delete |
| magistrations | can_view, can_add, can_change, can_delete |
| services | can_view, can_add, can_change, can_delete |
| utilisateurs | can_view, can_add, can_change, can_delete |
| roles | can_view, can_add, can_change, can_delete |

### Accessing Features

- **Dashboard**: Available to all authenticated users
- **Commande Rapide**: Requires `can_add_commandes`
- **Réception Stock**: Requires `can_add_lots`
- **Journaux**: Available to all authenticated users
- **Stock**: Requires `can_view_lots` or `can_view_produits`

### User Service Assignment

Users can be assigned to a Service in their profile. This:
- Pre-fills the service in Commande Rapide
- Links orders to specific hospital departments

## Frontend Features

### Admin Components

The frontend uses shadcn-admin-kit which provides:
- `<List>` - List view with pagination
- `<DataTable>` - Table with columns
- `<DataTable.Col>` - Column definition
- Various field components (TextField, NumberField, DateField, etc.)
- Form components (TextInput, NumberInput, DateInput, etc.)
- Action buttons (EditButton, ShowButton, CreateButton, DeleteButton)

### Adding Search to a List

```tsx
import { List, DataTable, SearchInput } from "@/components/admin"

export const ProduitList = () => {
  return (
    <List filters={[<SearchInput source="q" alwaysOn />]}>
      <DataTable>
        <DataTable.Col source="code_national" />
        <DataTable.Col source="denomination" />
        ...
      </DataTable>
    </List>
  )
}
```

## Internationalization (i18n)

The application supports both French and English languages.

### Language Switcher

- Located in the user dropdown menu (top right corner)
- Users can switch between "Français" and "English"
- Language preference is persisted in local storage

### Translation Files

All translations are defined in:
```
frontend/src/lib/i18nProvider.ts
```

This file contains:
- Resource field labels (products, lots, movements, suppliers, orders, etc.)
- UI elements (buttons, labels, messages)
- Validation messages
- Status badges
- Error messages

### Adding New Translations

To add a new translation key:

1. Add to `frenchMessages` object in `i18nProvider.ts`:
```typescript
ra: {
  action: {
    my_action: "Mon action",
  }
}
```

2. Add to `englishMessages` object:
```typescript
ra: {
  action: {
    my_action: "My action",
  }
}
```

3. Use in component with `useTranslate` hook:
```typescript
const translate = useTranslate();
// ...
<button>{translate("ra.action.my_action")}</button>
```

## Stock/Inventory Page

### Overview

A comprehensive stock management page accessible at `/stock` that provides:

**Features:**
- Aggregated stock view per product (sum of all lots)
- Dashboard statistics cards showing:
  - Total Products
  - Products in Alert (at or below alert threshold)
  - Products Out of Stock (rupture)
  - Available Products (OK)
- Filter buttons to view by stock status
- Real-time search by product name or code
- Detailed table with columns:
  - National Code / Internal Code
  - Product Name / Dosage
  - Pharmaceutical Form
  - Current Stock
  - Alert Threshold
  - Security Threshold
  - Number of Lots
  - Status Badge

**Status Badges:**
- 🔴 **Rupture** (Red): Stock = 0
- 🟠 **Alerte** (Orange): Stock ≤ Alert threshold
- 🟢 **OK** (Green): Stock > Alert threshold

**Access:** Users with `can_view_lots` or `can_view_produits` permissions

### Implementation

The Stock page is implemented in:
```
frontend/src/features/stock/components/StockList.tsx
```

It uses the existing lots API endpoint and aggregates stock by product on the frontend.

## Database Seeding

### Seed Command

A management command is available to populate the database with realistic data:

```bash
cd /home/mokh/Dev/pharma/pharmacie
source ../venv/bin/activate
python manage.py seed_db
```

This command:

1. **Clears existing data** (except superusers)
2. **Creates permissions** for all resources
3. **Creates roles** with predefined permission sets
4. **Creates hospital services** (30 services)
5. **Creates suppliers** (15 pharmaceutical companies)
6. **Creates users** (12 users with different roles)
7. **Creates warehouses** (5 stores)
8. **Creates products and lots** (84 medications with random stock)

### Seeded Data Details

#### Roles (6)
| Role | Description |
|------|-------------|
| ADMIN | Full access to all features |
| PHARMACIEN | Can manage products, lots, orders |
| TECHNICIEN | Can view products, add lots and movements |
| RESPONSABLE | Can manage orders |
| MEDECIN | Can view products, create orders |
| CONSULTANT | Read-only access |

#### Services (30)
Hospital departments including:
- Urgences, Réanimation
- Cardiologie, Neurologie
- Chirurgie Générale, Orthopédique, Vasculaire
- Pédiatrie, Maternité, Néonatologie
- Oncologie, Néphrologie, Dialyse
- Pneumologie, Infectiologie
- Gastro-entérologie, Endocrinologie
- Pharmacie, Laboratoire, Radiologie
- Centre de Transfusion Sanguine
- And more...

#### Suppliers (15)
Real Algerian pharmaceutical companies:
- SAIDAL (Société Algérienne des Industries Pharmaceutiques)
- PharmAlliance, COPHARI, SAE
- INPHA (Industrie Pharmaceutique Hospitalière)
- Major importers: GSK, Novartis, Sanofi, Pfizer, Roche, Bayer, MSD
- Fresenius Kabi, Panpharma

#### Users (12)
| Username | Password | Role | Service |
|----------|----------|------|---------|
| admin | password123 | ADMIN | Pharmacie |
| chef_pharmacien | password123 | PHARMACIEN | Pharmacie |
| pharmacien_garde | password123 | PHARMACIEN | Pharmacie |
| pharmacien_01 | password123 | PHARMACIEN | Pharmacie |
| technicien_01 | password123 | TECHNICIEN | Pharmacie |
| technicien_02 | password123 | TECHNICIEN | Pharmacie |
| responsable_cmd | password123 | RESPONSABLE | Pharmacie |
| medecin_urg | password123 | MEDECIN | Urgences |
| medecin_cardio | password123 | MEDECIN | Cardiologie |
| medecin_reanimation | password123 | MEDECIN | Réanimation |
| medecin_pedia | password123 | MEDECIN | Pédiatrie |
| medecin_chir | password123 | MEDECIN | Chirurgie Générale |

#### Medications (84)
Common Algerian hospital medications including:
- **Antibiotics**: Amoxicilline, Azithromycine, Ciprofloxacine, Céfotaxime, Ceftriaxone
- **Pain relievers**: Paracétamol, Tramadol, Morphine, Kétoprofène
- **Anti-inflammatories**: Prednisone, Hydrocortisone, Dexaméthasone
- **Cardiovascular**: Amlodipine, Bisoprolol, Ramipril, Atorvastatin, Losartan
- **Antidiabetics**: Metformine, Glimépiride, Insuline
- **Gastrointestinal**: Oméprazole, Pantoprazole, Domperidone
- **Respiratory**: Salbutamol, Budesonide, Acétylcystéine
- **Anticoagulants**: Warfarin, Clopidogrel, Rivaroxaban
- **IV Fluids**: Sérum physiologique, Glucose, Ringer Lactate
- **Anesthetics**: Lidocaïne, Propofol, Kétamine
- And more...

Each medication has:
- Realistic Algerian national code
- Internal pharmacy code
- DCI (generic name)
- Pharmaceutical form and dosage
- 1-4 lots with random stock levels
- Random expiry dates
- Pricing information

### Running the Seeder

```bash
# First time setup
cd /home/mokh/Dev/pharma/pharmacie
source ../venv/bin/activate
python manage.py migrate

# Seed the database
python manage.py seed_db

# Expected output:
# Successfully seeded database with 84 medications, 15 fournisseurs, 30 services, and 12 users
```

## Development Notes

### Backend

- All ViewSets inherit from `viewsets.ModelViewSet`
- `LoggingMixin` automatically logs all CRUD operations
- Custom `get_queryset()` handles:
  - Permission checking
  - Search filtering via `apply_filtering()`
  - Ordering via `ordering` query param

### Frontend

- Uses TanStack Router for routing
- Uses TanStack Query (React Query) for data fetching via ra-core hooks
- Data provider (`dataProvider.ts`) maps frontend requests to Django API
- Search input uses `q` source, mapped to `search` param in data provider

## Troubleshooting

### Search Not Working
- Ensure the search field exists in the model
- Check the search field is configured in `api_views.py` for that ViewSet
- Verify the data provider maps `q` to `search`

### Ordering Not Working
- Ensure the ordering field is a valid model field
- Check the frontend sends the `ordering` param correctly

### Permission Issues
- Check the user has a role assigned
- Verify the role has the required permissions in the database
- Superusers have all permissions automatically

### Stock Not Deducted on Delivery
- Ensure order is in "EN_COURS" status before delivering
- Check that lots have sufficient quantity

## Future Improvements

- Add unit tests
- Add API documentation (Swagger/OpenAPI)
- Switch to PostgreSQL for production
- Add email notifications
- Add import/export functionality for products
- Add barcode/QR code scanning
- Add reporting and analytics dashboard
