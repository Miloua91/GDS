# MCT — Modèle Conceptuel des Traitements
## Système de Gestion Pharmaceutique (GDS)

---

## Flux Principal des Traitements

```mermaid
flowchart TD
    %% ── ACTEURS EXTERNES ─────────────────────────────────────────
    EM(["Employé / Médecin"])
    FO(["Fournisseur"])

    %% ── ENTRÉES ──────────────────────────────────────────────────
    NC["Nouvelle Commande"]
    RS["Réception Stock"]

    %% ── TRAITEMENTS COMMANDES ────────────────────────────────────
    CMD["Gestion Commandes"]
    VCMD["Valider Commande"]
    PCMD["Préparer Commande"]
    LCMD["Livrer Commande"]

    %% ── TRAITEMENTS STOCK ────────────────────────────────────────
    GL["Gestion Lots"]
    MOUV_E["Mouvement Entrée"]
    MOUV_S["Mouvement Sortie"]
    STK["Gestion Stock"]
    ALERT["Alertes Stock"]
    DASH["Dashboard / KPIs"]

    %% ── RÉSULTATS ────────────────────────────────────────────────
    R1(["Commande livrée au service"])
    R2(["Stock mis à jour"])
    R3(["Lots créés"])
    R5(["Alertes générées"])

    %% ── FLUX ─────────────────────────────────────────────────────
    EM -->|"Demande produits"| NC
    FO -->|"Livraison médicaments"| RS

    NC --> CMD
    CMD --> VCMD
    VCMD --> PCMD
    PCMD --> LCMD

    RS --> GL
    GL --> MOUV_E
    GL --> STK

    LCMD -->|"Déduire stock"| MOUV_S
    STK -->|"Vérifier seuil"| ALERT

    CMD -.->|"Consulter"| DASH
    STK -.->|"Consulter"| DASH

    LCMD --> R1
    MOUV_E --> R2
    GL --> R3
    ALERT --> R5

    %% ── STYLES ───────────────────────────────────────────────────
    classDef actor    fill:#EEF2FF,stroke:#4338CA,stroke-width:2px,color:#312E81,font-weight:bold
    classDef input    fill:#F0FDF4,stroke:#15803D,stroke-width:2px,color:#14532D
    classDef process  fill:#EFF6FF,stroke:#1D4ED8,stroke-width:2px,color:#1E3A8A
    classDef stock    fill:#FFFBEB,stroke:#B45309,stroke-width:2px,color:#78350F
    classDef result   fill:#FDF4FF,stroke:#7E22CE,stroke-width:2px,color:#581C87,font-style:italic

    class EM,FO actor
    class NC,RS input
    class CMD,VCMD,PCMD,LCMD process
    class GL,MOUV_E,MOUV_S,STK,ALERT,DASH stock
    class R1,R2,R3,R5 result
```

---

## Diagramme des Opérations par Domaine

```mermaid
flowchart
    subgraph COMMANDES["  COMMANDES  "]
        direction TB
        C1["Nouvelle Commande"]
        C2["Suivi Commandes"]
        C3["Valider Commande"]
        C4["Livrer Commande"]
        C5["Annuler Commande"]
    end

    subgraph STOCK["  STOCK  "]
        direction TB
        S1["Réception Stock"]
        S2["Consultation Stock"]
        S3["Transfert Stock"]
        S4["Ajuster Stock"]
        S5["Lots Périmés"]
    end

    subgraph PRODUITS["  PRODUITS  "]
        direction TB
        P1["Créer Produit"]
        P2["Modifier Produit"]
        P3["Consulter Produit"]
        P4["Désactiver Produit"]
    end

    subgraph REFERENTIELS["  RÉFÉRENTIELS  "]
        direction TB
        R1["Gestion Fournisseurs"]
        R2["Gestion Services"]
        R3["Gestion Magasins"]
        R4["Gestion Utilisateurs"]
        R5["Gestion Rôles"]
    end

    subgraph SUIVI["  SUIVI & AUDIT  "]
        direction TB
        A1["Journal des Actions"]
        A2["Consultation Journaux"]
        D1["KPI Dashboard"]
        D2["Alertes Stock"]
    end

    COMMANDES -->|"Mise à jour stock"| STOCK
    STOCK -->|"Données produits"| PRODUITS
    COMMANDES -.->|"Journalisation"| SUIVI
    STOCK -.->|"Journalisation"| SUIVI
    REFERENTIELS -.->|"Paramétrage"| COMMANDES
    REFERENTIELS -.->|"Paramétrage"| STOCK

    style COMMANDES    fill:#EFF6FF,stroke:#1D4ED8,stroke-width:2px,color:#1E3A8A
    style STOCK        fill:#F0FDF4,stroke:#15803D,stroke-width:2px,color:#14532D
    style PRODUITS     fill:#FDF4FF,stroke:#7E22CE,stroke-width:2px,color:#581C87
    style REFERENTIELS fill:#FFFBEB,stroke:#B45309,stroke-width:2px,color:#78350F
    style SUIVI        fill:#FFF1F2,stroke:#BE123C,stroke-width:2px,color:#881337
```

---

## Sources de Données

| # | Entité | Type | Description |
|---|--------|------|-------------|
| 1 | **Produit** | Entité | Médicaments et produits pharmaceutiques |
| 2 | **Lot** | Entité | Lots / batchs de médicaments |
| 3 | **Mouvement** | Entité | Mouvements de stock (entrée / sortie) |
| 4 | **Commande** | Entité | Commandes des services |
| 5 | **LigneCommande** | Entité | Lignes de commande |
| 6 | **Fournisseur** | Entité | Fournisseurs de médicaments |
| 7 | **Service** | Entité | Services hospitaliers |
| 8 | **Magasin** | Entité | Magasins / entrepôts |
| 9 | **Utilisateur** | Entité | Utilisateurs du système |
| 10 | **Role** | Entité | Rôles et permissions |
| 11 | **Journal** | Entité | Journal d'audit |

---

## Règles de Gestion

| Code | Règle |
|------|-------|
| **RG01** | Une commande doit être validée avant livraison |
| **RG02** | Le stock est déduit automatiquement lors de la livraison |
| **RG03** | Les lots sont sélectionnés par ordre de péremption (FIFO) |
| **RG04** | Les mouvements de stock sont automatiquement journalisés |
| **RG05** | Les alertes sont générées pour stock sous seuil |
| **RG06** | Seuls les pharmaciens peuvent valider les commandes |
| **RG07** | Les lots périmés doivent être identifiés et traités |
