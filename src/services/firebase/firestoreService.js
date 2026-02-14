import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestore } from '../../config/firebaseInit';

class FirestoreService {
  constructor() {
    this.firestore = null;
  }

  /**
   * Initialize the Firestore service
   */
  initialize() {
    if (!this.firestore) {
      this.firestore = getFirestore();
    }
  }

  /**
   * Convert Firestore Timestamp to serializable format
   * @param {Object} data - Data object with potential Timestamps
   * @returns {Object} Data with Timestamps converted to ISO strings
   */
  serializeTimestamps(data) {
    const serialized = { ...data };
    
    // Convert common timestamp fields
    if (serialized.createdAt?.toDate) {
      serialized.createdAt = serialized.createdAt.toDate().toISOString();
    }
    if (serialized.updatedAt?.toDate) {
      serialized.updatedAt = serialized.updatedAt.toDate().toISOString();
    }
    if (serialized.timestamp?.toDate) {
      serialized.timestamp = serialized.timestamp.toDate().toISOString();
    }
    
    return serialized;
  }

  // ==================== PATIENTS COLLECTION ====================

  /**
   * Create a new patient
   * @param {Object} patient - Patient data
   * @returns {Promise<Object>} Created patient with ID
   */
  async createPatient(patient) {
    try {
      this.initialize();

      const patientsRef = collection(this.firestore, 'patients');
      const docRef = await addDoc(patientsRef, {
        ...patient,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...patient,
      };
    } catch (error) {
      console.error('Create patient error:', error);
      throw new Error('Failed to create patient');
    }
  }

  /**
   * Update an existing patient
   * @param {string} id - Patient ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<void>}
   */
  async updatePatient(id, updates) {
    try {
      this.initialize();

      const patientRef = doc(this.firestore, 'patients', id);
      await updateDoc(patientRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update patient error:', error);
      throw new Error('Failed to update patient');
    }
  }

  /**
   * Delete a patient
   * @param {string} id - Patient ID
   * @returns {Promise<void>}
   */
  async deletePatient(id) {
    try {
      this.initialize();

      const patientRef = doc(this.firestore, 'patients', id);
      await deleteDoc(patientRef);
    } catch (error) {
      console.error('Delete patient error:', error);
      throw new Error('Failed to delete patient');
    }
  }

  /**
   * Get all patients
   * @returns {Promise<Array>} Array of patients
   */
  async getPatients() {
    try {
      this.initialize();

      const patientsRef = collection(this.firestore, 'patients');
      const snapshot = await getDocs(patientsRef);

      return snapshot.docs.map((doc) => 
        this.serializeTimestamps({
          id: doc.id,
          ...doc.data(),
        })
      );
    } catch (error) {
      console.error('Get patients error:', error);
      throw new Error('Failed to fetch patients');
    }
  }

  /**
   * Get a single patient by ID
   * @param {string} id - Patient ID
   * @returns {Promise<Object>} Patient data
   */
  async getPatient(id) {
    try {
      this.initialize();

      const patientRef = doc(this.firestore, 'patients', id);
      const patientDoc = await getDoc(patientRef);

      if (patientDoc.exists()) {
        return this.serializeTimestamps({
          id: patientDoc.id,
          ...patientDoc.data(),
        });
      } else {
        throw new Error('Patient not found');
      }
    } catch (error) {
      console.error('Get patient error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time patient updates
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToPatients(callback) {
    try {
      this.initialize();

      const patientsRef = collection(this.firestore, 'patients');

      return onSnapshot(
        patientsRef,
        (snapshot) => {
          const patients = snapshot.docs.map((doc) => 
            this.serializeTimestamps({
              id: doc.id,
              ...doc.data(),
            })
          );
          callback(patients);
        },
        (error) => {
          console.error('Subscribe to patients error:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Subscribe to patients error:', error);
      return () => {};
    }
  }

  // ==================== RECORDS COLLECTION ====================

  /**
   * Create a new record
   * @param {Object} record - Record data
   * @returns {Promise<Object>} Created record with ID
   */
  async createRecord(record) {
    try {
      this.initialize();

      const recordsRef = collection(this.firestore, 'records');
      const docRef = await addDoc(recordsRef, {
        ...record,
        timestamp: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...record,
      };
    } catch (error) {
      console.error('Create record error:', error);
      throw new Error('Failed to create record');
    }
  }

  /**
   * Delete a record
   * @param {string} id - Record ID
   * @returns {Promise<void>}
   */
  async deleteRecord(id) {
    try {
      this.initialize();

      const recordRef = doc(this.firestore, 'records', id);
      await deleteDoc(recordRef);
    } catch (error) {
      console.error('Delete record error:', error);
      throw new Error('Failed to delete record');
    }
  }

  /**
   * Get all records
   * @returns {Promise<Array>} Array of records ordered by timestamp
   */
  async getRecords() {
    try {
      this.initialize();

      const recordsRef = collection(this.firestore, 'records');
      const q = query(recordsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => 
        this.serializeTimestamps({
          id: doc.id,
          ...doc.data(),
        })
      );
    } catch (error) {
      console.error('Get records error:', error);
      throw new Error('Failed to fetch records');
    }
  }

  /**
   * Get a single record by ID
   * @param {string} id - Record ID
   * @returns {Promise<Object>} Record data
   */
  async getRecord(id) {
    try {
      this.initialize();

      const recordRef = doc(this.firestore, 'records', id);
      const recordDoc = await getDoc(recordRef);

      if (recordDoc.exists()) {
        return this.serializeTimestamps({
          id: recordDoc.id,
          ...recordDoc.data(),
        });
      } else {
        throw new Error('Record not found');
      }
    } catch (error) {
      console.error('Get record error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time record updates
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToRecords(callback) {
    try {
      this.initialize();

      const recordsRef = collection(this.firestore, 'records');
      const q = query(recordsRef, orderBy('timestamp', 'desc'));

      return onSnapshot(
        q,
        (snapshot) => {
          const records = snapshot.docs.map((doc) => 
            this.serializeTimestamps({
              id: doc.id,
              ...doc.data(),
            })
          );
          callback(records);
        },
        (error) => {
          console.error('Subscribe to records error:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Subscribe to records error:', error);
      return () => {};
    }
  }
}

// Export singleton instance
export default new FirestoreService();
