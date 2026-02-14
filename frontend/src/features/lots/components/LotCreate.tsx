import { Create, SimpleForm, TextInput, NumberInput, DateInput, ReferenceInput, SelectInput } from "@/components/admin"

export const LotCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <ReferenceInput source="produit" reference="produits" label="Produit" allowEmpty>
          <SelectInput optionText="denomination" optionValue="id" />
        </ReferenceInput>
        <TextInput source="numero_lot" label="Numéro Lot" required />
        <DateInput source="date_fabrication" label="Date Fabrication" />
        <DateInput source="date_peremption" label="Date Péremption" required />
        <DateInput source="date_reception" label="Date Réception" required />
        <NumberInput source="quantite_initiale" label="Quantité Initiale" required />
        <NumberInput source="quantite_actuelle" label="Quantité Actuelle" required />
        <NumberInput source="quantite_reservee" label="Quantité Réservée" defaultValue={0} />
        <TextInput source="statut" label="Statut" defaultValue="DISPONIBLE" />
        <NumberInput source="prix_unitaire_achat" label="Prix Unitaire Achat" />
      </SimpleForm>
    </Create>
  )
}
