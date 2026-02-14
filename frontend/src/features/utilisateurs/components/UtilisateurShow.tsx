import { Show, SimpleShowLayout, TextField, ReferenceField } from "@/components/admin"

export const UtilisateurShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="username" label="Nom d'utilisateur" />
        <TextField source="first_name" label="Prénom" />
        <TextField source="last_name" label="Nom" />
        <TextField source="email" label="Email" />
        <TextField source="fonction" label="Fonction" />
        <TextField source="specialite" label="Spécialité" />
        <TextField source="telephone" label="Téléphone" />
        <TextField source="numero_ordre" label="Numéro Ordre" />
        <ReferenceField source="role" reference="roles" link="show">
          <TextField source="name" label="Rôle" />
        </ReferenceField>
        <ReferenceField source="service" reference="services" link="show">
          <TextField source="nom" label="Service" />
        </ReferenceField>
        <TextField source="is_active" label="Actif" />
        <TextField source="is_staff" label="Staff" />
      </SimpleShowLayout>
    </Show>
  )
}
