import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectTheme } from '../store/themeSlice';
import { getTheme } from '../theme/tokens';
import { useRBAC } from '../hooks/useRBAC';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getFirestore } from '../config/firebaseInit';
import rbacService, { ROLES } from '../services/rbac/rbacService';

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const themeMode = useSelector(selectTheme);
  const theme = getTheme(themeMode);
  const { canManageUsers } = useRBAC();

  useEffect(() => {
    if (!canManageUsers) {
      Alert.alert('Access Denied', 'You do not have permission to manage users');
      navigation.goBack();
      return;
    }
    loadUsers();
  }, [canManageUsers, navigation]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const firestore = getFirestore();
      const usersRef = collection(firestore, 'users');
      const snapshot = await getDocs(usersRef);
      
      const usersList = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      
      setUsers(usersList);
    } catch (error) {
      console.error('Load users error:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = (user) => {
    const roleOptions = rbacService.getAllRoles().map((role) => ({
      text: role.displayName,
      onPress: () => updateUserRole(user.uid, role.value),
    }));

    Alert.alert(
      'Change Role',
      `Select new role for ${user.email}`,
      [
        ...roleOptions,
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateUserRole = async (uid, newRole) => {
    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      
      Alert.alert('Success', 'User role updated successfully');
      loadUsers();
    } catch (error) {
      console.error('Update role error:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.email}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteUser(user.uid),
        },
      ]
    );
  };

  const deleteUser = async (uid) => {
    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', uid);
      await deleteDoc(userRef);
      
      Alert.alert('Success', 'User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return theme.danger;
      case ROLES.DOCTOR:
        return theme.primary;
      case ROLES.NURSE:
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };

  const renderUser = ({ item }) => (
    <View style={[styles.userCard, { backgroundColor: theme.surface }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userEmail, { color: theme.text }]}>{item.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(item.role) + '20' }]}>
          <Text style={[styles.roleText, { color: getRoleBadgeColor(item.role) }]}>
            {rbacService.getRoleDisplayName(item.role)}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={() => handleChangeRole(item)}
        >
          <Text style={styles.actionButtonText}>Change Role</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.danger }]}
          onPress={() => handleDeleteUser(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading users...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>User Management</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {users.length} user{users.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No users found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});
