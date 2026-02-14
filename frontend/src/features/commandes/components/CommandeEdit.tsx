import { Edit, SimpleForm, TextInput, ReferenceInput, SelectInput } from "@/components/admin"

export const CommandeEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" disabled />
        <TextInput source="numero_commande" label="Numéro Commande" required />
        <ReferenceInput source="service" reference="services" label="Service" allowEmpty>
          <SelectInput optionText="nom" optionValue="id" />
        </ReferenceInput>
        <SelectInput
          source="statut"
          label="Statut"
          choices={[
            { id: "BROUILLON", name: "Brouillon" },
            { id: "EN_ATTENTE", name: "En Attente" },
            { id: "VALIDEE", name: "Validée" },
            { id: "EN_COURS", name: "En Cours" },
            { id: "LIVREE", name: "Livrée" },
            { id: "ANNULEE", name: "Annulée" },
          ]}
        />
        <SelectInput
          source="priorite"
          label="Priorité"
          choices={[
            { id: "URGENTE", name: "Urgente" },
            { id: "HAUTE", name: "Haute" },
            { id: "NORMALE", name: "Normale" },
            { id: "BASSE", name: "Basse" },
          ]}
        />
      </SimpleForm>
    </Edit>
  )
}
