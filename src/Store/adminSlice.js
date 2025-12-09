import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  users: [],       // 🔥 All Users List
  products: [],
  reviews: [], // 🔥 New: Reviews State
  orders: [],
  stats: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setAllUsers: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },
    removeUserLocal: (state, action) => {
      state.users = state.users.filter((user) => user._id !== action.payload);
    },
    setAdminError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
      // 🔥 Reviews Reducers
    setAllReviews: (state, action) => {
      state.loading = false;
      state.reviews = action.payload;
    },
    // Dashboard Stats ke liye
    setDashboardStats: (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    },
  },
});

export const { 
  setAdminLoading, 
  setAllUsers, 
  removeUserLocal, 
  setAdminError,
  setDashboardStats ,
  setAllReviews
} = adminSlice.actions;

// --- 1. Fetch All Users (Admin Only) ---
export const fetchAllUsers = () => async (dispatch) => {
  dispatch(setAdminLoading());
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/admin/users/get-all`, // Backend Route
      { withCredentials: true }
    );

    if (response.data.success) {
      dispatch(setAllUsers(response.data.users));
    }
  } catch (error) {
    console.error("Fetch Users Error:", error);
    dispatch(setAdminError("Failed to fetch users"));
  }
};

// --- 2. Delete User (Admin Only) ---
export const deleteUser = (userId) => async (dispatch) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    // Optimistic Update: UI se pehle hata do
    dispatch(removeUserLocal(userId));

    const response = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/admin/users/delete/${userId}`,
      { withCredentials: true }
    );

    if (response.data.success) {
      alert("User deleted successfully");
    } else {
      // Agar fail hua to wapas fetch karo
      dispatch(fetchAllUsers());
    }
  } catch (error) {
    console.error("Delete User Error:", error);
    alert("Failed to delete user");
    dispatch(fetchAllUsers()); // Rollback
  }
};

// --- 3. Fetch Dashboard Stats ---
export const fetchDashboardStats = () => async (dispatch) => {
  dispatch(setAdminLoading());
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/admin/dashboard-summary`,
      { withCredentials: true }
    );
    if (response.data.success) {
      dispatch(setDashboardStats(response.data.dashboard)); // Adjust key based on backend
    }
  } catch (error) {
    console.error("Fetch Stats Error:", error);
  }
};

// --- 4. 🔥 NEW: Fetch All Reviews (Admin) ---
export const fetchAllReviewsAdmin = () => async (dispatch) => {
  dispatch(setAdminLoading());
  try {
    // URL: /api/v1/reviews/admin/all (Ensure this matches backend route)
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/admin/all-reviews`, 
      { withCredentials: true }
    );
    
    if (response.data.success) {
      dispatch(setAllReviews(response.data.reviews));
    }
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    dispatch(setAdminError("Failed to fetch reviews"));
  }
};

// --- 5. 🔥 NEW: Delete Review (Admin) ---
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Check Authorization (User apna review delete kare ya Admin koi bhi)
    if (review.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
    }

    const productId = review.productId;

    // 🔥 1. Pehle delete karo
    await review.deleteOne();

    // 🔥 2. Phir Product update karne ki koshish karo (Safely)
    if (productId) {
      try {
        const reviews = await Review.find({ productId });
        
        let avg = 0;
        if (reviews.length > 0) {
          avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        }

        const numOfReviews = reviews.length;

        await Product.findByIdAndUpdate(productId, {
          averageRating: avg,
          reviewCount: numOfReviews,
        });
      } catch (productError) {
        // Agar product update fail bhi hua (e.g. Product delete ho chuka hai), 
        // toh bhi humein error throw nahi karna chahiye kyunki Review toh delete ho gaya hai.
        console.warn("Product rating update failed (Product might be deleted):", productError.message);
      }
    }

    // 🔥 3. Success Response Bhejo
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};


export default adminSlice.reducer;