import { List, DataTable, TextField, NumberField, EditButton, ShowButton, SearchInput } from "@/components/admin"

export const ServiceList = () => {
  return (
    <List filters={[<SearchInput source="q" alwaysOn />]}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="code_service" label="Code" />
        <DataTable.Col source="nom" label="Nom" />
        <DataTable.Col source="type_service" label="Type" />
        <DataTable.Col source="specialite" label="Spécialité" />
        <DataTable.Col source="nombre_lits" label="Nombre Lits" />
        <DataTable.Col source="actif" label="Actif" />
        <DataTable.Col>
          <ShowButton />
          <EditButton />
        </DataTable.Col>
      </DataTable>
    </List>
  )
}
