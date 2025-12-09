import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  user: null,           // Yahan user ka object aayega (id, name, email, role, etc.)
  isAuthenticated: false, // Login status check karne ke liye
  loading: false,       // API call ke dauran spinner dikhane ke liye
  error: null,          // Agar login fail ho to error message yahan aayega
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 1. Loading Start (Jab login button dabaya jaye)
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },

    // 2. Success (Backend se data milne par)
    setUser: (state, action) => {
      state.loading = false;
      state.user = action.payload; // User data save
      state.isAuthenticated = true; // Status -> Logged In
      state.error = null;
    },

    // 3. Failure (Agar password galat ho ya server error ho)
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 4. Logout (Sab kuch clear karne ke liye)
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

// Actions ko export karo taaki hum Login/Register page par inhe dispatch kar sakein
export const { setLoading, setUser, setError, logoutUser } = userSlice.actions;

// Reducer export karo store.js ke liye
export default userSlice.reducer;

// --- 1. Smart Update Profile Action ---
export const updateUserAction = (formData) => async (dispatch, getState) => {
  dispatch(setLoading());
  
  // 🔥 Current Logged-in User nikaalo
  const { user } = getState().user; 
  
  try {
    let url;
    
    // Logic: Agar Admin hai to ID wala route, nahi to User wala route
    if (user?.role === "admin") {
      url = `${import.meta.env.VITE_BACKEND_URL}/update-user/${user._id}`;
    } else {
      url = `${import.meta.env.VITE_BACKEND_URL}/update-profile`;
    }

    const response = await axios.put(
      url,
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (response.data.success) {
      dispatch(setUser(response.data.user)); 
      return { success: true, message: "Profile updated successfully!" };
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    const msg = error.response?.data?.message || "Failed to update profile";
    dispatch(setError(msg));
    return { success: false, message: msg };
  }
};

// --- 2. Smart Change Password Action ---
export const changePasswordAction = (passwordData) => async (dispatch, getState) => {
  dispatch(setLoading());
  
  // 🔥 Current User nikaalo
  const { user } = getState().user;

  try {
    let url;

    // Logic: Admin ke liye ID wala route, User ke liye direct route
    if (user?.role === "admin") {
      url = `${import.meta.env.VITE_BACKEND_URL}/change-password/${user._id}`;
    } else {
      url = `${import.meta.env.VITE_BACKEND_URL}/change-password`;
    }

    const response = await axios.put(
      url,
      passwordData,
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );

    if (response.data.success) {
      dispatch(setLoading()); // Sirf loading false karo
      return { success: true, message: "Password changed successfully!" };
    }
  } catch (error) {
    console.error("Change Password Error:", error);
    const msg = error.response?.data?.message || "Failed to change password";
    dispatch(setError(msg));
    return { success: false, message: msg };
  }
};