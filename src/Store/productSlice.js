import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  products: [],
  selectedProduct: null,
  homeData:null,
  reviews: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProductLoading: (state) => {
      state.loading = true;
      state.error = null; // Loading start hote hi error clear karo
    },
     setHomeData: (state, action) => {
      state.loading = false;
      state.homeData = action.payload; // { trending, newArrivals, ... }//on the home screen show
    },
    setProducts: (state, action) => {
      state.loading = false;
      state.products = action.payload || [];
    },
    setSelectedProduct: (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
      state.error = null; // Success hone par error clear
    },
    setProductReviews: (state, action) => {
      state.reviews = action.payload;
    },
    setProductError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.selectedProduct = null;
    },
  },
});

export const { 
  setProductLoading, 
  setProducts, 
  setSelectedProduct, 
  setProductReviews, 
  setProductError,
  setHomeData 
} = productSlice.actions;

// --- Fetch All Products ---
export const fetchProducts = (params = {}) => async (dispatch) => {
  dispatch(setProductLoading());
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/get-all-products?${queryString}`,
      { withCredentials: true }
    );

    if (response.data.success) {
      dispatch(setProducts(response.data.products));
    }
  } catch (error) {
    console.error("Fetch Products Error:", error);
    dispatch(setProductError(error.response?.data?.message));
  }
};

// --- 🔥 FETCH SINGLE PRODUCT (DEBUG VERSION) ---
export const fetchProductDetails = (id) => async (dispatch) => {
  dispatch(setProductLoading());
  try {
    const url = `${import.meta.env.VITE_BACKEND_URL}/single-product/${id}`;
    console.log("📡 API Calling URL:", url); // Check karo URL sahi hai?

    const response = await axios.get(url, { withCredentials: true });
    
    console.log("✅ API Response Recieved:", response.data); // Data check karo

    if (response.data.success) {
      dispatch(setSelectedProduct(response.data.product));
    } else {
      console.error("❌ API Success False:", response.data);
      dispatch(setProductError("Product found but success flag is false"));
    }
  } catch (error) {
    console.error("❌ Fetch Details Error:", error);
    // Agar 404 hai toh specific message
    if (error.response && error.response.status === 404) {
        dispatch(setProductError("Product does not exist in database"));
    } else {
        dispatch(setProductError(error.response?.data?.message || error.message));
    }
  }
};

// --- Fetch Reviews ---
export const fetchReviews = (productId) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/product/review/${productId}`, // Check Route: /reviews ya /products/review?
      { withCredentials: true }
    );
    if (response.data.success) {
      dispatch(setProductReviews(response.data.reviews));
    }
  } catch (error) {
    console.error("Fetch Reviews Error (Minor):", error);
    // Reviews fail hone se product page break nahi hona chahiye
  }
};

// --- Add Review ---
export const addReview = (reviewData) => async (dispatch) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/add/review`, // Check Route
      reviewData,
      { withCredentials: true }
    );
    
    if (response.data.success) {
      dispatch(fetchReviews(reviewData.productId));
      dispatch(fetchProductDetails(reviewData.productId)); 
      return { success: true, message: "Review submitted successfully!" };
    }
  } catch (error) {
    console.error("Add Review Error:", error);
    return { success: false, message: error.response?.data?.message || "Failed to add review" };
  }
};
//set Home data trending prouducts
export const fetchHomeData = () => async (dispatch) => {
  dispatch(setProductLoading());
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/home-config/product`
    );

    if (response.data.success) {
      dispatch(setHomeData(response.data.data)); // Backend sends 'data' object
    } else {
      dispatch(stopProductLoading());
    }
  } catch (error) {
    console.error("Fetch Home Data Error:", error);
    dispatch(setProductError("Failed to load home page data"));
  }
};


export default productSlice.reducer;