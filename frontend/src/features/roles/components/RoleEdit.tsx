import { Edit, SimpleForm, TextInput, BooleanInput, ReferenceArrayInput, AutocompleteArrayInput } from "@/components/admin"

export const RoleEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" disabled />
        <TextInput source="name" label="Nom" required />
        <TextInput source="description" label="Description" />
        <BooleanInput source="is_active" label="Actif" />
        <ReferenceArrayInput
          source="permission_ids"
          reference="permissions"
        >
          <AutocompleteArrayInput optionText="name" optionValue="id" />
        </ReferenceArrayInput>
      </SimpleForm>
    </Edit>
  )
}
