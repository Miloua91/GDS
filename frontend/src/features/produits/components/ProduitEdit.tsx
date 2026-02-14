import { Edit, SimpleForm, TextInput, NumberInput, BooleanInput, SelectInput } from "@/components/admin"

export const ProduitEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" disabled />
        <TextInput source="code_national" label="Code National" required />
        <TextInput source="code_interne" label="Code Interne" />
        <TextInput source="denomination" label="Dénomination" required />
        <TextInput source="denomination_commerciale" label="Dénomination Commerciale" />
        <TextInput source="forme_pharmaceutique" label="Forme Pharmaceutique" required />
        <TextInput source="dosage" label="Dosage" required />
        <TextInput source="dci" label="DCI" />
        <TextInput source="classe_therapeutique" label="Classe Thérapeutique" />
        <TextInput source="conditionnement" label="Conditionnement" required />
        <TextInput source="unite_mesure" label="Unité de Mesure" required />
        <NumberInput source="quantite_par_unite" label="Quantité par Unité" />
        <NumberInput source="stock_securite" label="Stock Sécurité" />
        <NumberInput source="stock_alerte" label="Stock Alerte" />
        <NumberInput source="duree_peremption_mois" label="Durée Péremption (mois)" />
        <TextInput source="temperature_conservation" label="Température Conservation" />
        <BooleanInput source="necessite_chaine_froid" label="Nécessite Chaîne Froid" />
        <SelectInput
          source="type_produit"
          label="Type Produit"
          choices={[
            { id: "MEDICAMENT", name: "Médicament" },
            { id: "DISPOSITIF_MEDICAL", name: "Dispositif médical" },
            { id: "CONSOMMABLE", name: "Consommable" },
            { id: "REACTIF", name: "Réactif" },
            { id: "GAZ_MEDICAL", name: "Gaz médical" },
          ]}
        />
        <SelectInput
          source="categorie_surveillance"
          label="Catégorie Surveillance"
          choices={[
            { id: "NORMAL", name: "Normal" },
            { id: "PSYCHOTROPE", name: "Psychotrope" },
            { id: "STUPEFIANT", name: "Stupéfiant" },
            { id: "PRODUIT_SANG", name: "Produit sanguin" },
            { id: "ONCOLOGIE", name: "Oncologie" },
          ]}
        />
        <SelectInput
          source="statut"
          label="Statut"
          choices={[
            { id: "ACTIF", name: "Actif" },
            { id: "INACTIF", name: "Inactif" },
            { id: "RETIRE", name: "Retiré" },
            { id: "RUPTURE_NATIONALE", name: "Rupture nationale" },
          ]}
        />
        <TextInput source="fabricant" label="Fabricant" />
        <TextInput source="numero_amm" label="Numéro AMM" />
        <BooleanInput source="actif" label="Actif" />
      </SimpleForm>
    </Edit>
  )
}
