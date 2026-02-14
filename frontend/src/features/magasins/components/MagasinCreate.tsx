import { Create, SimpleForm, TextInput, BooleanInput, SelectInput } from "@/components/admin"

export const MagasinCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="code_magasin" label="Code Magasin" required />
        <TextInput source="nom" label="Nom" required />
        <SelectInput
          source="type_magasin"
          label="Type Magasin"
          choices={[
            { id: "PRINCIPAL", name: "Principal" },
            { id: "PSYCHOTROPES", name: "Psychotropes" },
            { id: "CHAINE_FROID", name: "Chaine Froid" },
            { id: "CONSOMMABLES", name: "Consommables" },
          ]}
          required
        />
        <TextInput source="batiment" label="Bâtiment" />
        <TextInput source="etage" label="Etage" />
        <TextInput source="niveau_securite" label="Niveau Sécurité" defaultValue="STANDARD" />
        <BooleanInput source="actif" label="Actif" defaultValue={true} />
      </SimpleForm>
    </Create>
  )
}
