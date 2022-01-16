import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UiState = {
  prefersReducedMotion: boolean;
};

const initialState: UiState = {
  prefersReducedMotion: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setPrefersReducedMotion: (state, action: PayloadAction<boolean>) => {
      state.prefersReducedMotion = action.payload;
    },
  },
});

export const { setPrefersReducedMotion } = uiSlice.actions;

export default uiSlice.reducer;
