# MOT — Modèle Organisationnel des Traitements
## Système de Gestion Pharmaceutique (GDS)

---

## Affectation Postes — Fonctions

```mermaid
flowchart LR
    %% ── POSTES DE TRAVAIL ────────────────────────────────────────
    subgraph PHARMACIE["  PHARMACIE  "]
        direction TB
        P1(["Pharmacien"])
        P2(["Technicien Pharmacie"])
    end

    subgraph SERVICES["  SERVICES MÉDICAUX  "]
        direction TB
        S1(["Médecin"])
        S2(["Responsable Service"])
    end

    subgraph ADMIN_GRP["  ADMINISTRATION  "]
        direction TB
        A1(["Administrateur"])
    end

    %% ── FONCTIONS ────────────────────────────────────────────────
    subgraph STOCK_FN["  Gestion Stock  "]
        direction TB
        F1["Réceptionner Stock"]
        F2["Contrôler Lots"]
        F3["Gérer Mouvements"]
        F4["Générer Alertes"]
    end

    subgraph CMD_FN["  Gestion Commandes  "]
        direction TB
        F5["Créer Commande"]
        F6["Valider Commande"]
        F7["Préparer Commande"]
        F8["Livrer Commande"]
    end

    subgraph PROD_FN["  Gestion Produits  "]
        direction TB
        F9["Consulter Produits"]
        F10["Créer / Modifier Produit"]
        F11["Désactiver Produit"]
    end

    subgraph REF_FN["  Gestion Référentiels  "]
        direction TB
        F12["Gestion Fournisseurs"]
        F13["Gestion Services"]
        F14["Gestion Utilisateurs"]
        F15["Gestion Rôles"]
    end

    subgraph SUIVI_FN["  Suivi & Audit  "]
        direction TB
        F16["Consulter Dashboard"]
        F17["Consulter Journaux"]
        F18["Consulter Stock"]
    end

    %% ── PHARMACIEN ───────────────────────────────────────────────
    P1 --> F1 & F2 & F6 & F7 & F8
    P1 --> F10 & F11 & F12
    P1 --> F16 & F17

    %% ── TECHNICIEN ───────────────────────────────────────────────
    P2 --> F1 & F3 & F9 & F18

    %% ── MÉDECIN ──────────────────────────────────────────────────
    S1 --> F5 & F9 & F16

    %% ── RESPONSABLE ──────────────────────────────────────────────
    S2 --> F5 & F9 & F16

    %% ── ADMIN ────────────────────────────────────────────────────
    A1 --> F10 & F12 & F13 & F14 & F15 & F16

    %% ── STYLES POSTES ────────────────────────────────────────────
    classDef pharmacien  fill:#EFF6FF,stroke:#1D4ED8,stroke-width:2px,color:#1E3A8A,font-weight:bold
    classDef technicien  fill:#F0FDFA,stroke:#0F766E,stroke-width:2px,color:#134E4A,font-weight:bold
    classDef medecin     fill:#F0FDF4,stroke:#15803D,stroke-width:2px,color:#14532D,font-weight:bold
    classDef responsable fill:#FFFBEB,stroke:#B45309,stroke-width:2px,color:#78350F,font-weight:bold
    classDef admin       fill:#FDF4FF,stroke:#7E22CE,stroke-width:2px,color:#581C87,font-weight:bold

    class P1 pharmacien
    class P2 technicien
    class S1 medecin
    class S2 responsable
    class A1 admin

    style PHARMACIE  fill:#EFF6FF,stroke:#1D4ED8,stroke-width:2px,color:#1E3A8A
    style SERVICES   fill:#F0FDF4,stroke:#15803D,stroke-width:2px,color:#14532D
    style ADMIN_GRP  fill:#FDF4FF,stroke:#7E22CE,stroke-width:2px,color:#581C87
    style STOCK_FN   fill:#FEFCE8,stroke:#CA8A04,stroke-width:1.5px,color:#713F12
    style CMD_FN     fill:#F0F9FF,stroke:#0369A1,stroke-width:1.5px,color:#0C4A6E
    style PROD_FN    fill:#FFF1F2,stroke:#BE123C,stroke-width:1.5px,color:#881337
    style REF_FN     fill:#FFF7ED,stroke:#C2410C,stroke-width:1.5px,color:#7C2D12
    style SUIVI_FN   fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#4C1D95
```

---

## Ordonnancement des Traitements

```mermaid
flowchart TD
    %% ── PHASE 1 : CRÉATION DE COMMANDE ──────────────────────────
    subgraph PHASE1["Phase 1 — Création de Commande"]
        direction LR
        A1(["Médecin"])
        T1["Saisir Commande\nproduits + quantités"]
        T2[/"Enregistrement\nstatut : EN_ATTENTE"/]
        T3(["Confirmation envoyée"])
        A1 --> T1 --> T2 --> T3
    end

    %% ── PHASE 2 : VALIDATION ─────────────────────────────────────
    subgraph PHASE2["Phase 2 — Validation"]
        direction LR
        B1(["Pharmacien"])
        T4["Consulter commandes\nen attente"]
        T5["Valider Commande\nstatut : VALIDÉE"]
        T6[/"Journaliser validation"/]
        B1 --> T4 --> T5 --> T6
    end

    %% ── PHASE 3 : PRÉPARATION ────────────────────────────────────
    subgraph PHASE3["Phase 3 — Préparation"]
        direction LR
        C1(["Pharmacien"])
        T7["Préparer Commande\nstatut : EN_COURS"]
        T8[/"Vérifier stock disponible"/]
        C1 --> T7 --> T8
    end

    %% ── PHASE 4 : LIVRAISON ──────────────────────────────────────
    subgraph PHASE4["Phase 4 — Livraison"]
        direction LR
        D1(["Pharmacien"])
        T9["Livrer Commande"]
        T10[/"Déduire stock FIFO\nCréer mouvements sortie\nstatut : LIVRÉE\nJournaliser"/]
        T11(["Notification au Médecin"])
        D1 --> T9 --> T10 --> T11
    end

    %% ── PHASE 5 : RÉCEPTION STOCK ────────────────────────────────
    subgraph PHASE5["Phase 5 — Réception Stock"]
        direction LR
        E1(["Technicien"])
        T12["Saisir réception\nfournisseur + lots"]
        T13[/"Créer lots\nCréer mouvements entrée\nMettre à jour stock"/]
        T14(["Notification au Pharmacien"])
        E1 --> T12 --> T13 --> T14
    end

    %% ── ENCHAÎNEMENT ─────────────────────────────────────────────
    PHASE1 -->|"Commande créée"| PHASE2
    PHASE2 -->|"Commande validée"| PHASE3
    PHASE3 -->|"Stock vérifié"| PHASE4

    %% ── STYLES ───────────────────────────────────────────────────
    style PHASE1 fill:#EFF6FF,stroke:#1D4ED8,stroke-width:2px,color:#1E3A8A
    style PHASE2 fill:#F0FDF4,stroke:#15803D,stroke-width:2px,color:#14532D
    style PHASE3 fill:#FFFBEB,stroke:#B45309,stroke-width:2px,color:#78350F
    style PHASE4 fill:#FFF1F2,stroke:#BE123C,stroke-width:2px,color:#881337
    style PHASE5 fill:#F5F3FF,stroke:#7C3AED,stroke-width:2px,color:#4C1D95

    classDef actor   fill:#F8FAFC,stroke:#64748B,stroke-width:1.5px,color:#1E293B,font-weight:bold
    classDef manual  fill:#F1F5F9,stroke:#475569,stroke-width:1.5px,color:#0F172A
    classDef auto    fill:#F0FDF4,stroke:#15803D,stroke-width:1.5px,color:#14532D,font-style:italic
    classDef notif   fill:#FDF4FF,stroke:#7E22CE,stroke-width:1.5px,color:#581C87

    class A1,B1,C1,D1,E1 actor
    class T1,T4,T5,T7,T9,T12 manual
    class T2,T6,T8,T10,T13 auto
    class T3,T11,T14 notif
```

---

## Flux de Données

```mermaid
flowchart LR
    subgraph ENTREES["  Entrées  "]
        direction TB
        E1["Commande Service"]
        E2["Réception Fournisseur"]
        E3["Création Produit"]
        E4["Modification Rôle"]
    end

    subgraph TRAITEMENTS["  Traitements  "]
        direction TB
        T1["Gestion Commandes"]
        T2["Gestion Stock"]
        T3["Gestion Produits"]
        T4["Gestion Accès"]
    end

    subgraph SORTIES["  Sorties  "]
        direction TB
        S1(["Confirmation"])
        S2(["Stock Mis à Jour"])
        S3(["Alertes"])
        S4(["Journal Audit"])
    end

    E1 --> T1
    E2 --> T2
    E3 --> T3
    E4 --> T4

    T1 --> S1
    T1 -.->|"trace"| S4
    T2 --> S2
    T2 --> S3
    T3 -.->|"trace"| S4
    T4 -.->|"trace"| S4

    style ENTREES     fill:#EFF6FF,stroke:#1D4ED8,stroke-width:2px,color:#1E3A8A
    style TRAITEMENTS fill:#F8FAFC,stroke:#475569,stroke-width:2px,color:#0F172A
    style SORTIES     fill:#F0FDF4,stroke:#15803D,stroke-width:2px,color:#14532D
```

---

## Matrice des Opérations par Poste

| Opération | Pharmacien | Technicien | Médecin | Responsable | Administrateur |
|-----------|:----------:|:----------:|:-------:|:-----------:|:--------------:|
| Nouvelle Commande | — | — | ✓ | ✓ | — |
| Valider Commande | ✓ | — | — | — | ✓ |
| Livrer Commande | ✓ | — | — | — | ✓ |
| Réception Stock | ✓ | ✓ | — | — | ✓ |
| Créer Produit | ✓ | — | — | — | ✓ |
| Modifier Produit | ✓ | — | — | — | ✓ |
| Consulter Stock | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Journaux | ✓ | — | — | — | ✓ |
| Gestion Utilisateurs | — | — | — | — | ✓ |
| Gestion Rôles | — | — | — | — | ✓ |
| Gestion Fournisseurs | ✓ | — | — | — | ✓ |
| Gestion Services | — | — | — | — | ✓ |

---

## Types de Traitements & Périodicité

| Code | Traitement | Type | Fréquence | Volume |
|------|-----------|------|-----------|--------|
| TR-01 | Création commande | Transactionnel | Temps réel | Moyen |
| TR-02 | Validation commande | Transactionnel | Temps réel | Faible |
| TR-03 | Livraison commande | Transactionnel | Temps réel | Moyen |
| TR-04 | Réception stock | Transactionnel | Temps réel | Variable |
| TR-05 | Mouvement stock | Transactionnel | Temps réel | Élevé |
| TR-06 | Consultation stock | Interrogatif | Temps réel | Élevé |
| TR-07 | Dashboard KPIs | Interrogatif | Temps réel | Moyen |
| TR-08 | Alertes stock | Émission | Quotidien | Faible |
| TR-09 | Journal audit | Journalisation | Temps réel | Élevé |

---

## Points de Synchronisation

| # | Synchronisation | Description |
|---|----------------|-------------|
| 1 | **Commande → Stock** | Le stock est vérifié et déduit lors de la livraison |
| 2 | **Réception → Lot → Mouvement** | Création automatique du lot puis du mouvement |
| 3 | **Tout traitement → Journal** | Chaque action est journalisée en temps réel |
| 4 | **Stock → Dashboard** | Les KPIs sont calculés en temps réel |
