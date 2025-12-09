import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../Store/cartSlice.js";
import { toggleWishlistAction } from "../../Store/wishListSlice.js";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { formatPrice, truncateText } from "../../Utils/helper.js";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { wishlistItems = [] } = useSelector((state) => state.wishlist || {});
  const { isAuthenticated } = useSelector((state) => state.user || {});

  // Check if current product is in wishlist
  const isWishlisted = wishlistItems.some(item => 
    (item._id === product._id) || (item === product._id)
  );

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    if (!isAuthenticated) return alert("Please login first");
    dispatch(addToCart(product._id, 1));
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert("Please login to wishlist items");
    await dispatch(toggleWishlistAction(product._id));
  };

  return (
    <div className="relative group h-full">
      <Link to={`/product/${product._id}`} className="block h-full">
        <Card className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
          
          {/* Image Area */}
          <div className="relative h-64 w-full overflow-hidden bg-slate-50 p-6 flex items-center justify-center">
            <img
              src={product?.productImages?.[0] || "https://placehold.co/600x400"}
              alt={product?.title}
              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
            />
            
            {/* Heart Icon */}
            <button 
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md transition-all duration-300 z-10 ${
                isWishlisted 
                  ? "bg-red-50 text-red-500 scale-110" 
                  : "bg-white text-slate-400 hover:bg-red-50 hover:text-red-500 hover:scale-110"
              }`}
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${isWishlisted ? "fill-red-500" : ""}`} 
              />
            </button>

            {/* Hover Actions */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
               <Button 
                 size="sm" 
                 className="rounded-full bg-slate-900 text-white hover:bg-blue-600 shadow-xl px-6 py-5 font-bold"
                 onClick={handleAddToCart}
               >
                 <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
               </Button>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 flex flex-col grow">
            <div className="flex justify-between items-start mb-2">
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                {product.brand}
              </div>
              {product.soldCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                   <Eye className="h-3 w-3" /> {product.soldCount} sold
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-1">
              {product?.title}
            </h3>
            
            <p className="text-sm text-slate-500 line-clamp-2 min-h-10 mb-3">
               {truncateText(product?.description, 60)}
            </p>
            
            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900">{formatPrice(product?.price)}</span>
                <span className="text-xs text-slate-400 line-through font-medium">{formatPrice(product?.price * 1.2)}</span>
              </div>
              
              <div className={`text-xs font-bold px-2 py-1 rounded ${
                 product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                 {product.stock > 0 ? "IN STOCK" : "SOLD OUT"}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default ProductCard;