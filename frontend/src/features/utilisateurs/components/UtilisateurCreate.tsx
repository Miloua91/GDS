import { Create, SimpleForm, TextInput, BooleanInput, ReferenceInput, SelectInput } from "@/components/admin"

export const UtilisateurCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="username" label="Nom d'utilisateur" required />
        <TextInput source="password" label="Mot de passe" type="password" required />
        <TextInput source="email" label="Email" type="email" />
        <TextInput source="first_name" label="Prénom" />
        <TextInput source="last_name" label="Nom" />
        <SelectInput
          source="fonction"
          label="Fonction"
          choices={[
            { id: "ADMIN", name: "Administrateur" },
            { id: "PHARMACIEN", name: "Pharmacien" },
            { id: "TECHNICIEN", name: "Technicien" },
            { id: "MEDECIN", name: "Médecin" },
            { id: "RESPONSABLE", name: "Responsable" },
            { id: "CONSULTANT", name: "Consultant" },
          ]}
        />
        <TextInput source="specialite" label="Spécialité" />
        <TextInput source="telephone" label="Téléphone" />
        <TextInput source="numero_ordre" label="Numéro Ordre" />
        <ReferenceInput source="role" reference="roles" label="Rôle" allowEmpty>
          <SelectInput optionText="name" optionValue="id" />
        </ReferenceInput>
        <ReferenceInput source="service" reference="services" label="Service" allowEmpty>
          <SelectInput optionText="nom" optionValue="id" />
        </ReferenceInput>
        <BooleanInput source="is_active" label="Actif" defaultValue={true} />
        <BooleanInput source="is_staff" label="Staff" defaultValue={false} />
      </SimpleForm>
    </Create>
  )
}
