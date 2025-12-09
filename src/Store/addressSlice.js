import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  addressList: [],
  defaultAddress: null,
  loading: false,
  error: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setAddressLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setAddressList: (state, action) => {
      state.loading = false;
      // 🔥 FIX: Ensure payload is an array
      state.addressList = Array.isArray(action.payload) ? action.payload : [];
      
      // Auto-set default address in state
      if (state.addressList.length > 0) {
         state.defaultAddress = state.addressList.find(addr => addr.isDefault) || state.addressList[0];
      }
    },
    setDefaultAddressState: (state, action) => {
      state.defaultAddress = action.payload;
    },
    setAddressError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    removeAddressLocal: (state, action) => {
      state.addressList = state.addressList.filter(addr => addr._id !== action.payload);
    },
  },
});

export const { 
  setAddressLoading, 
  setAddressList, 
  setDefaultAddressState, 
  setAddressError, 
  removeAddressLocal 
} = addressSlice.actions;

// --- 1. Fetch All Addresses ---
export const fetchAddresses = () => async (dispatch) => {
  dispatch(setAddressLoading());
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/get-all-address`,
      { withCredentials: true }
    );

    if (response.data.success) {
      // 🔥 KEY MATCH: Backend 'addresses' bhej raha hai
      dispatch(setAddressList(response.data.addresses));
    }
  } catch (error) {
    console.error("Fetch Address Error:", error);
    dispatch(setAddressError("Failed to load addresses"));
  }
};

// --- 2. Add New Address ---
export const addAddress = (formData) => async (dispatch) => {
  dispatch(setAddressLoading());
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/add-address`,
      formData,
      { withCredentials: true }
    );

    if (response.data.success) {
      // 🔥 KEY MATCH: Backend 'addresses' bhej raha hai
      dispatch(setAddressList(response.data.addresses)); 
      return true;
    }
  } catch (error) {
    console.error("Add Address Error:", error);
    dispatch(setAddressError(error.response?.data?.message || "Failed to add address"));
    return false;
  }
};

// --- 3. Delete Address ---
export const deleteAddress = (addressId) => async (dispatch) => {
  try {
    dispatch(removeAddressLocal(addressId));

    const response = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/delete-address/${addressId}`,
      { withCredentials: true }
    );

    if (response.data.success) {
      // 🔥 KEY MATCH: Backend 'addresses' bhej raha hai
      dispatch(setAddressList(response.data.addresses));
    } else {
      dispatch(fetchAddresses());
    }
  } catch (error) {
    console.error("Delete Address Error:", error);
    dispatch(fetchAddresses());
  }
};

// --- 4. Update Address ---
export const updateAddress = (addressId, formData) => async (dispatch) => {
  dispatch(setAddressLoading());
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/update/${addressId}`,
      formData,
      { withCredentials: true }
    );

    if (response.data.success) {
      // 🔥 KEY MATCH: Backend 'addresses' bhej raha hai
      dispatch(setAddressList(response.data.addresses));
      return true;
    }
  } catch (error) {
    console.error("Update Address Error:", error);
    dispatch(setAddressError("Failed to update address"));
    return false;
  }
};

// --- 5. Set Default Address ---
export const setDefaultAddress = (addressId) => async (dispatch) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/set-default/${addressId}`,
      {},
      { withCredentials: true }
    );

    if (response.data.success) {
      // 🔥 KEY MATCH: Backend 'addresses' bhej raha hai
      dispatch(setAddressList(response.data.addresses));
      return true;
    }
  } catch (error) {
    console.error("Set Default Error:", error);
    return false;
  }
};

export default addressSlice.reducer;