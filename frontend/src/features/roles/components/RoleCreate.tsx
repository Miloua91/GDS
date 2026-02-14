import { Create, SimpleForm, TextInput, BooleanInput, ReferenceArrayInput, AutocompleteArrayInput } from "@/components/admin"

export const RoleCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" label="Nom" required />
        <TextInput source="description" label="Description" />
        <BooleanInput source="is_active" label="Actif" defaultValue={true} />
        <ReferenceArrayInput
          source="permissions"
          reference="permissions"
        >
          <AutocompleteArrayInput optionText="name" optionValue="id" />
        </ReferenceArrayInput>
      </SimpleForm>
    </Create>
  )
}
