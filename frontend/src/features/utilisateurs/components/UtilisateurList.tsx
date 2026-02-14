import { List, DataTable, TextField, EditButton, ShowButton, ReferenceField, SearchInput } from "@/components/admin"

export const UtilisateurList = () => {
  return (
    <List filters={[<SearchInput source="q" alwaysOn />]}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="username" label="Nom d'utilisateur" />
        <DataTable.Col source="first_name" label="Prénom" />
        <DataTable.Col source="last_name" label="Nom" />
        <DataTable.Col source="email" label="Email" />
        <DataTable.Col source="fonction" label="Fonction" />
        <DataTable.Col source="role" label="Rôle">
          <ReferenceField source="role" reference="roles" link="show">
            <TextField source="name" />
          </ReferenceField>
        </DataTable.Col>
        <DataTable.Col source="service" label="Service">
          <ReferenceField source="service" reference="services" link="show">
            <TextField source="nom" />
          </ReferenceField>
        </DataTable.Col>
        <DataTable.Col source="is_active" label="Actif" />
        <DataTable.Col>
          <ShowButton />
          <EditButton />
        </DataTable.Col>
      </DataTable>
    </List>
  )
}
