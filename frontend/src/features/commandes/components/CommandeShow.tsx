import { Show, SimpleShowLayout, TextField, ReferenceField, DateField } from "@/components/admin"

export const CommandeShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="numero_commande" label="Numéro Commande" />
        <ReferenceField source="service" reference="services" link="show">
          <TextField source="nom" label="Service" />
        </ReferenceField>
        <TextField source="statut" label="Statut" />
        <TextField source="priorite" label="Priorité" />
        <DateField source="date_demande" label="Date Demande" />
      </SimpleShowLayout>
    </Show>
  )
}
