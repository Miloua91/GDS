import { Show, SimpleShowLayout, TextField, NumberField, DateField, ReferenceField } from "@/components/admin"

export const MouvementShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="numero_mouvement" label="Numéro Mouvement" />
        <ReferenceField source="produit" reference="produits" link="show">
          <TextField source="denomination" label="Produit" />
        </ReferenceField>
        <ReferenceField source="lot" reference="lots" link="show">
          <TextField source="numero_lot" label="Lot" />
        </ReferenceField>
        <TextField source="type_mouvement" label="Type Mouvement" />
        <NumberField source="quantite" label="Quantité" />
        <ReferenceField source="magasin_source" reference="magasins" link="show">
          <TextField source="nom" label="Magasin Source" />
        </ReferenceField>
        <ReferenceField source="magasin_destination" reference="magasins" link="show">
          <TextField source="nom" label="Magasin Destination" />
        </ReferenceField>
        <DateField source="date_mouvement" label="Date Mouvement" />
      </SimpleShowLayout>
    </Show>
  )
}
