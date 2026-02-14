import { Show, SimpleShowLayout, TextField } from "@/components/admin"

export const MagasinShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="code_magasin" label="Code Magasin" />
        <TextField source="nom" label="Nom" />
        <TextField source="type_magasin" label="Type Magasin" />
        <TextField source="batiment" label="Bâtiment" />
        <TextField source="etage" label="Etage" />
        <TextField source="niveau_securite" label="Niveau Sécurité" />
        <TextField source="actif" label="Actif" />
      </SimpleShowLayout>
    </Show>
  )
}
