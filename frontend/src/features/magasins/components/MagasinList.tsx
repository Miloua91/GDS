import { List, DataTable, TextField, EditButton, ShowButton, SearchInput } from "@/components/admin"

export const MagasinList = () => {
  return (
    <List filters={[<SearchInput source="q" alwaysOn />]}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="code_magasin" label="Code" />
        <DataTable.Col source="nom" label="Nom" />
        <DataTable.Col source="type_magasin" label="Type" />
        <DataTable.Col source="batiment" label="Bâtiment" />
        <DataTable.Col source="etage" label="Etage" />
        <DataTable.Col source="niveau_securite" label="Niveau Sécurité" />
        <DataTable.Col source="actif" label="Actif" />
        <DataTable.Col>
          <ShowButton />
          <EditButton />
        </DataTable.Col>
      </DataTable>
    </List>
  )
}
