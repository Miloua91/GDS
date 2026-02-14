import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'

type Permission =
  | 'can_view_produits'
  | 'can_add_produits'
  | 'can_change_produits'
  | 'can_delete_produits'
  | 'can_view_lots'
  | 'can_add_lots'
  | 'can_change_lots'
  | 'can_delete_lots'
  | 'can_view_mouvements'
  | 'can_add_mouvements'
  | 'can_change_mouvements'
  | 'can_delete_mouvements'
  | 'can_view_commandes'
  | 'can_add_commandes'
  | 'can_change_commandes'
  | 'can_delete_commandes'
  | 'can_view_fournisseurs'
  | 'can_add_fournisseurs'
  | 'can_change_fournisseurs'
  | 'can_delete_fournisseurs'
  | 'can_view_magasins'
  | 'can_add_magasins'
  | 'can_change_magasins'
  | 'can_delete_magasins'
  | 'can_view_services'
  | 'can_add_services'
  | 'can_change_services'
  | 'can_delete_services'
  | 'can_view_utilisateurs'
  | 'can_add_utilisateurs'
  | 'can_change_utilisateurs'
  | 'can_delete_utilisateurs'
  | 'can_view_roles'
  | 'can_add_roles'
  | 'can_change_roles'
  | 'can_delete_roles'
  | 'can_view_dashboard'
  | 'can_view_journals'

interface CanProps {
  permission: Permission
  children: ReactNode
}

export const getPermissions = (): Record<string, boolean> => {
  const permissions = localStorage.getItem('permissions')
  if (permissions) {
    return JSON.parse(permissions)
  }
  return {}
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => getPermissions())

  useEffect(() => {
    const handleUpdate = () => {
      setPermissions(getPermissions())
    }

    window.addEventListener('permissions-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    
    return () => {
      window.removeEventListener('permissions-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return permissions
}

export const hasPermission = (permission: Permission): boolean => {
  const permissions = getPermissions()
  return permissions[permission] === true
}

export const Can = ({ permission, children }: CanProps) => {
  if (!hasPermission(permission)) {
    return null
  }
  return <>{children}</>
}
