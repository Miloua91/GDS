import { List, DataTable, TextField, NumberField, DateField, ReferenceField, EditButton, ShowButton, SearchInput } from "@/components/admin"

export const MouvementList = () => {
  return (
    <List filters={[<SearchInput source="q" alwaysOn />]}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="numero_mouvement" label="Numéro Mouvement" />
        <DataTable.Col source="produit" label="Produit">
          <ReferenceField source="produit" reference="produits" link="show">
            <TextField source="denomination" />
          </ReferenceField>
        </DataTable.Col>
        <DataTable.Col source="type_mouvement" label="Type" />
        <DataTable.Col source="quantite" label="Quantité" />
        <DataTable.Col source="date_mouvement" label="Date" />
        <DataTable.Col>
          <ShowButton />
          <EditButton />
        </DataTable.Col>
      </DataTable>
    </List>
  )
}
