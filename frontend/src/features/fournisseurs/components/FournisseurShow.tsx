import { Show, SimpleShowLayout, TextField } from "@/components/admin"

export const FournisseurShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="code_fournisseur" label="Code Fournisseur" />
        <TextField source="raison_sociale" label="Raison Sociale" />
        <TextField source="sigle" label="Sigle" />
        <TextField source="type_fournisseur" label="Type Fournisseur" />
        <TextField source="categorie" label="Catégorie" />
        <TextField source="adresse" label="Adresse" />
        <TextField source="wilaya" label="Wilaya" />
        <TextField source="commune" label="Commune" />
        <TextField source="telephone" label="Téléphone" />
        <TextField source="email" label="Email" />
        <TextField source="nom_contact" label="Nom Contact" />
        <TextField source="telephone_contact" label="Téléphone Contact" />
        <TextField source="statut" label="Statut" />
      </SimpleShowLayout>
    </Show>
  )
}
