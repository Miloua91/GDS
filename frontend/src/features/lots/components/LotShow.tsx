import { Show, SimpleShowLayout, TextField, NumberField, DateField, ReferenceField } from "@/components/admin"

export const LotShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="numero_lot" label="Numéro Lot" />
        <ReferenceField source="produit" reference="produits" link="show">
          <TextField source="denomination" label="Produit" />
        </ReferenceField>
        <ReferenceField source="magasin" reference="magasins" link="show">
          <TextField source="nom" label="Magasin" />
        </ReferenceField>
        <DateField source="date_fabrication" label="Date Fabrication" />
        <DateField source="date_peremption" label="Date Péremption" />
        <DateField source="date_reception" label="Date Réception" />
        <NumberField source="quantite_initiale" label="Quantité Initiale" />
        <NumberField source="quantite_actuelle" label="Quantité Actuelle" />
        <NumberField source="quantite_reservee" label="Quantité Réservée" />
        <TextField source="statut" label="Statut" />
        <NumberField source="prix_unitaire_achat" label="Prix Unitaire Achat" />
      </SimpleShowLayout>
    </Show>
  )
}
