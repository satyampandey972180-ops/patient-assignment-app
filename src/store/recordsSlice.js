import { createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import firestoreService from '../services/firebase/firestoreService';
import storageService from '../services/storage/storageService';

// Async thunks for Firestore and Storage operations
export const loadRecordsFromFirestore = createAsyncThunk(
  'records/loadFromFirestore',
  async (_, { rejectWithValue }) => {
    try {
      const records = await firestoreService.getRecords();
      return records;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addRecordAsync = createAsyncThunk(
  'records/addAsync',
  async (record, { rejectWithValue }) => {
    try {
      // Upload image to storage first
      let imageKey = record.imageUri;
      if (record.imageUri && !record.imageUri.startsWith('image_')) {
        imageKey = await storageService.uploadImageWithRetry(
          record.imageUri,
          record.patientId
        );
      }

      // Create record in Firestore with image key
      const recordData = {
        ...record,
        imageUri: imageKey, // Store the image key instead of URI
      };

      const newRecord = await firestoreService.createRecord(recordData);
      return newRecord;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRecordAsync = createAsyncThunk(
  'records/deleteAsync',
  async (record, { rejectWithValue }) => {
    try {
      // Delete image from storage if it exists
      if (record.imageUri && record.imageUri.startsWith('image_')) {
        await storageService.deleteImage(record.imageUri);
      }

      // Delete record from Firestore
      await firestoreService.deleteRecord(record.id);
      return record.id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  records: [],
  loading: false,
  error: null,
};

// Simple UUID generator for local fallback
function generateId() {
  return 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    // Local actions (backward compatibility)
    addRecord: (state, action) => {
      const record = action.payload;
      const newRecord = {
        ...record,
        id: generateId(),
        timestamp: new Date().toISOString(),
      };
      state.records.push(newRecord);
    },
    deleteRecord: (state, action) => {
      const id = action.payload;
      state.records = state.records.filter((r) => r.id !== id);
    },
    loadRecords: (state, action) => {
      state.records = action.payload;
    },
    setRecordsFromSync: (state, action) => {
      state.records = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load records
    builder
      .addCase(loadRecordsFromFirestore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadRecordsFromFirestore.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
        state.error = null;
      })
      .addCase(loadRecordsFromFirestore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add record
    builder
      .addCase(addRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRecordAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.records.push(action.payload);
        state.error = null;
      })
      .addCase(addRecordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete record
    builder
      .addCase(deleteRecordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRecordAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter((r) => r.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteRecordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addRecord,
  deleteRecord,
  loadRecords,
  setRecordsFromSync,
  clearError,
} = recordsSlice.actions;

// Base selector
const selectRecordsState = (state) => state.records.records;

// Memoized selectors
export const selectAllRecords = createSelector(
  [selectRecordsState],
  (records) => {
    // Sort by timestamp, newest first
    const sorted = [...records];
    sorted.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    return sorted;
  }
);

export const selectRecordsByPatient = createSelector(
  [selectRecordsState, (state, patientId) => patientId],
  (records, patientId) => {
    return records.filter((r) => r.patientId === patientId);
  }
);

export const selectRecentUploadsCount = createSelector(
  [selectRecordsState],
  (records) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let count = 0;
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const recordDate = new Date(record.timestamp);
      if (recordDate >= sevenDaysAgo) {
        count++;
      }
    }
    
    return count;
  }
);

export const selectRecordsLoading = (state) => state.records.loading;
export const selectRecordsError = (state) => state.records.error;

export default recordsSlice.reducer;
