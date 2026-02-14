import { List, DataTable, TextField, NumberField, DateField, ReferenceField, EditButton, ShowButton, SearchInput } from "@/components/admin"

export const LotList = () => {
  return (
    <List filters={[<SearchInput source="q" alwaysOn />]}>
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="numero_lot" label="Numéro Lot" />
        <DataTable.Col source="produit" label="Produit">
          <ReferenceField source="produit" reference="produits" link="show">
            <TextField source="denomination" />
          </ReferenceField>
        </DataTable.Col>
        <DataTable.Col source="date_fabrication" label="Date Fabrication" />
        <DataTable.Col source="date_peremption" label="Date Péremption" />
        <DataTable.Col source="date_reception" label="Date Réception" />
        <DataTable.Col source="quantite_initiale" label="Qté Initiale" />
        <DataTable.Col source="quantite_actuelle" label="Qté Actuelle" />
        <DataTable.Col source="quantite_reservee" label="Qté Réservée" />
        <DataTable.Col source="statut" label="Statut" />
        <DataTable.Col>
          <ShowButton />
          <EditButton />
        </DataTable.Col>
      </DataTable>
    </List>
  )
}
