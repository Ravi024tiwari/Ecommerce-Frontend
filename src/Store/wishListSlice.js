import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  wishlistItems: [], // Stores product objects
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setWishlistItems: (state, action) => {
      state.loading = false;
      state.wishlistItems = action.payload;
    },
    setWishlistError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Optimistic Updates (UI turant badalne ke liye)
    addToWishlistLocal: (state, action) => {
      state.wishlistItems.push(action.payload);
    },
    removeFromWishlistLocal: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter((item) => item._id !== action.payload);
    },
  },
});

export const { 
  setWishlistLoading, 
  setWishlistItems, 
  setWishlistError, 
  addToWishlistLocal, 
  removeFromWishlistLocal 
} = wishlistSlice.actions;

// --- 1. Fetch User Wishlist ---
export const fetchWishlist = () => async (dispatch) => {
  dispatch(setWishlistLoading());
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/my-wishlist`,
      { withCredentials: true }
    );

    if (response.data.success) {
      dispatch(setWishlistItems(response.data.wishlist));
    }
  } catch (error) {
    console.error("Fetch Wishlist Error:", error);
    dispatch(setWishlistError("Failed to load wishlist"));
  }
};

// --- 2. Toggle Wishlist (Add/Remove) ---
export const toggleWishlistAction = (productId) => async (dispatch) => {
  try {
    // Backend call
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/toggle/${productId}`,
      {},
      { withCredentials: true }
    );

    if (response.data.success) {
      // Backend should return the updated wishlist or we re-fetch
      // Agar backend updated list nahi bhej raha, toh best hai fetch call kar lo
      dispatch(fetchWishlist()); 
      return response.data; // Return data for UI toast
    }
  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    return null;
  }
};

export default wishlistSlice.reducer;