import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../Store/productSlice.js"; 
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { formatPrice } from "../Utils/helper.js";

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const [deleteLoading, setDeleteLoading] = useState(null); // Track specific deleting item

  useEffect(() => {
    // Page load hote hi products fetch karo
    dispatch(fetchProducts());
  }, [dispatch]);

  // 🔥 DELETE Handler
  const handleDelete = async (id) => {
    if (window.confirm("Kya aap sach mein is product ko delete karna chahte hain?")) {
      setDeleteLoading(id); // Show spinner on specific button
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/delete-product/${id}`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          // Success hone par list refresh karo
          dispatch(fetchProducts());
        }
      } catch (error) {
        console.error("Delete Error:", error);
        alert(error.response?.data?.message || "Failed to delete product.");
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-sans text-slate-200">
      
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Product <span className="text-blue-500">Inventory</span>
            </h1>
            <p className="text-slate-400 mt-1">Manage your store's catalog, stock, and pricing.</p>
          </div>
          
          <Link to="/admin/products/add">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20 transition-all rounded-full px-6 h-12">
              <Plus className="w-5 h-5 mr-2" /> Add New Product
            </Button>
          </Link>
        </div>

        {/* --- Product Table Card --- */}
        <Card className="overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              
              {/* Table Head */}
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Stock Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </td>
                  </tr>
                ) : products?.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id} className="group hover:bg-slate-800/50 transition-colors">
                      
                      {/* Product Info (Image + Name) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-lg border border-slate-700 overflow-hidden bg-white p-1 shadow-sm">
                            <img 
                              src={product.productImages?.[0] || "https://placehold.co/100"} 
                              alt={product.title} 
                              className="h-full w-full object-cover rounded-md"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-white line-clamp-1 max-w-[200px]">{product.title}</div>
                            <div className="text-xs text-slate-500">{product.brand}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-xs font-medium capitalize">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {formatPrice(product.price)}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          product.stock > 10 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : product.stock > 0 
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in Stock` : 'Out of Stock'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* EDIT Button (Links to /edit/:id) */}
                          <Link to={`/admin/products/edit/${product._id}`}>
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          
                          {/* DELETE Button */}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleDelete(product._id)}
                            disabled={deleteLoading === product._id}
                            className="h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            {deleteLoading === product._id ? (
                              <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>

                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-slate-500 flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-slate-800 rounded-full">
                        <Search className="h-8 w-8 opacity-30" />
                      </div>
                      <p>No products found in inventory.</p>
                      <Link to="/admin/products/add">
                        <Button variant="link" className="text-blue-500">Create your first product</Button>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default AdminProducts;