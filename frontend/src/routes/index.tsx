import { createFileRoute } from '@tanstack/react-router'
import { Admin } from '@/components/admin'
import { Resource, CustomRoutes } from 'ra-core'
import { Route as CustomRoute } from 'react-router'
import { authProvider } from '@/lib/authProvider'
import { usePermissions } from '@/components/admin/can'
import { dataProvider } from '@/lib/dataProvider'
import { i18nProvider } from '@/lib/i18nProvider'
import { QueryProvider } from '@/integrations/tanstack-query/root-provider'
import {
  Package,
  Box,
  ArrowRightLeft,
  Truck,
  ShoppingCart,
  Building2,
  Users,
  UserCog,
  Shield,
} from 'lucide-react'

import { Dashboard } from '@/features/dashboard/components'
import { StockList } from '@/features/stock/components'
import { JournalList } from '@/features/journal/components'
import {
  ProduitList,
  ProduitShow,
  ProduitCreate,
  ProduitEdit,
} from '@/features/produits/components'
import {
  LotList,
  LotShow,
  LotCreate,
  LotEdit,
  StockReception,
} from '@/features/lots/components'
import {
  MouvementList,
  MouvementShow,
  MouvementCreate,
  MouvementEdit,
} from '@/features/mouvements/components'
import {
  FournisseurList,
  FournisseurShow,
  FournisseurCreate,
  FournisseurEdit,
} from '@/features/fournisseurs/components'
import {
  MagasinList,
  MagasinShow,
  MagasinCreate,
  MagasinEdit,
} from '@/features/magasins/components'
import {
  ServiceList,
  ServiceShow,
  ServiceCreate,
  ServiceEdit,
} from '@/features/services/components'
import {
  CommandeList,
  CommandeShow,
  CommandeCreate,
  CommandeEdit,
  CommandeRapide,
} from '@/features/commandes/components'
import {
  UtilisateurList,
  UtilisateurShow,
  UtilisateurCreate,
  UtilisateurEdit,
} from '@/features/utilisateurs/components'
import {
  RoleList,
  RoleShow,
  RoleCreate,
  RoleEdit,
} from '@/features/roles/components'

export const Route = createFileRoute('/')({ component: App })

export default function App() {
  const permissions = usePermissions()

  return (
    <QueryProvider>
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        requireAuth
      >
        <CustomRoutes>
          {permissions.can_view_dashboard && (
            <CustomRoute path="/dashboard" element={<Dashboard />} />
          )}
          {permissions.can_add_commandes && (
            <CustomRoute
              path="/commandes-rapides"
              element={<CommandeRapide />}
            />
          )}
          {permissions.can_add_lots && (
            <CustomRoute path="/stock-reception" element={<StockReception />} />
          )}
          {permissions.can_view_journals && (
            <CustomRoute path="/journals" element={<JournalList />} />
          )}
          {(permissions.can_view_lots || permissions.can_view_produits) && (
            <CustomRoute path="/stock" element={<StockList />} />
          )}
        </CustomRoutes>
        {permissions.can_view_produits && (
          <Resource
            name="produits"
            icon={Package}
            list={ProduitList}
            show={ProduitShow}
            create={permissions.can_add_produits ? ProduitCreate : undefined}
            edit={permissions.can_change_produits ? ProduitEdit : undefined}
          />
        )}
        {permissions.can_view_lots && (
          <Resource
            name="lots"
            icon={Box}
            list={LotList}
            show={LotShow}
            create={permissions.can_add_lots ? LotCreate : undefined}
            edit={permissions.can_change_lots ? LotEdit : undefined}
          />
        )}
        {permissions.can_view_mouvements && (
          <Resource
            name="mouvements"
            icon={ArrowRightLeft}
            list={MouvementList}
            show={MouvementShow}
            create={
              permissions.can_add_mouvements ? MouvementCreate : undefined
            }
            edit={permissions.can_change_mouvements ? MouvementEdit : undefined}
          />
        )}
        {permissions.can_view_fournisseurs && (
          <Resource
            name="fournisseurs"
            icon={Truck}
            list={FournisseurList}
            show={FournisseurShow}
            create={
              permissions.can_add_fournisseurs ? FournisseurCreate : undefined
            }
            edit={
              permissions.can_change_fournisseurs ? FournisseurEdit : undefined
            }
          />
        )}
        {permissions.can_view_commandes && (
          <Resource
            name="commandes"
            icon={ShoppingCart}
            list={CommandeList}
            show={CommandeShow}
            create={permissions.can_add_commandes ? CommandeCreate : undefined}
            edit={permissions.can_change_commandes ? CommandeEdit : undefined}
          />
        )}
        {permissions.can_view_magasins && (
          <Resource
            name="magasins"
            icon={Building2}
            list={MagasinList}
            show={MagasinShow}
            create={permissions.can_add_magasins ? MagasinCreate : undefined}
            edit={permissions.can_change_magasins ? MagasinEdit : undefined}
          />
        )}
        {permissions.can_view_services && (
          <Resource
            name="services"
            icon={Users}
            list={ServiceList}
            show={ServiceShow}
            create={permissions.can_add_services ? ServiceCreate : undefined}
            edit={permissions.can_change_services ? ServiceEdit : undefined}
          />
        )}
        {permissions.can_view_utilisateurs && (
          <Resource
            name="utilisateurs"
            icon={UserCog}
            list={UtilisateurList}
            show={UtilisateurShow}
            create={
              permissions.can_add_utilisateurs ? UtilisateurCreate : undefined
            }
            edit={
              permissions.can_change_utilisateurs ? UtilisateurEdit : undefined
            }
          />
        )}
        {permissions.can_view_roles && (
          <Resource
            name="roles"
            icon={Shield}
            list={RoleList}
            show={RoleShow}
            create={permissions.can_add_roles ? RoleCreate : undefined}
            edit={permissions.can_change_roles ? RoleEdit : undefined}
          />
        )}
      </Admin>
    </QueryProvider>
  )
}
