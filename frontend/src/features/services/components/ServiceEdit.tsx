import { Edit, SimpleForm, TextInput, NumberInput, BooleanInput } from "@/components/admin"

export const ServiceEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" disabled />
        <TextInput source="code_service" label="Code Service" required />
        <TextInput source="nom" label="Nom" required />
        <TextInput source="type_service" label="Type Service" />
        <TextInput source="specialite" label="Spécialité" />
        <NumberInput source="nombre_lits" label="Nombre Lits" />
        <BooleanInput source="actif" label="Actif" />
      </SimpleForm>
    </Edit>
  )
}
