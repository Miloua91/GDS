import { List, DataTable, TextField, EditButton, ShowButton, SearchInput } from "@/components/admin"

export const RoleList = () => {
  return (
    <List filters={[<SearchInput source="q" alwaysOn />]}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="name" label="Nom" />
        <DataTable.Col source="description" label="Description" />
        <DataTable.Col source="is_active" label="Actif" />
        <DataTable.Col>
          <ShowButton />
          <EditButton />
        </DataTable.Col>
      </DataTable>
    </List>
  )
}
