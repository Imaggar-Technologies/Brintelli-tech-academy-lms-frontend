import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { adminRoles, adminRoleOptions } from "../config/adminRoles";

const AdminAccessContext = createContext();

const isValidRole = (value) => Boolean(value && adminRoles[value]);

const matchPermission = (permissions, pageId) => {
  if (!pageId) return true;
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes("*")) return true;
  return permissions.some((permission) => {
    if (permission.endsWith("*")) {
      const prefix = permission.slice(0, -1);
      return pageId.startsWith(prefix);
    }
    return permission === pageId;
  });
};

const getInitialRole = () => {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("brintelli-admin-role");
    if (isValidRole(stored)) {
      return stored;
    }
  }
  return "programManager";
};

export const AdminAccessProvider = ({ children }) => {
  const [role, setRoleState] = useState(getInitialRole);
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("brintelli-admin-role", role);
    }
  }, [role]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    if (isValidRole(roleParam)) {
      setRoleState(roleParam);
    }
  }, [location.search]);

  const setRole = (nextRole) => {
    const safeRole = isValidRole(nextRole) ? nextRole : "programManager";
    setRoleState(safeRole);
  };

  const value = useMemo(() => {
    const roleConfig = adminRoles[role] ?? adminRoles.programManager;
    const permissions = roleConfig.permissions ?? [];
    const navSections = roleConfig.navSections ?? ["*"];

    return {
      role,
      roleLabel: roleConfig.label,
      setRole,
      roleOptions: adminRoleOptions,
      navSections,
      canAccess: (pageId) => matchPermission(permissions, pageId),
    };
  }, [role]);

  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>;
};

export const useAdminAccess = () => {
  const context = useContext(AdminAccessContext);
  if (!context) {
    throw new Error("useAdminAccess must be used within an AdminAccessProvider");
  }
  return context;
};
