from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import (
    Role,
    Permission,
    Service,
    Fournisseur,
    Produit,
    LotProduit,
    Magasin,
)
from django.utils import timezone
from datetime import datetime, timedelta
import random

User = get_user_model()

# Common Algerian hospital medications
MEDICATIONS = [
    # Antibiotics
    {
        "name": "Amoxicilline 500mg",
        "dci": "Amoxicillin",
        "form": "Gélule",
        "dosage": "500mg",
        "cond": "Boîte de 12",
        "fab": "Saidal",
    },
    {
        "name": "Amoxicilline 1g",
        "dci": "Amoxicillin",
        "form": "Comprimé",
        "dosage": "1g",
        "cond": "Boîte de 8",
        "fab": "Saidal",
    },
    {
        "name": "Azithromycine 250mg",
        "dci": "Azithromycin",
        "form": "Gélule",
        "dosage": "250mg",
        "cond": "Boîte de 6",
        "fab": "Biocad",
    },
    {
        "name": "Ciprofloxacine 500mg",
        "dci": "Ciprofloxacin",
        "form": "Comprimé",
        "dosage": "500mg",
        "cond": "Boîte de 10",
        "fab": "Sanofi",
    },
    {
        "name": "Céfotaxime 1g",
        "dci": "Cefotaxime",
        "form": "Poudre pour injection",
        "dosage": "1g",
        "cond": "Flacon",
        "fab": "Panpharma",
    },
    {
        "name": "Ceftriaxone 1g",
        "dci": "Ceftriaxone",
        "form": "Poudre pour injection",
        "dosage": "1g",
        "cond": "Flacon",
        "fab": "Roche",
    },
    {
        "name": "Métronidazole 500mg",
        "dci": "Metronidazole",
        "form": "Comprimé",
        "dosage": "500mg",
        "cond": "Boîte de 20",
        "fab": "Saidal",
    },
    {
        "name": "Céfazoline 1g",
        "dci": "Cefazolin",
        "form": "Poudre pour injection",
        "dosage": "1g",
        "cond": "Flacon",
        "fab": "Panpharma",
    },
    # Pain relievers / Analgesics
    {
        "name": "Paracétamol 500mg",
        "dci": "Paracetamol",
        "form": "Comprimé",
        "dosage": "500mg",
        "cond": "Boîte de 100",
        "fab": "Saidal",
    },
    {
        "name": "Paracétamol 1g",
        "dci": "Paracetamol",
        "form": "Comprimé",
        "dosage": "1g",
        "cond": "Boîte de 8",
        "fab": "Saidal",
    },
    {
        "name": "Tramadol 50mg",
        "dci": "Tramadol",
        "form": "Gélule",
        "dosage": "50mg",
        "cond": "Boîte de 20",
        "fab": "Sanofi",
    },
    {
        "name": "Morphine 10mg",
        "dci": "Morphine",
        "form": "Comprimé",
        "dosage": "10mg",
        "cond": "Boîte de 10",
        "fab": "Sanofi",
    },
    {
        "name": "Kétoprofène 100mg",
        "dci": "Ketoprofen",
        "form": "Comprimé",
        "dosage": "100mg",
        "cond": "Boîte de 20",
        "fab": "Sanofi",
    },
    {
        "name": "Diclofénac 50mg",
        "dci": "Diclofenac",
        "form": "Comprimé",
        "dosage": "50mg",
        "cond": "Boîte de 20",
        "fab": "Novartis",
    },
    # Anti-inflammatories
    {
        "name": "Prednisone 20mg",
        "dci": "Prednisone",
        "form": "Comprimé",
        "dosage": "20mg",
        "cond": "Boîte de 10",
        "fab": "Sanofi",
    },
    {
        "name": "Prednisone 5mg",
        "dci": "Prednisone",
        "form": "Comprimé",
        "dosage": "5mg",
        "cond": "Boîte de 20",
        "fab": "Saidal",
    },
    {
        "name": "Hydrocortisone 100mg",
        "dci": "Hydrocortisone",
        "form": "Poudre pour injection",
        "dosage": "100mg",
        "cond": "Flacon",
        "fab": "Panpharma",
    },
    {
        "name": "Dexamethasone 4mg",
        "dci": "Dexamethasone",
        "form": "Comprimé",
        "dosage": "4mg",
        "cond": "Boîte de 10",
        "fab": "Sanofi",
    },
    # Cardiovascular
    {
        "name": "Amlodipine 5mg",
        "dci": "Amlodipine",
        "form": "Comprimé",
        "dosage": "5mg",
        "cond": "Boîte de 30",
        "fab": "Novartis",
    },
    {
        "name": "Amlodipine 10mg",
        "dci": "Amlodipine",
        "form": "Comprimé",
        "dosage": "10mg",
        "cond": "Boîte de 30",
        "fab": "Novartis",
    },
    {
        "name": "Bisoprolol 5mg",
        "dci": "Bisoprolol",
        "form": "Comprimé",
        "dosage": "5mg",
        "cond": "Boîte de 30",
        "fab": "Merck",
    },
    {
        "name": "Ramipril 5mg",
        "dci": "Ramipril",
        "form": "Comprimé",
        "dosage": "5mg",
        "cond": "Boîte de 28",
        "fab": "Sanofi",
    },
    {
        "name": "Atorvastatin 20mg",
        "dci": "Atorvastatin",
        "form": "Comprimé",
        "dosage": "20mg",
        "cond": "Boîte de 30",
        "fab": "Pfizer",
    },
    {
        "name": "Losartan 50mg",
        "dci": "Losartan",
        "form": "Comprimé",
        "dosage": "50mg",
        "cond": "Boîte de 28",
        "fab": "Novartis",
    },
    {
        "name": "Furosemide 40mg",
        "dci": "Furosemide",
        "form": "Comprimé",
        "dosage": "40mg",
        "cond": "Boîte de 20",
        "fab": "Sanofi",
    },
    {
        "name": "Aspirine 100mg",
        "dci": "Acetylsalicylic acid",
        "form": "Comprimé",
        "dosage": "100mg",
        "cond": "Boîte de 30",
        "fab": "Bayer",
    },
    {
        "name": "Héparine 5000UI",
        "dci": "Heparin",
        "form": "Solution injectable",
        "dosage": "5000UI/ml",
        "cond": "Flacon de 5ml",
        "fab": "Panpharma",
    },
    # Antidiabetics
    {
        "name": "Metformine 500mg",
        "dci": "Metformin",
        "form": "Comprimé",
        "dosage": "500mg",
        "cond": "Boîte de 60",
        "fab": "Saidal",
    },
    {
        "name": "Metformine 850mg",
        "dci": "Metformin",
        "form": "Comprimé",
        "dosage": "850mg",
        "cond": "Boîte de 30",
        "fab": "Merck",
    },
    {
        "name": "Glimépiride 2mg",
        "dci": "Glimenide",
        "form": "Comprimé",
        "dosage": "2mg",
        "cond": "Boîte de 30",
        "fab": "Sanofi",
    },
    {
        "name": "Insuline Glargine",
        "dci": "Insulin glargine",
        "form": "Solution injectable",
        "dosage": "100UI/ml",
        "cond": "Stylo de 3ml",
        "fab": "Lilly",
    },
    # Gastrointestinal
    {
        "name": "Oméprazole 20mg",
        "dci": "Omeprazole",
        "form": "Gélule",
        "dosage": "20mg",
        "cond": "Boîte de 14",
        "fab": "Saidal",
    },
    {
        "name": "Oméprazole 40mg",
        "dci": "Omeprazole",
        "form": "Gélule",
        "dosage": "40mg",
        "cond": "Boîte de 7",
        "fab": "AstraZeneca",
    },
    {
        "name": "Pantoprazole 40mg",
        "dci": "Pantoprazole",
        "form": "Comprimé",
        "dosage": "40mg",
        "cond": "Boîte de 14",
        "fab": "Takeda",
    },
    {
        "name": "Domperidone 10mg",
        "dci": "Domperidone",
        "form": "Comprimé",
        "dosage": "10mg",
        "cond": "Boîte de 30",
        "fab": "Janssen",
    },
    {
        "name": "Lopéramide 2mg",
        "dci": "Loperamide",
        "form": "Gélule",
        "dosage": "2mg",
        "cond": "Boîte de 8",
        "fab": "Janssen",
    },
    # Respiratory
    {
        "name": "Salbutamol 100µg",
        "dci": "Salbutamol",
        "form": "Aérosol",
        "dosage": "100µg/dose",
        "cond": "Flacon de 200 doses",
        "fab": "GSK",
    },
    {
        "name": "Budesonide 100µg",
        "dci": "Budesonide",
        "form": "Aérosol",
        "dosage": "100µg/dose",
        "cond": "Flacon de 200 doses",
        "fab": "AstraZeneca",
    },
    {
        "name": "Acétylcystéine 200mg",
        "dci": "Acetylcysteine",
        "form": "Granulés",
        "dosage": "200mg",
        "cond": "Sachets de 20",
        "fab": "Zambon",
    },
    {
        "name": "Montélukast 4mg",
        "dci": "Montelukast",
        "form": "Comprimé à croquer",
        "dosage": "4mg",
        "cond": "Boîte de 28",
        "fab": "MSD",
    },
    {
        "name": "Théophylline 200mg",
        "dci": "Theophylline",
        "form": "Comprimé",
        "dosage": "200mg",
        "cond": "Boîte de 20",
        "fab": "Sanofi",
    },
    # Anticoagulants
    {
        "name": "Warfarin 5mg",
        "dci": "Warfarin",
        "form": "Comprimé",
        "dosage": "5mg",
        "cond": "Boîte de 30",
        "fab": "Sanofi",
    },
    {
        "name": "Clopidogrel 75mg",
        "dci": "Clopidogrel",
        "form": "Comprimé",
        "dosage": "75mg",
        "cond": "Boîte de 28",
        "fab": "Sanofi",
    },
    {
        "name": "Rivaroxaban 20mg",
        "dci": "Rivaroxaban",
        "form": "Comprimé",
        "dosage": "20mg",
        "cond": "Boîte de 28",
        "fab": "Bayer",
    },
    # Anticonvulsants
    {
        "name": "Carbamazépine 200mg",
        "dci": "Carbamazepine",
        "form": "Comprimé",
        "dosage": "200mg",
        "cond": "Boîte de 50",
        "fab": "Novartis",
    },
    {
        "name": "Valproate de sodium 500mg",
        "dci": "Valproic acid",
        "form": "Comprimé",
        "dosage": "500mg",
        "cond": "Boîte de 40",
        "fab": "Sanofi",
    },
    {
        "name": "Phénytoïne 100mg",
        "dci": "Phenytoin",
        "form": "Comprimé",
        "dosage": "100mg",
        "cond": "Boîte de 50",
        "fab": "Hoffmann-La Roche",
    },
    {
        "name": "Levetiracétam 500mg",
        "dci": "Levetiracetam",
        "form": "Comprimé",
        "dosage": "500mg",
        "cond": "Boîte de 30",
        "fab": "UCB",
    },
    # Antihistamines
    {
        "name": "Cétirizine 10mg",
        "dci": "Cetirizine",
        "form": "Comprimé",
        "dosage": "10mg",
        "cond": "Boîte de 10",
        "fab": "Saidal",
    },
    {
        "name": "Loratadine 10mg",
        "dci": "Loratadine",
        "form": "Comprimé",
        "dosage": "10mg",
        "cond": "Boîte de 10",
        "fab": "Bayer",
    },
    {
        "name": "Prométhazine 25mg",
        "dci": "Promethazine",
        "form": "Comprimé",
        "dosage": "25mg",
        "cond": "Boîte de 20",
        "fab": "Sanofi",
    },
    # Psychiatric
    {
        "name": "Diazepam 10mg",
        "dci": "Diazepam",
        "form": "Comprimé",
        "dosage": "10mg",
        "cond": "Boîte de 20",
        "fab": "Sanofi",
    },
    {
        "name": "Alprazolam 0.5mg",
        "dci": "Alprazolam",
        "form": "Comprimé",
        "dosage": "0.5mg",
        "cond": "Boîte de 30",
        "fab": "Pfizer",
    },
    {
        "name": "Fluoxétine 20mg",
        "dci": "Fluoxetine",
        "form": "Gélule",
        "dosage": "20mg",
        "cond": "Boîte de 28",
        "fab": "Lilly",
    },
    {
        "name": "Amitriptyline 25mg",
        "dci": "Amitriptyline",
        "form": "Comprimé",
        "dosage": "25mg",
        "cond": "Boîte de 30",
        "fab": "Sanofi",
    },
    {
        "name": "Halopéridol 5mg",
        "dci": "Haloperidol",
        "form": "Comprimé",
        "dosage": "5mg",
        "cond": "Boîte de 20",
        "fab": "Janssen",
    },
    # Corticosteroids
    {
        "name": "Bétaméthasone injectable",
        "dci": "Betamethasone",
        "form": "Solution injectable",
        "dosage": "4mg/ml",
        "cond": "Ampoule de 1ml",
        "fab": "Schering",
    },
    {
        "name": "Méthylprednisolone 40mg",
        "dci": "Methylprednisolone",
        "form": "Poudre pour injection",
        "dosage": "40mg",
        "cond": "Flacon",
        "fab": "Pfizer",
    },
    # IV Fluids
    {
        "name": "Sérum physiologique 0.9%",
        "dci": "Sodium chloride",
        "form": "Solution injectable",
        "dosage": "0.9%",
        "cond": "Poche de 500ml",
        "fab": "Frésénius",
    },
    {
        "name": "Glucose 5%",
        "dci": "Glucose",
        "form": "Solution injectable",
        "dosage": "5%",
        "cond": "Poche de 500ml",
        "fab": "Frésénius",
    },
    {
        "name": "Ringer Lactate",
        "dci": "Ringer's lactate",
        "form": "Solution injectable",
        "dosage": "-",
        "cond": "Poche de 500ml",
        "fab": "Frésénius",
    },
    {
        "name": "Eau pour préparation injectable",
        "dci": "Water for injection",
        "form": "Solution injectable",
        "dosage": "-",
        "cond": "Ampoule de 5ml",
        "fab": "Panpharma",
    },
    # Anesthetics
    {
        "name": "Lidocaïne 1%",
        "dci": "Lidocaine",
        "form": "Solution injectable",
        "dosage": "1%",
        "cond": "Flacon de 10ml",
        "fab": "Panpharma",
    },
    {
        "name": "Lidocaïne 2%",
        "dci": "Lidocaine",
        "form": "Solution injectable",
        "dosage": "2%",
        "cond": "Flacon de 10ml",
        "fab": "Panpharma",
    },
    {
        "name": "Propofol 1%",
        "dci": "Propofol",
        "form": "Emulsion injectable",
        "dosage": "1%",
        "cond": "Flacon de 20ml",
        "fab": "Fresenius Kabi",
    },
    {
        "name": "Kétamine 50mg",
        "dci": "Ketamine",
        "form": "Solution injectable",
        "dosage": "50mg/ml",
        "cond": "Flacon de 10ml",
        "fab": "Panpharma",
    },
    # Muscle relaxants
    {
        "name": "Curarisant",
        "dci": "Atracurium",
        "form": "Solution injectable",
        "dosage": "10mg/ml",
        "cond": "Ampoule de 2.5ml",
        "fab": "GSK",
    },
    {
        "name": "Suxaméthonium 100mg",
        "dci": "Succinylcholine",
        "form": "Poudre pour injection",
        "dosage": "100mg",
        "cond": "Flacon",
        "fab": "Panpharma",
    },
    # Antiemetics
    {
        "name": "Ondansétron 4mg",
        "dci": "Ondansetron",
        "form": "Solution injectable",
        "dosage": "4mg",
        "cond": "Ampoule de 2ml",
        "fab": "GSK",
    },
    {
        "name": "Métoclopramide 10mg",
        "dci": "Metoclopramide",
        "form": "Solution injectable",
        "dosage": "10mg",
        "cond": "Ampoule de 2ml",
        "fab": "Sanofi",
    },
    # Diuretics
    {
        "name": "Spironolactone 25mg",
        "dci": "Spironolactone",
        "form": "Comprimé",
        "dosage": "25mg",
        "cond": "Boîte de 20",
        "fab": "Pfizer",
    },
    {
        "name": "Hydrochlorothiazide 25mg",
        "dci": "Hydrochlorothiazide",
        "form": "Comprimé",
        "dosage": "25mg",
        "cond": "Boîte de 20",
        "fab": "Sanofi",
    },
    # Antivirals
    {
        "name": "Acyclovir 200mg",
        "dci": "Acyclovir",
        "form": "Comprimé",
        "dosage": "200mg",
        "cond": "Boîte de 25",
        "fab": "GSK",
    },
    {
        "name": "Oseltamivir 75mg",
        "dci": "Oseltamivir",
        "form": "Gélule",
        "dosage": "75mg",
        "cond": "Boîte de 10",
        "fab": "Roche",
    },
    # Others
    {
        "name": "Fexofénadine 180mg",
        "dci": "Fexofenadine",
        "form": "Comprimé",
        "dosage": "180mg",
        "cond": "Boîte de 10",
        "fab": "Sanofi",
    },
    {
        "name": "Albendazole 400mg",
        "dci": "Albendazole",
        "form": "Comprimé",
        "dosage": "400mg",
        "cond": "Boîte de 1",
        "fab": "GSK",
    },
    {
        "name": "Mébendazole 100mg",
        "dci": "Mebendazole",
        "form": "Comprimé",
        "dosage": "100mg",
        "cond": "Boîte de 6",
        "fab": "Janssen",
    },
    {
        "name": "Sulfadiazine d'argent 1%",
        "dci": "Silver sulfadiazine",
        "form": "Crème",
        "dosage": "1%",
        "cond": "Tube de 50g",
        "fab": "Sanofi",
    },
    {
        "name": "Vitamine B1 100mg",
        "dci": "Thiamine",
        "form": "Solution injectable",
        "dosage": "100mg",
        "cond": "Ampoule de 2ml",
        "fab": "Roche",
    },
    {
        "name": "Vitamine B12 1000µg",
        "dci": "Cyanocobalamin",
        "form": "Solution injectable",
        "dosage": "1000µg",
        "cond": "Ampoule de 1ml",
        "fab": "Roche",
    },
    {
        "name": "Fer injectable",
        "dci": "Iron sucrose",
        "form": "Solution injectable",
        "dosage": "100mg",
        "cond": "Ampoule de 5ml",
        "fab": "Vifor",
    },
    {
        "name": "Calcium gluconate 10%",
        "dci": "Calcium gluconate",
        "form": "Solution injectable",
        "dosage": "10%",
        "cond": "Ampoule de 10ml",
        "fab": "Panpharma",
    },
    {
        "name": "Magnésium sulfate 50%",
        "dci": "Magnesium sulfate",
        "form": "Solution injectable",
        "dosage": "50%",
        "cond": "Ampoule de 10ml",
        "fab": "Panpharma",
    },
    {
        "name": "Potassium chlorure 10%",
        "dci": "Potassium chloride",
        "form": "Solution injectable",
        "dosage": "10%",
        "cond": "Ampoule de 10ml",
        "fab": "Frésénius",
    },
]

# Real Algerian pharmaceutical suppliers
FOURNISSEURS = [
    {
        "code": "SAIDAL",
        "name": "Société Algérienne des Industries Pharmaceutiques",
        "type": "FABRICANT",
        "wilaya": "Alger",
        "commune": "Boudouaou",
    },
    {
        "code": "PHARMALLIANCE",
        "name": "PharmAlliance",
        "type": "GROSSISTE",
        "wilaya": "Alger",
        "commune": "Alger Centre",
    },
    {
        "code": "COPHARI",
        "name": "COPHARI",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "Bab El Oued",
    },
    {
        "code": "SAE",
        "name": "Société Algérienne d'Exportation",
        "type": "IMPORTATEUR",
        "wilaya": "Oran",
        "commune": "Es Senia",
    },
    {
        "code": "INPHA",
        "name": "Industrie Pharmaceutique Hospitalière",
        "type": "FABRICANT",
        "wilaya": "Blida",
        "commune": "Blida",
    },
    {
        "code": "MERIEUX",
        "name": "BioMérieux Algeria",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "Hydra",
    },
    {
        "code": "GLAXO",
        "name": "GSK Algeria",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "Ben Aknoun",
    },
    {
        "code": "NOVARTIS",
        "name": "Novartis Pharma Algeria",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "Alger Centre",
    },
    {
        "code": "SANOFI",
        "name": "Sanofi Aventis Algeria",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "Bir Mourad Raïs",
    },
    {
        "code": "PFIZER",
        "name": "Pfizer Algeria",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "El Biar",
    },
    {
        "code": "ROCHE",
        "name": "Roche Algeria",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "Hydra",
    },
    {
        "code": "BAYER",
        "name": "Bayer Algeria",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "Ben Aknoun",
    },
    {
        "code": "MSD",
        "name": "MSD Algeria",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "Alger Centre",
    },
    {
        "code": "FRESENIUS",
        "name": "Fresenius Kabi Algeria",
        "type": "IMPORTATEUR",
        "wilaya": "Alger",
        "commune": "Bouchaoui",
    },
    {
        "code": "PANPHARMA",
        "name": "Panpharma Group Algeria",
        "type": "FABRICANT",
        "wilaya": "Blida",
        "commune": "Oued Alleug",
    },
]

# Hospital services (based on Oran/Medea hospital structure)
SERVICES = [
    {
        "code": "URGENCES",
        "nom": "Urgences",
        "type": "CLINIQUE",
        "specialite": "Médecine d'urgence",
        "lits": 30,
        "magasin": "URGENCE",
    },
    {
        "code": "REANIMATION",
        "nom": "Réanimation",
        "type": "CLINIQUE",
        "specialite": "Soins intensifs",
        "lits": 15,
        "magasin": "CHAINE_FROID",
    },
    {
        "code": "CARDIO",
        "nom": "Cardiologie",
        "type": "CLINIQUE",
        "specialite": "Maladies cardiovasculaires",
        "lits": 25,
        "magasin": "MAGASIN_CARDIO",
    },
    {
        "code": "CHIRURGIE",
        "nom": "Chirurgie",
        "type": "CHIRURGIE",
        "specialite": "Chirurgie générale",
        "lits": 30,
        "magasin": "MAGASIN_CHIRURGIE",
    },
    {
        "code": "PEDIATRIE",
        "nom": "Pédiatrie",
        "type": "CLINIQUE",
        "specialite": "Médecine infantile",
        "lits": 35,
        "magasin": "MAGASIN_PEDIATRIE",
    },
    {
        "code": "MATERNITE",
        "nom": "Maternité",
        "type": "CLINIQUE",
        "specialite": "Gynécologie obstétrique",
        "lits": 25,
        "magasin": "MAGASIN_MATERNITE",
    },
    {
        "code": "NEONATAL",
        "nom": "Néonatologie",
        "type": "CLINIQUE",
        "specialite": "Soins néonatals",
        "lits": 15,
        "magasin": "MAGASIN_NEONATAL",
    },
    {
        "code": "PHARMA",
        "nom": "Pharmacie Centrale",
        "type": "SUPPORT",
        "specialite": "Pharmacie hospitalière",
        "lits": 0,
        "magasin": "PRINCIPAL",
    },
]

# Realistic users
USERS = [
    # Direction
    {
        "username": "admin",
        "first_name": "Admin",
        "last_name": "System",
        "fonction": "ADMIN",
        "email": "admin@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "bridja_fatima",
        "first_name": "Fatima Zahra",
        "last_name": "Bridja",
        "fonction": "PHARMACIEN",
        "email": "bridja.fz@pharma.dz",
        "service": "PHARMA",
        "specialite": "Pharmacienne Chef",
    },
    {
        "username": "nacher_faiza",
        "first_name": "Faiza",
        "last_name": "Nacher",
        "fonction": "PHARMACIEN",
        "email": "nacher.fz@pharma.dz",
        "service": "PHARMA",
        "specialite": "Pharmacienne Principale",
    },
    # Responsables des magasins - Responsables
    {
        "username": "louahab_yasmine",
        "first_name": "Yasmine",
        "last_name": "Louahab",
        "fonction": "PHARMACIEN",
        "email": "louahab.y@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "feddani_asma",
        "first_name": "Asma",
        "last_name": "Feddani",
        "fonction": "PHARMACIEN",
        "email": "feddani.a@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "derbel_imane",
        "first_name": "Imane",
        "last_name": "Derbel",
        "fonction": "PHARMACIEN",
        "email": "derbel.i@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "chenaif_sanaa",
        "first_name": "Sanaa",
        "last_name": "Chenaif",
        "fonction": "PHARMACIEN",
        "email": "chenaif.s@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "belhadj_ferriel",
        "first_name": "Ferriel",
        "last_name": "Belhadji",
        "fonction": "PHARMACIEN",
        "email": "belhadj.f@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "bougnina_djilali",
        "first_name": "Djilali",
        "last_name": "Bougnina",
        "fonction": "PHARMACIEN",
        "email": "bougnina.d@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "boudjemaa_manel",
        "first_name": "Manel",
        "last_name": "Boudjemaa",
        "fonction": "PHARMACIEN",
        "email": "boudjemaa.m@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "lahmar_cherif",
        "first_name": "Cherif Sameh",
        "last_name": "Lahmar",
        "fonction": "RESPONSABLE",
        "email": "lahmar.cs@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "rezki_houaria",
        "first_name": "Houaria",
        "last_name": "Rezki",
        "fonction": "PHARMACIEN",
        "email": "rezki.h@pharma.dz",
        "service": "PHARMA",
    },
    {
        "username": "belmokhtar_farah",
        "first_name": "Farah",
        "last_name": "Belmokhtar",
        "fonction": "PHARMACIEN",
        "email": "belmokhtar.f@pharma.dz",
        "service": "PHARMA",
    },
    # Services hospitaliers
    {
        "username": "medecin_urgences",
        "first_name": "Medecin",
        "last_name": "Urgences",
        "fonction": "MEDECIN",
        "email": "urgences@pharma.dz",
        "specialite": "Médecine d'urgence",
        "service": "URGENCES",
    },
    {
        "username": "medecin_reanimation",
        "first_name": "Medecin",
        "last_name": "Réanimation",
        "fonction": "MEDECIN",
        "email": "reanimation@pharma.dz",
        "specialite": "Réanimation",
        "service": "REANIMATION",
    },
    {
        "username": "medecin_cardio",
        "first_name": "Medecin",
        "last_name": "Cardiologie",
        "fonction": "MEDECIN",
        "email": "cardio@pharma.dz",
        "specialite": "Cardiologie",
        "service": "CARDIO",
    },
    {
        "username": "medecin_chirurgie",
        "first_name": "Medecin",
        "last_name": "Chirurgie",
        "fonction": "MEDECIN",
        "email": "chirurgie@pharma.dz",
        "specialite": "Chirurgie générale",
        "service": "CHIRURGIE",
    },
    {
        "username": "medecin_pediatrie",
        "first_name": "Medecin",
        "last_name": "Pédiatrie",
        "fonction": "MEDECIN",
        "email": "pediatrie@pharma.dz",
        "specialite": "Pédiatrie",
        "service": "PEDIATRIE",
    },
]

# Permissions list
RESOURCES = [
    "produits",
    "lots",
    "mouvements",
    "fournisseurs",
    "commandes",
    "magasins",
    "services",
    "utilisateurs",
    "roles",
    "dashboard",
    "journals",
]

PERMISSIONS_CONFIG = {
    "ADMIN": {  # Full access
        "produits": ["view", "add", "change", "delete"],
        "lots": ["view", "add", "change", "delete"],
        "mouvements": ["view", "add", "change", "delete"],
        "fournisseurs": ["view", "add", "change", "delete"],
        "commandes": ["view", "add", "change", "delete"],
        "magasins": ["view", "add", "change", "delete"],
        "services": ["view", "add", "change", "delete"],
        "utilisateurs": ["view", "add", "change", "delete"],
        "roles": ["view", "add", "change", "delete"],
        "dashboard": ["view"],
        "journals": ["view"],
    },
    "PHARMACIEN": {  # Can manage products, lots, orders
        "produits": ["view", "add", "change"],
        "lots": ["view", "add", "change"],
        "mouvements": ["view", "add", "change"],
        "fournisseurs": ["view"],
        "commandes": ["view", "add", "change"],
        "magasins": ["view"],
        "services": ["view"],
        "utilisateurs": ["view"],
        "roles": [],
        "dashboard": ["view"],
        "journals": ["view"],
    },
    "TECHNICIEN": {  # Can view and do movements
        "produits": ["view"],
        "lots": ["view", "add"],
        "mouvements": ["view", "add"],
        "fournisseurs": ["view"],
        "commandes": ["view"],
        "magasins": ["view"],
        "services": ["view"],
        "utilisateurs": [],
        "roles": [],
        "dashboard": ["view"],
        "journals": [],
    },
    "RESPONSABLE": {  # Can manage orders
        "produits": ["view"],
        "lots": ["view"],
        "mouvements": ["view"],
        "fournisseurs": ["view"],
        "commandes": ["view", "add", "change"],
        "magasins": ["view"],
        "services": ["view"],
        "utilisateurs": [],
        "roles": [],
        "dashboard": ["view"],
        "journals": ["view"],
    },
    "MEDECIN": {  # Can view and request orders
        "produits": ["view"],
        "lots": ["view"],
        "mouvements": [],
        "fournisseurs": [],
        "commandes": ["view", "add"],
        "magasins": [],
        "services": ["view"],
        "utilisateurs": [],
        "roles": [],
        "dashboard": ["view"],
        "journals": [],
    },
    "CONSULTANT": {  # Read only
        "produits": ["view"],
        "lots": ["view"],
        "mouvements": ["view"],
        "fournisseurs": ["view"],
        "commandes": ["view"],
        "magasins": ["view"],
        "services": ["view"],
        "utilisateurs": [],
        "roles": [],
        "dashboard": ["view"],
        "journals": ["view"],
    },
}

MAGASINS = [
    {
        "code": "PRINCIPAL",
        "nom": "Pharmacie Centrale",
        "type": "PRINCIPAL",
        "batiment": "Bâtiment A",
        "etage": 0,
        "niveau_securite": "NORMAL",
    },
    {
        "code": "HORS_CIRCLE",
        "nom": "Stock Hors Circuit",
        "type": "HORS_CIRCLE",
        "batiment": "Bâtiment A",
        "etage": 0,
        "niveau_securite": "ELEVE",
    },
    {
        "code": "URGENCE",
        "nom": "Stock Urgence",
        "type": "URGENCE",
        "batiment": "Urgences",
        "etage": 0,
        "niveau_securite": "ELEVE",
    },
    {
        "code": "PSYCHO",
        "nom": "Stock Psychotropes",
        "type": "PSYCHOTROPES",
        "batiment": "Bâtiment A",
        "etage": -1,
        "niveau_securite": "TRES_ELEVE",
    },
    {
        "code": "CHAINE_FROID",
        "nom": "Chaine Froid",
        "type": "CHAINE_FROID",
        "batiment": "Bâtiment A",
        "etage": 0,
        "niveau_securite": "ELEVE",
    },
    {
        "code": "CONSOMMABLES",
        "nom": "Magasin Consommables",
        "type": "CONSOMMABLES",
        "batiment": "Bâtiment B",
        "etage": 1,
        "niveau_securite": "NORMAL",
    },
    # Service-specific pharmacies
    {
        "code": "MAGASIN_CARDIO",
        "nom": "Pharmacie Cardiologie",
        "type": "PRINCIPAL",
        "batiment": "Bâtiment C",
        "etage": 1,
        "niveau_securite": "NORMAL",
    },
    {
        "code": "MAGASIN_CHIRURGIE",
        "nom": "Pharmacie Chirurgie",
        "type": "PRINCIPAL",
        "batiment": "Bâtiment B",
        "etage": 2,
        "niveau_securite": "NORMAL",
    },
    {
        "code": "MAGASIN_PEDIATRIE",
        "nom": "Pharmacie Pédiatrie",
        "type": "PRINCIPAL",
        "batiment": "Bâtiment D",
        "etage": 1,
        "niveau_securite": "NORMAL",
    },
    {
        "code": "MAGASIN_MATERNITE",
        "nom": "Pharmacie Maternité",
        "type": "PRINCIPAL",
        "batiment": "Bâtiment D",
        "etage": 0,
        "niveau_securite": "NORMAL",
    },
    {
        "code": "MAGASIN_NEONATAL",
        "nom": "Pharmacie Néonatologie",
        "type": "PRINCIPAL",
        "batiment": "Bâtiment D",
        "etage": 1,
        "niveau_securite": "ELEVE",
    },
]


class Command(BaseCommand):
    help = "Seeds the database with realistic data"

    def handle(self, *args, **options):
        self.stdout.write("Clearing database...")

        # Clear all data
        LotProduit.objects.all().delete()
        Produit.objects.all().delete()
        Magasin.objects.all().delete()
        Fournisseur.objects.all().delete()
        Service.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        Role.objects.all().delete()
        Permission.objects.all().delete()

        self.stdout.write(self.style.SUCCESS("Database cleared"))

        # Create Permissions
        self.stdout.write("Creating permissions...")
        perms_dict = {}
        for resource in RESOURCES:
            for action in ["view", "add", "change", "delete"]:
                perm, _ = Permission.objects.get_or_create(
                    codename=f"can_{action}_{resource}",
                    defaults={
                        "name": f"Can {action} {resource}",
                        "resource": resource,
                    },
                )
                perm.can_view = action == "view"
                perm.can_add = action == "add"
                perm.can_change = action == "change"
                perm.can_delete = action == "delete"
                perm.save()
                perms_dict[f"{resource}.{action}"] = perm

        # Create Roles
        self.stdout.write("Creating roles...")
        roles_dict = {}
        for role_name, perms_config in PERMISSIONS_CONFIG.items():
            role, _ = Role.objects.get_or_create(
                name=role_name, defaults={"description": f"Rôle {role_name}"}
            )
            role.permissions.clear()
            for resource, actions in perms_config.items():
                for action in actions:
                    key = f"{resource}.{action}"
                    if key in perms_dict:
                        role.permissions.add(perms_dict[key])
            roles_dict[role_name] = role
            self.stdout.write(f"  Created role: {role_name}")

        # Create Magasins (before Services so they can be assigned)
        self.stdout.write("Creating magasins...")
        magasins_list = []
        for m in MAGASINS:
            mag, _ = Magasin.objects.get_or_create(
                code_magasin=m["code"],
                defaults={
                    "nom": m["nom"],
                    "type_magasin": m["type"],
                    "batiment": m.get("batiment"),
                    "etage": m.get("etage", 0),
                    "niveau_securite": m.get("niveau_securite", "NORMAL"),
                },
            )
            magasins_list.append(mag)
            self.stdout.write(f"  Created magasin: {m['code']} - {m['nom']}")

        # Create Services
        self.stdout.write("Creating services...")
        services_dict = {}
        for svc in SERVICES:
            # Get the assigned magasin if specified
            assigned_magasin = None
            if svc.get("magasin"):
                assigned_magasin = Magasin.objects.filter(
                    code_magasin=svc["magasin"]
                ).first()

            service, _ = Service.objects.get_or_create(
                code_service=svc["code"],
                defaults={
                    "nom": svc["nom"],
                    "type_service": svc["type"],
                    "specialite": svc.get("specialite"),
                    "nombre_lits": svc.get("lits", 0),
                    "magasin": assigned_magasin,
                },
            )
            # Update magasin if already exists
            if service and assigned_magasin and not service.magasin:
                service.magasin = assigned_magasin
                service.save()
            services_dict[svc["code"]] = service
            self.stdout.write(
                f"  Created service: {svc['code']} - {svc['nom']}"
                + (f" -> {assigned_magasin.nom}" if assigned_magasin else "")
            )

        # Create Fournisseurs
        self.stdout.write("Creating fournisseurs...")
        fournisseurs_list = []
        for f in FOURNISSEURS:
            fobj, _ = Fournisseur.objects.get_or_create(
                code_fournisseur=f["code"],
                defaults={
                    "raison_sociale": f["name"],
                    "type_fournisseur": f["type"],
                    "wilaya": f.get("wilaya"),
                    "commune": f.get("commune"),
                    "telephone": f"{random.randint(210, 699)}{random.randint(100000, 999999)}",
                    "email": f"{f['code'].lower()}@pharma.dz",
                },
            )
            fournisseurs_list.append(fobj)
            self.stdout.write(f"  Created fournisseur: {f['code']}")

        # Create Users
        self.stdout.write("Creating users...")
        for u in USERS:
            user, created = User.objects.get_or_create(
                username=u["username"],
                defaults={
                    "first_name": u["first_name"],
                    "last_name": u["last_name"],
                    "email": u["email"],
                    "fonction": u["fonction"],
                    "specialite": u.get("specialite"),
                    "role": roles_dict.get(u["fonction"]),
                    "service": services_dict.get(u["service"]),
                },
            )
            if created:
                user.set_password("password123")
                user.save()
            self.stdout.write(f"  Created user: {u['username']} ({u['fonction']})")

        # Create Produits and Lots
        self.stdout.write("Creating produits and lots...")
        for i, med in enumerate(MEDICATIONS):
            # Generate code national (13 digits, Algeria format)
            code_national = f"3000{str(i + 1).zfill(8)}"

            produit, _ = Produit.objects.get_or_create(
                code_national=code_national,
                defaults={
                    "code_interne": f"PR{str(i + 1).zfill(4)}",
                    "denomination": med["name"],
                    "forme_pharmaceutique": med["form"],
                    "dosage": med["dosage"],
                    "dci": med["dci"],
                    "conditionnement": med["cond"],
                    "unite_mesure": "Unité",
                    "quantite_par_unite": 1,
                    "stock_securite": random.randint(20, 100),
                    "stock_alerte": random.randint(50, 200),
                    "duree_peremption_mois": random.choice([12, 24, 36]),
                    "temperature_conservation": random.choice(
                        ["15-25°C", "2-8°C", "<25°C"]
                    ),
                    "necessite_chaine_froid": med["form"]
                    in ["Solution injectable", "Aérosol", "Emulsion injectable"],
                    "type_produit": "MEDICAMENT",
                    "categorie_surveillance": random.choice(
                        ["NORMAL", "NORMAL", "NORMAL", "PSYCHOTROPE"]
                    ),
                    "fabricant": med["fab"],
                    "actif": True,
                },
            )

            # Create lots for each product
            num_lots = random.randint(1, 4)
            principal_magasin = Magasin.objects.filter(code_magasin="PRINCIPAL").first()
            for j in range(num_lots):
                lot_num = f"LOT{code_national[-8:]}{j + 1}"
                date_fab = datetime.now() - timedelta(days=random.randint(30, 365))
                date_peremp = date_fab + timedelta(days=random.randint(180, 1095))
                date_recep = datetime.now() - timedelta(days=random.randint(1, 180))

                qty_init = random.randint(50, 500)
                qty_current = random.randint(0, qty_init)

                LotProduit.objects.get_or_create(
                    produit=produit,
                    numero_lot=lot_num,
                    defaults={
                        "date_fabrication": date_fab.date(),
                        "date_peremption": date_peremp.date(),
                        "date_reception": date_recep.date(),
                        "quantite_initiale": qty_init,
                        "quantite_actuelle": qty_current,
                        "quantite_reservee": random.randint(
                            0, max(1, qty_current // 4)
                        ),
                        "statut": "DISPONIBLE" if qty_current > 0 else "EPuISE",
                        "prix_unitaire_achat": round(random.uniform(50, 5000), 2),
                        "magasin": principal_magasin,
                    },
                )

            if (i + 1) % 10 == 0:
                self.stdout.write(f"  Created {i + 1} produits...")

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded database with {len(MEDICATIONS)} medications, {len(FOURNISSEURS)} fournisseurs, {len(SERVICES)} services, and {len(USERS)} users"
            )
        )
