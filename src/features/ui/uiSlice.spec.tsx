import uiReducer, { UiState, setPrefersReducedMotion } from "./uiSlice";

const initialState: UiState = {
  prefersReducedMotion: false,
};

describe("ui reducer", () => {
  it("should handle setPrefersReducedMotion", () => {
    let actual = uiReducer(initialState, setPrefersReducedMotion(true));

    expect(actual.prefersReducedMotion).toBe(true);

    actual = uiReducer(actual, setPrefersReducedMotion(false));

    expect(actual.prefersReducedMotion).toBe(false);
  });
});
