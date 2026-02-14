import { Show, SimpleShowLayout, TextField, NumberField, DateField } from "@/components/admin"

export const ProduitShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="code_national" label="Code National" />
        <TextField source="code_interne" label="Code Interne" />
        <TextField source="denomination" label="Dénomination" />
        <TextField source="denomination_commerciale" label="Dénomination Commerciale" />
        <TextField source="forme_pharmaceutique" label="Forme Pharmaceutique" />
        <TextField source="dosage" label="Dosage" />
        <TextField source="dci" label="DCI" />
        <TextField source="classe_therapeutique" label="Classe Thérapeutique" />
        <TextField source="conditionnement" label="Conditionnement" />
        <TextField source="unite_mesure" label="Unité de Mesure" />
        <NumberField source="quantite_par_unite" label="Quantité par Unité" />
        <NumberField source="stock_securite" label="Stock Sécurité" />
        <NumberField source="stock_alerte" label="Stock Alerte" />
        <NumberField source="duree_peremption_mois" label="Durée Péremption (mois)" />
        <TextField source="temperature_conservation" label="Température Conservation" />
        <TextField source="necessite_chaine_froid" label="Chaîne Froid" />
        <TextField source="type_produit" label="Type Produit" />
        <TextField source="categorie_surveillance" label="Catégorie Surveillance" />
        <TextField source="statut" label="Statut" />
        <TextField source="fabricant" label="Fabricant" />
        <TextField source="numero_amm" label="Numéro AMM" />
        <TextField source="actif" label="Actif" />
      </SimpleShowLayout>
    </Show>
  )
}
