import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      if (state.mode === 'light') {
        state.mode = 'dark';
      } else {
        state.mode = 'light';
      }
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

// Selectors
export const selectTheme = (state) => state.theme.mode;

export default themeSlice.reducer;
