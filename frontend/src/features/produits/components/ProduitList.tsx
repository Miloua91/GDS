import { List, DataTable, TextField, NumberField, DateField, EditButton, ShowButton, SearchInput } from "@/components/admin"

export const ProduitList = () => {
  return (
    <List filters={[<SearchInput source="q" alwaysOn />]}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="code_national" label="Code National" />
        <DataTable.Col source="code_interne" label="Code Interne" />
        <DataTable.Col source="denomination" label="Dénomination" />
        <DataTable.Col source="forme_pharmaceutique" label="Forme" />
        <DataTable.Col source="dosage" label="Dosage" />
        <DataTable.Col source="dci" label="DCI" />
        <DataTable.Col source="type_produit" label="Type" />
        <DataTable.Col source="categorie_surveillance" label="Catégorie" />
        <DataTable.Col source="statut" label="Statut" />
        <DataTable.Col>
          <ShowButton />
          <EditButton />
        </DataTable.Col>
      </DataTable>
    </List>
  )
}
