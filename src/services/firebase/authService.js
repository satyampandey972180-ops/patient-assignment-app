import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  applyActionCode,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, getFirestore } from '../../config/firebaseInit';

class AuthService {
  constructor() {
    this.auth = null;
    this.firestore = null;
  }

  /**
   * Initialize the auth service with Firebase instances
   */
  initialize() {
    if (!this.auth || !this.firestore) {
      this.auth = getAuth();
      this.firestore = getFirestore();
    }
  }

  /**
   * Sign up a new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (admin, doctor, nurse)
   * @returns {Promise<Object>} User object with profile
   */
  async signup(email, password, role = 'nurse') {
    try {
      this.initialize();

      console.log('🔵 Starting signup for:', email);

      // Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      
      console.log('✅ User created with UID:', userCredential.user.uid);

      // Send email verification
      await sendEmailVerification(userCredential.user);
      console.log('✅ Verification email sent to:', email);
      console.log('📧 Check your inbox (and spam folder) for verification email');

      // Create user profile in Firestore
      await this.createUserProfile(userCredential.user.uid, email, role);
      console.log('✅ User profile created in Firestore');

      // Get the complete user profile
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      console.log('✅ User profile retrieved');

      return {
        user: userCredential.user,
        profile: userProfile,
      };
    } catch (error) {
      console.error('❌ Signup error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object with profile
   */
  async login(email, password) {
    try {
      this.initialize();

      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Retrieve user profile from Firestore
      const userProfile = await this.getUserProfile(userCredential.user.uid);

      return {
        user: userCredential.user,
        profile: userProfile,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      this.initialize();
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Create user profile in Firestore
   * @param {string} uid - User ID
   * @param {string} email - User email
   * @param {string} role - User role
   * @returns {Promise<void>}
   */
  async createUserProfile(uid, email, role) {
    try {
      this.initialize();

      const userRef = doc(this.firestore, 'users', uid);
      await setDoc(userRef, {
        email,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Create user profile error:', error);
      throw error;
    }
  }

  /**
   * Get user profile from Firestore
   * @param {string} uid - User ID
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(uid) {
    try {
      this.initialize();

      const userRef = doc(this.firestore, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Convert Firestore Timestamps to serializable format
        return {
          uid,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        };
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function to handle auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    this.initialize();

    return onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          const userProfile = await this.getUserProfile(user.uid);
          callback({ user, profile: userProfile });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          callback({ user, profile: null });
        }
      } else {
        callback(null);
      }
    });
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} Current user or null
   */
  getCurrentUser() {
    this.initialize();
    return this.auth.currentUser;
  }

  /**
   * Send email verification to current user
   * @returns {Promise<void>}
   */
  async sendVerificationEmail() {
    try {
      this.initialize();
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      if (user.emailVerified) {
        throw new Error('Email is already verified');
      }

      await sendEmailVerification(user);
    } catch (error) {
      console.error('Send verification email error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if current user's email is verified
   * @returns {boolean} True if email is verified
   */
  isEmailVerified() {
    this.initialize();
    const user = this.auth.currentUser;
    return user ? user.emailVerified : false;
  }

  /**
   * Reload current user to get latest email verification status
   * @returns {Promise<void>}
   */
  async reloadUser() {
    try {
      this.initialize();
      const user = this.auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await user.reload();
    } catch (error) {
      console.error('Reload user error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify email with action code
   * @param {string} actionCode - Action code from email link
   * @returns {Promise<void>}
   */
  async verifyEmail(actionCode) {
    try {
      this.initialize();
      await applyActionCode(this.auth, actionCode);
    } catch (error) {
      console.error('Verify email error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle Firebase authentication errors
   * @param {Error} error - Firebase error
   * @returns {Error} Formatted error
   */
  handleAuthError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password is too weak (minimum 6 characters)',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
    };

    const message = errorMessages[error.code] || error.message || 'Authentication failed';
    return new Error(message);
  }
}

// Export singleton instance
export default new AuthService();
