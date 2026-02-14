import { Create, SimpleForm, TextInput, NumberInput, ReferenceInput, SelectInput } from "@/components/admin"

export const MouvementCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="numero_mouvement" label="Numéro Mouvement" required />
        <ReferenceInput source="produit" reference="produits" label="Produit" allowEmpty>
          <SelectInput optionText="denomination" optionValue="id" />
        </ReferenceInput>
        <ReferenceInput source="lot" reference="lots" label="Lot" allowEmpty>
          <SelectInput optionText="numero_lot" optionValue="id" />
        </ReferenceInput>
        <SelectInput
          source="type_mouvement"
          label="Type Mouvement"
          choices={[
            { id: "ENTREE_ACHAT", name: "Entrée Achat" },
            { id: "SORTIE_SERVICE", name: "Sortie Service" },
            { id: "TRANSFERT", name: "Transfert" },
            { id: "PERIME", name: "Périmé" },
            { id: "AJUSTEMENT", name: "Ajustement" },
          ]}
          required
        />
        <NumberInput source="quantite" label="Quantité" required />
        <ReferenceInput source="magasin_source" reference="magasins" label="Magasin Source" allowEmpty>
          <SelectInput optionText="nom" optionValue="id" />
        </ReferenceInput>
        <ReferenceInput source="magasin_destination" reference="magasins" label="Magasin Destination" allowEmpty>
          <SelectInput optionText="nom" optionValue="id" />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  )
}
