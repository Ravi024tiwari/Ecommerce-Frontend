import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orders: [],          // List of all orders
  currentOrder: null,  // Recently placed order ID (for success page)
  orderDetails: null,  // Specific order details (for single view)
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setOrders: (state, action) => {
      state.loading = false;
      state.orders = action.payload;
      state.error = null;
    },
    setOrderDetails: (state, action) => {
      state.loading = false;
      state.orderDetails = action.payload;
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
      state.error = null;
    },
    setOrderError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
      state.error = null;
      state.loading = false;
    },
    //admin order
     setAdminOrders: (state, action) =>{
       state.loading = false;
      state.adminOrders = action.payload;
     },
  },
});

export const { 
  setOrderLoading, 
  setOrders, 
  setOrderDetails, 
  setCurrentOrder, 
  setOrderError, 
  resetCurrentOrder ,
  setAdminOrders
} = orderSlice.actions;

// --- 1. Create Razorpay Order ---
export const createRazorpayOrder = (totalAmount, addressId) => async (dispatch) => {
  dispatch(setOrderLoading());
  
  console.log("Creating Order with:", { amount: totalAmount, addressId });

  if (!addressId) {
    console.error("Address ID is missing!");
    dispatch(setOrderError("Delivery Address is missing"));
    return null;
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/create-order`,
      { 
        amount: totalAmount,
        addressId: addressId 
      },
      { withCredentials: true }
    );
    
    return response.data; 

  } catch (error) {
    console.error("Create Order API Error:", error.response?.data || error.message);
    dispatch(setOrderError(error.response?.data?.message || "Failed to initiate payment"));
    return null;
  }
};

// --- 2. Verify Payment ---
export const verifyPayment = (paymentData) => async (dispatch) => {
  dispatch(setOrderLoading());
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/verify-payment`,
      paymentData,
      { withCredentials: true }
    );

    if (response.data.success) {
      console.log("Payment verifiation successfully respone detail of verification..",response.data)
      dispatch(setCurrentOrder(response.data.orderId));
      return true;
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    dispatch(setOrderError("Payment verification failed"));
    return false;
  }
};

// --- 3. Fetch My Orders (List) ---
export const fetchMyOrders = () => async (dispatch) => {
  dispatch(setOrderLoading());
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/my-orders`,
      { withCredentials: true }
    );

    if (response.data.success) {
      dispatch(setOrders(response.data.orders));
    }
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    dispatch(setOrderError("Failed to fetch order history"));
  }
};

// --- 4. Fetch Single Order Details (Detailed View) ---
export const fetchOrderDetails = (orderId) => async (dispatch) => {
  dispatch(setOrderLoading());
  try {
    const response = await axios.get(
      // Ensure backend route is correct: /api/v1/order/my-orders/:id
      `${import.meta.env.VITE_BACKEND_URL}/order/my-orders/${orderId}`,
      { withCredentials: true }
    );

    if (response.data.success) {
      // Backend should return { success: true, order: {...} }
      dispatch(setOrderDetails(response.data.order));
    }
  } catch (error) {
    console.error("Fetch Single Order Error:", error);
    dispatch(setOrderError(error.response?.data?.message || "Failed to fetch order details"));
  }
};
//for the admin order detial
// 🔥 ADMIN: Fetch All Orders
export const fetchAllOrdersAdmin = () => async (dispatch) => {
  dispatch(setOrderLoading());
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/get-all-orders`, // Backend route check kar lena
      { withCredentials: true }
    );
    if (response.data.success) {
      dispatch(setAdminOrders(response.data.orders));
    }
  } catch (error) {
    console.error("Admin Fetch Orders Error:", error);
    dispatch(setOrderError("Failed to load admin orders"));
  }
};

// 🔥 ADMIN: Update Order Status
export const updateOrderStatus = (orderId, status) => async (dispatch) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/order/update-status/${orderId}`,
      { orderStatus: status },
      { withCredentials: true }
    );
    
    if (response.data.success) {
      // List refresh karo taaki naya status dikhe
      dispatch(fetchAllOrdersAdmin());
      return true;
    }
  } catch (error) {
    console.error("Update Status Error:", error);
    alert("Failed to update status");
    return false;
  }
};

export default orderSlice.reducer;