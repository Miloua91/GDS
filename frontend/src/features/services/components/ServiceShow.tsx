import { Show, SimpleShowLayout, TextField, NumberField } from "@/components/admin"

export const ServiceShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="code_service" label="Code Service" />
        <TextField source="nom" label="Nom" />
        <TextField source="type_service" label="Type Service" />
        <TextField source="specialite" label="Spécialité" />
        <NumberField source="nombre_lits" label="Nombre Lits" />
        <TextField source="actif" label="Actif" />
      </SimpleShowLayout>
    </Show>
  )
}
