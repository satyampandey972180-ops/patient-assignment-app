// Role-Based Access Control Service

// Define user roles
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
};

// Define permissions
export const PERMISSIONS = {
  // Patient permissions
  CREATE_PATIENT: 'create_patient',
  READ_PATIENT: 'read_patient',
  UPDATE_PATIENT: 'update_patient',
  DELETE_PATIENT: 'delete_patient',

  // Record permissions
  CREATE_RECORD: 'create_record',
  READ_RECORD: 'read_record',
  DELETE_RECORD: 'delete_record',

  // User management permissions
  MANAGE_USERS: 'manage_users',
};

// Map roles to their permissions
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_PATIENT,
    PERMISSIONS.READ_PATIENT,
    PERMISSIONS.UPDATE_PATIENT,
    PERMISSIONS.DELETE_PATIENT,
    PERMISSIONS.CREATE_RECORD,
    PERMISSIONS.READ_RECORD,
    PERMISSIONS.DELETE_RECORD,
    PERMISSIONS.MANAGE_USERS,
  ],
  [ROLES.DOCTOR]: [
    PERMISSIONS.CREATE_PATIENT,
    PERMISSIONS.READ_PATIENT,
    PERMISSIONS.UPDATE_PATIENT,
    PERMISSIONS.DELETE_PATIENT,
    PERMISSIONS.CREATE_RECORD,
    PERMISSIONS.READ_RECORD,
    PERMISSIONS.DELETE_RECORD,
  ],
  [ROLES.NURSE]: [
    PERMISSIONS.READ_PATIENT,
    PERMISSIONS.CREATE_RECORD,
    PERMISSIONS.READ_RECORD,
  ],
};

class RBACService {
  /**
   * Check if a role has a specific permission
   * @param {string} userRole - User's role
   * @param {string} permission - Permission to check
   * @returns {boolean} True if role has permission
   */
  hasPermission(userRole, permission) {
    if (!userRole) {
      return false;
    }

    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
  }

  /**
   * Check if user can create patients
   * @param {string} userRole - User's role
   * @returns {boolean}
   */
  canCreatePatient(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.CREATE_PATIENT);
  }

  /**
   * Check if user can read patients
   * @param {string} userRole - User's role
   * @returns {boolean}
   */
  canReadPatient(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.READ_PATIENT);
  }

  /**
   * Check if user can update patients
   * @param {string} userRole - User's role
   * @returns {boolean}
   */
  canUpdatePatient(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.UPDATE_PATIENT);
  }

  /**
   * Check if user can delete patients
   * @param {string} userRole - User's role
   * @returns {boolean}
   */
  canDeletePatient(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.DELETE_PATIENT);
  }

  /**
   * Check if user can create records
   * @param {string} userRole - User's role
   * @returns {boolean}
   */
  canCreateRecord(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.CREATE_RECORD);
  }

  /**
   * Check if user can read records
   * @param {string} userRole - User's role
   * @returns {boolean}
   */
  canReadRecord(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.READ_RECORD);
  }

  /**
   * Check if user can delete records
   * @param {string} userRole - User's role
   * @returns {boolean}
   */
  canDeleteRecord(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.DELETE_RECORD);
  }

  /**
   * Check if user can manage other users
   * @param {string} userRole - User's role
   * @returns {boolean}
   */
  canManageUsers(userRole) {
    return this.hasPermission(userRole, PERMISSIONS.MANAGE_USERS);
  }

  /**
   * Get all permissions for a role
   * @param {string} userRole - User's role
   * @returns {Array<string>} Array of permissions
   */
  getRolePermissions(userRole) {
    return ROLE_PERMISSIONS[userRole] || [];
  }

  /**
   * Check if a role is valid
   * @param {string} role - Role to validate
   * @returns {boolean}
   */
  isValidRole(role) {
    return Object.values(ROLES).includes(role);
  }

  /**
   * Get role display name
   * @param {string} role - Role key
   * @returns {string} Display name
   */
  getRoleDisplayName(role) {
    const displayNames = {
      [ROLES.ADMIN]: 'Administrator',
      [ROLES.DOCTOR]: 'Doctor',
      [ROLES.NURSE]: 'Nurse',
    };
    return displayNames[role] || role;
  }

  /**
   * Get all available roles
   * @returns {Array<Object>} Array of role objects
   */
  getAllRoles() {
    return Object.entries(ROLES).map(([key, value]) => ({
      key,
      value,
      displayName: this.getRoleDisplayName(value),
    }));
  }
}

// Export singleton instance
export default new RBACService();
