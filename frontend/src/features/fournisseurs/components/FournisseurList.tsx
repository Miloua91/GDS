import { List, DataTable, TextField, EditButton, ShowButton, SearchInput } from "@/components/admin"

export const FournisseurList = () => {
  return (
    <List filters={[<SearchInput source="q" alwaysOn />]}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="code_fournisseur" label="Code" />
        <DataTable.Col source="raison_sociale" label="Raison Sociale" />
        <DataTable.Col source="sigle" label="Sigle" />
        <DataTable.Col source="type_fournisseur" label="Type" />
        <DataTable.Col source="wilaya" label="Wilaya" />
        <DataTable.Col source="telephone" label="Téléphone" />
        <DataTable.Col source="email" label="Email" />
        <DataTable.Col source="statut" label="Statut" />
        <DataTable.Col>
          <ShowButton />
          <EditButton />
        </DataTable.Col>
      </DataTable>
    </List>
  )
}
