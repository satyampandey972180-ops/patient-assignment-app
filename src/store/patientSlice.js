import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firestoreService from '../services/firebase/firestoreService';

// Async thunks for Firestore operations
export const loadPatientsFromFirestore = createAsyncThunk(
  'patients/loadFromFirestore',
  async (_, { rejectWithValue }) => {
    try {
      const patients = await firestoreService.getPatients();
      return patients;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addPatientAsync = createAsyncThunk(
  'patients/addAsync',
  async (patient, { rejectWithValue }) => {
    try {
      const newPatient = await firestoreService.createPatient(patient);
      return newPatient;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePatientAsync = createAsyncThunk(
  'patients/updateAsync',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      await firestoreService.updatePatient(id, updates);
      return { id, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePatientAsync = createAsyncThunk(
  'patients/deleteAsync',
  async (id, { rejectWithValue }) => {
    try {
      await firestoreService.deletePatient(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  patients: [],
  loading: false,
  error: null,
  syncEnabled: false,
};

// Simple UUID generator for local fallback
function generateId() {
  return 'patient_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    // Local actions (backward compatibility)
    addPatient: (state, action) => {
      const patient = action.payload;
      const newPatient = {
        ...patient,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.patients.push(newPatient);
    },
    updatePatient: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.patients.findIndex((p) => p.id === id);
      
      if (index !== -1) {
        state.patients[index] = {
          ...state.patients[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deletePatient: (state, action) => {
      const id = action.payload;
      state.patients = state.patients.filter((p) => p.id !== id);
    },
    loadPatients: (state, action) => {
      state.patients = action.payload;
    },
    setPatientsFromSync: (state, action) => {
      state.patients = action.payload;
      state.syncEnabled = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load patients
    builder
      .addCase(loadPatientsFromFirestore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPatientsFromFirestore.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
        state.error = null;
      })
      .addCase(loadPatientsFromFirestore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add patient
    builder
      .addCase(addPatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPatientAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.push(action.payload);
        state.error = null;
      })
      .addCase(addPatientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update patient
    builder
      .addCase(updatePatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatientAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updates } = action.payload;
        const index = state.patients.findIndex((p) => p.id === id);
        if (index !== -1) {
          state.patients[index] = {
            ...state.patients[index],
            ...updates,
          };
        }
        state.error = null;
      })
      .addCase(updatePatientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete patient
    builder
      .addCase(deletePatientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatientAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = state.patients.filter((p) => p.id !== action.payload);
        state.error = null;
      })
      .addCase(deletePatientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addPatient,
  updatePatient,
  deletePatient,
  loadPatients,
  setPatientsFromSync,
  clearError,
} = patientSlice.actions;

// Selectors
export const selectAllPatients = (state) => state.patients.patients;

export const selectPatientById = (state, id) => {
  return state.patients.patients.find((p) => p.id === id);
};

export const selectTotalPatients = (state) => {
  return state.patients.patients.length;
};

export const selectPatientsLoading = (state) => state.patients.loading;
export const selectPatientsError = (state) => state.patients.error;
export const selectSyncEnabled = (state) => state.patients.syncEnabled;

export default patientSlice.reducer;
