import { useSelector } from 'react-redux';
import { selectRole } from '../store/authSlice';
import rbacService from '../services/rbac/rbacService';

/**
 * Custom hook for Role-Based Access Control
 * @returns {Object} RBAC utilities
 */
export const useRBAC = () => {
  const userRole = useSelector(selectRole);

  return {
    role: userRole,
    canCreatePatient: rbacService.canCreatePatient(userRole),
    canReadPatient: rbacService.canReadPatient(userRole),
    canUpdatePatient: rbacService.canUpdatePatient(userRole),
    canDeletePatient: rbacService.canDeletePatient(userRole),
    canCreateRecord: rbacService.canCreateRecord(userRole),
    canReadRecord: rbacService.canReadRecord(userRole),
    canDeleteRecord: rbacService.canDeleteRecord(userRole),
    canManageUsers: rbacService.canManageUsers(userRole),
    hasPermission: (permission) => rbacService.hasPermission(userRole, permission),
  };
};

export default useRBAC;
