import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "../../utils/types";

interface AuthInitialState {
  userInfo: UserType | undefined;
  isDarkTheme: boolean;
}

const getSavedUser = (): UserType | undefined => {
  try {
    const raw = localStorage.getItem("zoom-user");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse saved user:", e);
  }
  return undefined;
};

const getSavedTheme = (): boolean => {
  try {
    return localStorage.getItem("zoom-theme") === "dark";
  } catch {
    return false;
  }
};

const initialState: AuthInitialState = {
  userInfo: getSavedUser(),
  isDarkTheme: getSavedTheme(),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    changeTheme: (state, action: PayloadAction<{ isDarkTheme: boolean }>) => {
      state.isDarkTheme = action.payload.isDarkTheme;
      localStorage.setItem(
        "zoom-theme",
        action.payload.isDarkTheme ? "dark" : "light"
      );
    },
    setUser: (state, action: PayloadAction<UserType | undefined>) => {
      state.userInfo = action.payload;
      if (action.payload) {
        localStorage.setItem("zoom-user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("zoom-user");
      }
    },
    logout: (state) => {
      state.userInfo = undefined;
      localStorage.removeItem("zoom-user");
    },
  },
});

export const { setUser, changeTheme, logout } = authSlice.actions;
export default authSlice.reducer;