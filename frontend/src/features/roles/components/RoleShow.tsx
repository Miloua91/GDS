import { Show, SimpleShowLayout, TextField } from "@/components/admin"

export const RoleShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="name" label="Nom" />
        <TextField source="description" label="Description" />
        <TextField source="is_active" label="Actif" />
      </SimpleShowLayout>
    </Show>
  )
}
