# GDS - Gestion de Dispensation des Stupéfiants

## Système de Gestion de Pharmacie Hospitalière

---

# 1. Diagramme des Cas d'Utilisation (Use Case)

```mermaid
graph LR

    %% ===== ACTORS =====
    subgraph Acteurs
        ADMIN[Administrateur]
        PHARM[Pharmacien]
        TECH[Technicien]
        MED[Medecin]
        RESP[Responsable Service]
    end

    %% ===== USE CASES =====
    subgraph Produits
        P1[Consulter Produits]
        P2[Ajouter / Modifier Produit]
        P3[Supprimer Produit]
    end

    subgraph Stock & Lots
        S1[Consulter Stock]
        S2[Receptionner Stock]
        S3[Creer Lot]
        S4[Suivre Mouvements]
    end

    subgraph Commandes
        C1[Creer Commande]
        C2[Valider Commande]
        C3[Livrer Commande]
        C4[Suivre Commandes]
    end

    subgraph Fournisseurs
        F1[Consulter Fournisseurs]
        F2[Gerer Fournisseurs]
    end

    subgraph Administration
        A1[Gerer Utilisateurs]
        A2[Attribuer Roles]
    end

    subgraph Monitoring
        M1[Voir Dashboard]
        M2[Consulter Journaux]
    end

    %% ===== ROLE ACCESS =====

    %% Pharmacien
    PHARM --> P1
    PHARM --> P2
    PHARM --> S1
    PHARM --> S2
    PHARM --> S3
    PHARM --> S4
    PHARM --> C2
    PHARM --> C3
    PHARM --> C4
    PHARM --> F1
    PHARM --> F2
    PHARM --> M1
    PHARM --> M2

    %% Technicien
    TECH --> P1
    TECH --> S1
    TECH --> S2
    TECH --> S3
    TECH --> S4
    TECH --> M1

    %% Medecin
    MED --> P1
    MED --> C1
    MED --> M1

    %% Responsable Service
    RESP --> P1
    RESP --> C1
    RESP --> C4
    RESP --> M1

    %% Admin inherits everything
    ADMIN --> PHARM
    ADMIN --> TECH
    ADMIN --> MED
    ADMIN --> RESP
    ADMIN --> A1
    ADMIN --> A2

```

---

## 1.1 Description des Cas d'Utilisation

| Cas                    | Acteur                        | Description                                          |
| ---------------------- | ----------------------------- | ---------------------------------------------------- |
| **Consulter Produits** | Tous                          | Rechercher et afficher la liste des médicaments      |
| **Ajouter Produit**    | Admin, Pharmacien             | Créer un nouveau médicament dans le système          |
| **Modifier Produit**   | Admin, Pharmacien             | Mettre à jour les informations d'un médicament       |
| **Réceptionner Stock** | Admin, Pharmacien, Technicien | Enregistrer une nouvelle livraison de médicaments    |
| **Créer Lot**          | Admin, Pharmacien, Technicien | Créer un lot avec numéro, date péremption, quantité  |
| **Créer Commande**     | Médecin, Responsable          | Soumettre une demande de médicaments pour un service |
| **Valider Commande**   | Pharmacien                    | rouver une demande de médicament                  |
| **Livrer Commande**    | Pharmacien                    | Délivrer les médicaments et déduire du stock         |
| **Voir Dashboard**     | Tous                          | Consulter les KPIs et indicateurs                    |
| **Gérer Utilisateurs** | Administrateur                | Créer, modifier, supprimer des utilisateurs          |
| **Attribuer Rôles**    | Administrateur                | Définir les permissions par rôle                     |

---

# 2. Modèle Conceptuel de Données (MCD)

```mermaid
erDiagram
    UTILISATEUR ||--o{ COMMANDE : passe
    UTILISATEUR }o--|| ROLE : a
    UTILISATEUR }o--|| SERVICE : artient
    UTILISATEUR ||--o{ JOURNAL : effectue

    SERVICE ||--o{ COMMANDE : passe
    SERVICE {
        string code_service PK
        string nom
        string type_service
        string specialite
        int nombre_lits
        bool actif
    }

    COMMANDE ||--o{ LIGNE_COMMANDE : contient
    COMMANDE {
        string numero_commande PK
        string statut
        string priorite
        datetime date_demande
    }

    LIGNE_COMMANDE ||--|| PRODUIT : concerne
    LIGNE_COMMANDE {
        int quantite_demandee
        int quantite_livree
        string statut
    }

    PRODUIT ||--o{ LOT : a
    PRODUIT ||--o{ MOUVEMENT : generer
    PRODUIT {
        string code_national PK
        string code_interne
        string denomination
        string forme_pharmaceutique
        string dosage
        string dci
        string type_produit
        string categorie_surveillance
        string statut
    }

    LOT ||--o{ MOUVEMENT : implique
    LOT {
        string numero_lot PK
        date date_fabrication
        date date_peremption
        date date_reception
        int quantite_initiale
        int quantite_actuelle
        int quantite_reservee
        string statut
    }

    MAGASIN ||--o{ MOUVEMENT : destination
    MAGASIN ||--o{ MOUVEMENT : source
    MAGASIN ||--o{ LOT : stocke
    MAGASIN {
        string code_magasin PK
        string nom
        string type_magasin
        string batiment
        string etage
        string niveau_securite
    }

    MOUVEMENT {
        string numero_mouvement PK
        string type_mouvement
        int quantite
        datetime date_mouvement
    }

    FOURNISSEUR ||--o{ LOT : livre
    FOURNISSEUR {
        string code_fournisseur PK
        string raison_sociale
        string sigle
        string type_fournisseur
        string adresse
        string wilaya
        string telephone
        string email
    }

    ROLE ||--o{ PERMISSION : possede
    ROLE {
        string name PK
        string description
        bool is_active
    }

    PERMISSION {
        string resource
        bool can_view
        bool can_add
        bool can_change
        bool can_delete
    }

    JOURNAL {
        string categorie
        string action
        string description
        datetime created_at
    }
```

---

# 3. Modèle Logique de Données (MLD)

```
UTILISATEUR(id, username, password, email, fonction, role_id, service_id)
ROLE(id, name, description, is_active)
PERMISSION(id, role_id, resource, can_view, can_add, can_change, can_delete)
SERVICE(id, code_service, nom, type_service, specialite, nombre_lits, actif)

PRODUIT(id, code_national, code_interne, denomination, denomination_commerciale,
        forme_pharmaceutique, dosage, dci, classe_therapeutique, conditionnement,
        unite_mesure, quantite_par_unite, stock_securite, stock_alerte,
        duree_peremption_mois, temperature_conservation, necessite_chaine_froid,
        type_produit, categorie_surveillance, statut, fabricant, numero_amm, actif)

MAGASIN(id, code_magasin, nom, type_magasin, batiment, etage, niveau_securite, actif)

FOURNISSEUR(id, code_fournisseur, raison_sociale, sigle, type_fournisseur,
            adresse, wilaya, telephone, email, statut)

LOT(id, produit_id, numero_lot, date_fabrication, date_peremption, date_reception,
    quantite_initiale, quantite_actuelle, quantite_reservee, prix_unitaire, statut, magasin_id)

MOUVEMENT(id, numero_mouvement, produit_id, lot_id, type_mouvement, quantite,
          magasin_source_id, magasin_destination_id, date_mouvement)

COMMANDE(id, numero_commande, service_id, utilisateur_id, statut, priorite, date_demande, date_validation, date_livraison)

LIGNE_COMMANDE(id, commande_id, produit_id, quantite_demandee, quantite_livree, statut)

JOURNAL(id, categorie, action, description, utilisateur_id, entity_type, entity_id,
        entity_description, ancien_statut, nouveau_statut, details, created_at)
```

---

# 4. Diagramme d'Architecture Système

```mermaid
graph TB
    subgraph Client
        APP[Application]
    end

    subgraph Frontend
        UI[Interface React]
        Router[ TanStack Router]
        Query[ TanStack Query]
        State[État Local]
    end

    subgraph Backend
        API[Django REST API]
        Auth[ JWT Auth]
        Views[ ViewSets]
        Serial[ Serializers]
    end

    subgraph BaseDeDonnees
        SQLite[(SQLite 3)]
    end

    APP --> UI
    UI --> Router
    Router --> Query
    Query --> API
    API --> Auth
    Auth --> Views
    Views --> Serial
    Serial --> SQLite
```

---

## 4.1 Architecture Détaillée

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Application React                       │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐  │  │
│  │  │Dashboard│  │Produits  │  │Commandes│  │  Stock     │  │  │
│  │  └────┬────┘  └────┬─────┘  └────┬────┘  └─────┬──────┘  │  │
│  │       └──────────┬┴───────────┬┴───────────┬┘          │  │
│  │                  ▼            ▼            ▼             │  │
│  │            ┌─────────────────────────────────────────┐    │  │
│  │            │         TanStack Query (Cache)         │    │  │
│  │            └─────────────────┬───────────────────────┘    │  │
│  │                              ▼                            │  │
│  │            ┌─────────────────────────────────────────┐    │  │
│  │            │           Data Provider                  │    │  │
│  │            └─────────────────┬───────────────────────┘    │  │
│  └──────────────────────────────┼────────────────────────────┘  │
│                                 │ HTTP + JWT                    │
└─────────────────────────────────┼───────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVEUR (Backend)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Django + DRF                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                    API Layer                        │  │  │
│  │  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐  │  │  │
│  │  │  │Produits │ │  Lots    │ │Commandes│ │  Users  │  │  │  │
│  │  │  │ ViewSet │ │ ViewSet  │ │ ViewSet │ │ ViewSet │  │  │  │
│  │  │  └────┬────┘ └────┬─────┘ └────┬────┘ └────┬────┘  │  │  │
│  │  │       └──────────┬┴───────────┬┴───────────┘       │  │  │
│  │  │                  ▼                                 │  │  │
│  │  │          ┌─────────────────┐                       │  │  │
│  │  │          │  Serializers    │                       │  │  │
│  │  │          └────────┬────────┘                       │  │  │
│  │  └───────────────────┼───────────────────────────────┘  │  │
│  │                      ▼                                   │  │
│  │          ┌───────────────────────┐                      │  │
│  │          │      ORM Django       │                      │  │
│  │          └───────────┬───────────┘                      │  │
│  └──────────────────────┼──────────────────────────────────┘  │
│                         ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Base de Données                         │  │
│  │                   SQLite 3                               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

# 5. Diagramme de Classes (UML)

```mermaid
classDiagram
    class BaseModel {
        +id: UUID
        +created_at: DateTime
        +updated_at: DateTime
    }

    class Produit {
        +code_national: String
        +code_interne: String
        +denomination: String
        +forme_pharmaceutique: String
        +dosage: String
        +dci: String
        +type_produit: Enum
        +categorie_surveillance: Enum
        +statut: Enum
        +actif: Boolean
    }

    class LotProduit {
        +numero_lot: String
        +date_fabrication: Date
        +date_peremption: Date
        +date_reception: Date
        +quantite_initiale: Integer
        +quantite_actuelle: Integer
        +quantite_reservee: Integer
        +statut: String
    }

    class MouvementStock {
        +numero_mouvement: String
        +type_mouvement: Enum
        +quantite: Integer
        +date_mouvement: DateTime
    }

    class Fournisseur {
        +code_fournisseur: String
        +raison_sociale: String
        +sigle: String
        +type_fournisseur: Enum
        +adresse: String
        +wilaya: String
        +telephone: String
        +email: String
    }

    class Service {
        +code_service: String
        +nom: String
        +type_service: String
        +specialite: String
        +nombre_lits: Integer
        +actif: Boolean
    }

    class CommandeService {
        +numero_commande: String
        +statut: Enum
        +priorite: Enum
        +date_demande: DateTime
    }

    class LigneCommande {
        +quantite_demandee: Integer
        +quantite_livree: Integer
        +statut: String
    }

    class Magasin {
        +code_magasin: String
        +nom: String
        +type_magasin: Enum
        +batiment: String
        +etage: String
        +niveau_securite: String
    }

    class Utilisateur {
        +username: String
        +email: String
        +password: String
        +fonction: Enum
    }

    class Role {
        +name: String
        +description: String
        +is_active: Boolean
    }

    class Permission {
        +resource: String
        +can_view: Boolean
        +can_add: Boolean
        +can_change: Boolean
        +can_delete: Boolean
    }

    class Journal {
        +categorie: Enum
        +action: Enum
        +description: String
    }

    %% Relationships
    BaseModel <|-- Produit
    BaseModel <|-- LotProduit
    BaseModel <|-- MouvementStock
    BaseModel <|-- Fournisseur
    BaseModel <|-- Service
    BaseModel <|-- CommandeService
    BaseModel <|-- LigneCommande
    BaseModel <|-- Magasin
    BaseModel <|-- Utilisateur
    BaseModel <|-- Role
    BaseModel <|-- Permission
    BaseModel <|-- Journal

    Produit "1" --> "*" LotProduit : contient
    Produit "1" --> "*" MouvementStock : génère
    LotProduit "1" --> "*" MouvementStock : implique
    Fournisseur "1" --> "*" LotProduit : livre
    Service "1" --> "*" CommandeService : passe
    CommandeService "1" --> "*" LigneCommande : contient
    Produit "1" --> "*" LigneCommande : concerne
    Magasin "1" --> "*" LotProduit : stocke
    Magasin "1" --> "*" MouvementStock : source/destination
    Role "1" --> "*" Permission : possède
    Utilisateur "1" --> "0..1" Role : a
    Utilisateur "1" --> "0..1" Service : appartient
    Utilisateur "1" --> "*" Journal : effectue
    Utilisateur "1" --> "*" CommandeService : passe
```

---

# 6. Diagrammes de Flux des Processus

## 6.1 Flux de Réception de Stock

```mermaid
flowchart TD
    A[Début: Réception de Stock] --> B{Sélectionner Fournisseur}
    B --> C[Rechercher Produit]
    C --> D{Produit trouvé?}
    D -->|Non| E[Créer Nouveau Produit]
    D -->|Oui| F[Sélectionner Produit]
    E --> F
    F --> G[Saisir Informations du Lot]
    G --> H[Numéro de Lot]
    H --> I[Date de Fabrication]
    I --> J[Date de Péremption]
    J --> K[Quantité Reçue]
    K --> L{Autres produits?}
    L -->|Oui| C
    L -->|Non| M[Valider Réception]
    M --> N[Créer Mouvement d'Entrée]
    N --> O[Mettre à Jour Quantité Lot]
    O --> P[Enregistrer dans Journal]
    P --> Q[Fin: Stock Réceptionné]
```

## 6.2 Flux de Commande de Médicaments

```mermaid
flowchart TD
    A[Début: Nouvelle Commande] --> B[Sélectionner Service]
    B --> C[Rechercher Produit]
    C --> D{Ajouter au panier?}
    D -->|Oui| E[Spécifier Quantité]
    E --> F{Autres produits?}
    F -->|Oui| C
    F -->|Non| G[Soumettre Commande]
    G --> H{Statut Commande}
    H -->|EN_ATTENTE| I[Pharmacien Valide]
    I --> J{Validation?}
    J -->|Non| K[Annuler Commande]
    J -->|Oui| L[Statut: VALIDÉE]
    L --> M[Préparer Commande]
    M --> N[Statut: EN_COURS]
    N --> O[Livrer Médicaments]
    O --> P[Déduire du Stock]
    P --> Q[Statut: LIVRÉE]
    Q --> R[Enregistrer dans Journal]
    R --> S[Fin: Commande Terminée]

    H -->|ANNULÉE| K
```

## 6.3 Flux d'Alerte de Stock

```mermaid
flowchart TD
    A[Début: Vérification Quotidienne] --> B[Parcourir Tous les Lots]
    B --> C{Lot expiré?}
    C -->|Oui| D[Créer Alerte Expiration]
    C -->|Non| E{Lot expire dans 30 jours?}
    E -->|Oui| F[Créer Alerte Expiration Proche]
    E -->|Non| G{Stock == 0?}
    G -->|Oui| H[Créer Alerte Rupture]
    G -->|Non| I{Stock ≤ Seuil Alerte?}
    I -->|Oui| J[Créer Alerte Stock Bas]
    I -->|Non| K{Stock ≤ Seuil Sécurité?}
    K -->|Oui| L[Créer Alerte Sécurité]
    K -->|Non| M[Stock OK]

    D --> N[Envoyer Notification]
    F --> N
    H --> N
    J --> N
    L --> N

    N --> O[Afficher sur Dashboard]
    O --> P[Fin]
```

---

# 7. Tableau Récapitulatif des Entités

| Entité              | Description                      | Attributs Principaux                            |
| ------------------- | -------------------------------- | ----------------------------------------------- |
| **Produit**         | Médicament ou dispositif médical | code_national, denomination, forme, dosage, DCI |
| **LotProduit**      | Lot d'un produit avec expiration | numero_lot, dates, quantités                    |
| **MouvementStock**  | Entrée/Sortie de stock           | type_mouvement, quantité, dates                 |
| **Fournisseur**     | Entreprise pharmaceutique        | raison_sociale, adresse, téléphone              |
| **Service**         | Service hospitalier              | code_service, nom, specialite                   |
| **CommandeService** | Demande de médicaments           | numero_commande, statut, priorite               |
| **LigneCommande**   | Ligne d'une commande             | produit, quantites                              |
| **Magasin**         | Entrepôt/Zone de stockage        | code_magasin, type, securite                    |
| **Utilisateur**     | Utilisateur du système           | username, role, fonction                        |
| **Role**            | Rôle avec permissions            | name, permissions                               |
| **Journal**         | Historique des actions           | categorie, action, description                  |

---

# 8. Stack Technique

| Couche               | Technologie                         |
| -------------------- | ----------------------------------- |
| **Frontend**         | React, TanStack Start, Tailwind CSS |
| **Backend**          | Django 6.0, Django REST Framework   |
| **Base de données**  | SQLite 3 (développement)            |
| **Authentification** | JWT (djangorestframework-simplejwt) |
| **Icons**            | Lucide React                        |
| **State Management** | TanStack Query                      |

---

# 9. Rôles et Permissions

| Rôle            | Permissions                                |
| --------------- | ------------------------------------------ |
| **ADMIN**       | Accès complet à toutes les fonctionnalités |
| **PHARMACIEN**  | Gestion produits, lots, commandes          |
| **TECHNICIEN**  | Vue produits, ajout lots et mouvements     |
| **RESPONSABLE** | Gestion commandes                          |
| **MEDECIN**     | Vue produits, création commandes           |
| **CONSULTANT**  | Lecture seule                              |

---

# 10. Captures d'Écran du Projet

Le projet contient les captures d'écran suivantes dans le dossier `docs/`:

- Dashboard avec KPIs
- Gestion des produits
- Réception de stock
- Commandes en attente
- Journaux d'audit
### 1. Interface d'Authentification
![Interface d'Authentification](./Screenshot%202026-02-15%20162431.png "Interface d'Authentification")
* **Légende :** Portail de Connexion Sécurisé
* **Description :** Point d'entrée unique du système utilisant une authentification par **JWT (JSON Web Token)**. Cette interface permet de filtrer les accès selon les rôles définis (Administrateur, Pharmacien, Médecin, etc.) pour garantir la sécurité des données sensibles.

### 2. Tableau de Bord (Dashboard)
![Tableau de Bord](./Screenshot%202026-02-15%20162638.png "Tableau de Bord")
* **Légende :** Pilotage et Indicateurs de Performance (KPIs)
* **Description :** Vue d'ensemble affichant les données critiques : valeur totale du stock, nombre de produits en rupture, et alertes de péremption à 30 jours. Le système utilise des widgets dynamiques pour une aide à la décision immédiate.

### 3. Création de Commande Service
![Création de Commande Service](./Screenshot%202026-02-15%20162817.png "Création de Commande Service")
* **Légende :** Interface de Saisie de Commande
* **Description :** Interface intuitive permettant aux médecins ou responsables de service de rechercher des produits par DCI et de les ajouter à un panier virtuel. Un résumé à droite permet de valider les quantités avant la soumission au pharmacien.

### 4. État du Stock et Alertes
![État du Stock](./Screenshot%202026-02-15%20162719.png "État du Stock")
* **Légende :** Monitoring de l'Inventaire
* **Description :** Vue synthétique des niveaux de stock par produit. Le système utilise des badges de couleur (ex: "Alerte" en orange) pour signaler visuellement quand un produit atteint son seuil critique de sécurité.

### 5. Catalogue des Produits
![Catalogue des Produits](./Screenshot%202026-02-15%20162740.png "Catalogue des Produits")
* **Légende :** Référentiel National des Médicaments
* **Description :** Base de données centralisée listant les caractéristiques techniques : Code National, DCI, forme pharmaceutique (Gélule, Comprimé, Poudre) et catégorie de surveillance (Normal vs Psychotrope).

### 6. Traçabilité par Lot
![Traçabilité par Lot](./Screenshot%202026-02-15%20162750.png "Traçabilité par Lot")
* **Légende :** Suivi de la Traçabilité et Péremptions
* **Description :** Détail indispensable pour la pharmacovigilance. Chaque ligne représente un lot spécifique avec son numéro unique, ses dates de fabrication/péremption, et la distinction entre quantité actuelle et quantité réservée.

### 7. Suivi du Flux de Distribution
![Suivi du Flux de Distribution](./Screenshot%202026-02-15%20163559.png "Suivi du Flux de Distribution")
* **Légende :** Gestion du Cycle de Vie des Commandes
* **Description :** Interface permettant de filtrer les demandes par statut (En attente, Validée, Livrée). C'est ici que le pharmacien approuve les demandes avant la déduction automatique du stock.

### 8. Configuration des Services
![Configuration des Services](./Screenshot%202026-02-15%20162846.png "Configuration des Services")
* **Légende :** Cartographie des Unités de Soins
* **Description :** Liste des services hospitaliers (Urgences, Réanimation, etc.) rattachés à la pharmacie. Chaque service est paramétré avec sa spécialité et son nombre de lits pour une gestion analytique.

### 9. Réception de Stock (Entrées)
![Réception de Stock](./Screenshot%202026-02-15%20163708.png "Réception de Stock")
* **Légende :** Module d'Approvisionnement et Entrée de Stock
* **Description :** Interface dédiée à l'enregistrement des nouveaux arrivages. Elle permet de saisir le fournisseur, le numéro de lot et les dates de péremption, assurant que chaque produit entrant est immédiatement traçable dans le système.

### 10. Journal d'Audit (Logs)
![Journal d'Audit](./Screenshot%202026-02-15%20163738.png "Journal d'Audit")
* **Légende :** Historique des Actions et Sécurité
* **Description :** Le journal d'audit consigne chaque opération effectuée sur la plateforme (qui, quoi, quand). C'est un outil de conformité crucial pour la gestion des stupéfiants, garantissant qu'aucune modification de stock ou validation de commande ne reste anonyme.
