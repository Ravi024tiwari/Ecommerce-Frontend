import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux"; // Multiple reducers combine karne ke liye

import userReducer from "./userSlice";
import adminReducer from "./adminSlice"; // 🔥 Naya Import
import productReducer from "./productSlice.js"
import cartReducer from "./cartSlice.js"
import addressReducer from "./addressSlice.js"
import orderReducer from "./orderSlice.js"
import wishlistReducer from "./wishListSlice.js"
// Root Reducer (Saare slices ko ek jagah lana)
const rootReducer = combineReducers({
  user: userReducer,
  admin: adminReducer, // 🔥 Admin slice add kiya
  product:productReducer,
  cart:cartReducer,
  address:addressReducer,
  order:orderReducer,
  wishlist:wishlistReducer
});

// Persist Config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // Hum sirf User login save rakhenge, Admin stats refresh hone par fresh aane chahiye
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
export default store;