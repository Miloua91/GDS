import { Create, SimpleForm, TextInput, SelectInput } from "@/components/admin"

export const FournisseurCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="code_fournisseur" label="Code Fournisseur" required />
        <TextInput source="raison_sociale" label="Raison Sociale" required />
        <TextInput source="sigle" label="Sigle" />
        <SelectInput
          source="type_fournisseur"
          label="Type Fournisseur"
          choices={[
            { id: "FABRICANT", name: "Fabricant" },
            { id: "GROSSISTE", name: "Grossiste" },
            { id: "IMPORTATEUR", name: "Importateur" },
            { id: "ETABLISSEMENT_PUBLIC", name: "Etablissement Public" },
          ]}
          required
        />
        <TextInput source="categorie" label="Catégorie" />
        <TextInput source="adresse" label="Adresse" />
        <TextInput source="wilaya" label="Wilaya" />
        <TextInput source="commune" label="Commune" />
        <TextInput source="telephone" label="Téléphone" />
        <TextInput source="email" label="Email" />
        <TextInput source="nom_contact" label="Nom Contact" />
        <TextInput source="telephone_contact" label="Téléphone Contact" />
        <TextInput source="statut" label="Statut" defaultValue="ACTIF" />
      </SimpleForm>
    </Create>
  )
}
