import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  cartItems: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartLoading: (state) => {
      state.loading = true;
    },
    setCartItems: (state, action) => {
      state.loading = false;
      // Safe check: Ensure array
      state.cartItems = Array.isArray(action.payload) ? action.payload : [];
    },
    setCartError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setCartLoading, setCartItems, setCartError } = cartSlice.actions;

// --- 1. Fetch Cart (GET) ---
export const fetchCart = () => async (dispatch) => {
  dispatch(setCartLoading());
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/my-cart`,
      { withCredentials: true }
    );
    if (response.data.success) {
      // Backend: returns { success: true, cartItems: [...] }
      dispatch(setCartItems(response.data.cartItems));
    }
  } catch (error) {
    console.error("Fetch Cart Error:", error);
    // Cart nahi mila ya error aaya to empty set karo
    dispatch(setCartItems([]));
  }
};

// --- 2. Add To Cart (POST) ---
export const addToCart = (productId) => async (dispatch) => {
  dispatch(setCartLoading());
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/add`,
      { productId },
      { withCredentials: true }
    );

    if (response.data.success) {
      // Backend: returns { success: true, cart: { cartItems: [...] } }
      dispatch(setCartItems(response.data.cart.cartItems)); 
    }
  } catch (error) {
    console.error("Add to Cart Error:", error);
    dispatch(setCartError(error.response?.data?.message || "Failed to add item"));
  }
};

// --- 3. Increase Quantity (POST /increase-qty) ---
export const increaseQty = (productId) => async (dispatch) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/increase-qty`,
      { productId },
      { withCredentials: true }
    );

    if (response.data.success) {
      // Backend: returns { success: true, cart: { cartItems: [...] } }
      dispatch(fetchCart(response.data.cart.cartItems));
    }
  } catch (error) {
    console.error("Increase Qty Error:", error);
  }
};

// --- 4. Decrease Quantity (POST /decrease-qty) ---
export const decreaseQty = (productId) => async (dispatch) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/decrease-qty`,
      { productId },
      { withCredentials: true }
    );

    if (response.data.success) {
      // Backend: returns { success: true, cart: { cartItems: [...] } }
      dispatch(fetchCart(response.data.cart.cartItems));
    }
  } catch (error) {
    console.error("Decrease Qty Error:", error);
  }
};

// --- 5. Remove Item (DELETE /remove-item/:id) ---
export const removeFromCart = (productId) => async (dispatch) => {
  try {
    // Optimistic Update: UI se pehle hi hata do (Optional, but good for UX)
    // Yahan hum backend response ka wait kar rahe hain taaki sync issue na ho
    const response = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/remove-item/${productId}`,
      { withCredentials: true }
    );

    if (response.data.success) {
      // Backend: returns { success: true, cart: { cartItems: [...] } }
      dispatch(fetchCart(response.data.cart.cartItems));
    }
  } catch (error) {
    console.error("Remove Item Error:", error);
  }
};

export default cartSlice.reducer;