import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../Store/cartSlice.js";
import { fetchProductDetails, addReview, fetchReviews } from "../Store/productSlice.js";
import { toggleWishlistAction, fetchWishlist } from "../Store/wishListSlice.js";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { 
  Loader2, Star, Minus, Plus, ShoppingCart, ShieldCheck, 
  Truck, ArrowRight, AlertCircle, Heart, RefreshCcw 
} from "lucide-react";
import { formatPrice } from "../Utils/helper.js";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

// Custom Animations
const customStyles = `
  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up { animation: slideUpFade 0.6s ease-out forwards; }
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
`;

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux States
  const { selectedProduct: product, reviews, loading, error } = useSelector((state) => state.product || {});
  const { isAuthenticated } = useSelector((state) => state.user || {});
  const { wishlistItems = [] } = useSelector((state) => state.wishlist || {});
  
  // Local States
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  
  // Review Form States
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Check Wishlist Status
  const isWishlisted = wishlistItems.some((item) => 
    (item._id === product?._id) || (item === product?._id)
  );

  // 1. Fetch Data on Load
  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      dispatch(fetchReviews(id));
    }
    // Fetch wishlist if logged in to show correct heart status
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
    window.scrollTo(0, 0);
  }, [dispatch, id, isAuthenticated]);

  // 2. Set Default Image
  useEffect(() => {
    if (product?.productImages?.length > 0) {
      setSelectedImage(product.productImages[0]);
    }
  }, [product]);

  // --- Handlers ---

  const handleQuantity = (type) => {
    if (!product) return;
    if (type === "inc" && quantity < product.stock) setQuantity(q => q + 1);
    if (type === "dec" && quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }
    setAdding(true);
    await dispatch(addToCart(product._id, quantity));
    setAdding(false);
    alert("Added to Cart!");
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      alert("Please login to save items");
      return;
    }
    await dispatch(toggleWishlistAction(product._id));
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert("Please select a star rating!");
      return;
    }
    setReviewSubmitting(true);
    
    const result = await dispatch(addReview({
      productId: product._id,
      rating,
      comment
    }));

    if (result.success) {
      alert("Review Added Successfully!");
      setRating(0);
      setComment("");
    } else {
      alert(result.message);
    }
    setReviewSubmitting(false);
  };

  // Helper Renders
  const renderStars = (value = 0, size = "h-5 w-5") => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`${size} ${i < value ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-100"}`} 
      />
    ));
  };

  const StarInput = () => (
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <button 
          key={star} 
          type="button"
          onClick={() => setRating(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star className={`h-8 w-8 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
        </button>
      ))}
    </div>
  );

  // --- Loading & Error States ---
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin h-12 w-12 text-slate-800 mb-4" />
        <p className="text-slate-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 px-4">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
           <AlertCircle className="h-16 w-16 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-center max-w-md mb-6">
           {error || "The product you are looking for might have been removed."}
        </p>
        <Link to="/shop">
           <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8">
              Back to Shop
           </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20 pt-24 overflow-hidden">
      <style>{customStyles}</style>
      
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        
        {/* --- Product Top Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
          
          {/* Left: Images */}
          <div className="space-y-6 lg:sticky lg:top-28 self-start animate-slide-up">
            <div className="relative aspect-square w-full bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl group">
              <img 
                src={selectedImage || "https://placehold.co/600?text=No+Image"} 
                alt={product.title} 
                className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105" 
              />
              
              {/* Heart Button */}
              <button 
                onClick={handleWishlistToggle}
                className={`absolute top-6 right-6 p-3 rounded-full shadow-md backdrop-blur-md transition-all hover:scale-110 z-10 ${
                  isWishlisted 
                    ? "bg-red-50 text-red-500" 
                    : "bg-white/80 text-slate-400 hover:text-red-500"
                }`}
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? "fill-red-500" : ""}`} />
              </button>
            </div>
            
            {/* Thumbnails */}
            {product.productImages?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar px-1">
                {product.productImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)} 
                    className={`w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 transition-all duration-300 ${
                      selectedImage === img 
                        ? "border-blue-600 ring-4 ring-blue-50 scale-105" 
                        : "border-transparent bg-white hover:border-slate-200"
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col space-y-8 animate-slide-up delay-100">
            
            <div>
               <div className="flex items-center gap-3 mb-3">
                 <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                   {product.brand || "Brand"}
                 </span>
                 <span className={`text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-wider ${product.stock > 0 ? "text-green-600 bg-green-50 border-green-100" : "text-red-600 bg-red-50 border-red-100"}`}>
                   {product.stock > 0 ? "In Stock" : "Out of Stock"}
                 </span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                 {product.title}
               </h1>
               
               <div className="flex items-center gap-4 mt-4">
                 <div className="flex bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                    {renderStars(Math.round(product.averageRating || 0))}
                    <span className="ml-2 text-sm font-bold text-yellow-700">{product.averageRating || 0}</span>
                 </div>
                 <span className="text-sm text-slate-400 font-medium">
                   {product.reviewCount || 0} Verified Reviews
                 </span>
               </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-sm text-slate-400 font-medium uppercase mb-1">Total Price</p>
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-slate-900 tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xl text-slate-400 line-through font-medium">
                    {formatPrice(product.price * 1.2)}
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                    20% OFF
                  </span>
                </div>
            </div>

            <div className="prose prose-slate text-slate-600 text-lg leading-relaxed">
               <p>{product.description}</p>
            </div>

            <div className="h-px w-full bg-slate-200 my-4"></div>

            {/* Actions */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                 {/* Quantity */}
                 <div className="flex items-center justify-between bg-white border border-slate-200 rounded-full px-6 py-3 w-full sm:w-48 shadow-sm">
                    <button onClick={() => handleQuantity("dec")} disabled={quantity <= 1} className="text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"><Minus className="h-6 w-6" /></button>
                    <span className="font-bold text-xl text-slate-800">{quantity}</span>
                    <button onClick={() => handleQuantity("inc")} disabled={quantity >= product.stock} className="text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"><Plus className="h-6 w-6" /></button>
                 </div>
                 
                 {/* Add to Cart */}
                 <Button 
                    size="lg" 
                    className="flex-1 rounded-full h-16 bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed" 
                    onClick={handleAddToCart} 
                    disabled={product.stock === 0 || adding}
                 >
                    {adding ? <Loader2 className="animate-spin mr-2" /> : <><ShoppingCart className="mr-2 h-6 w-6" /> Add to Cart</>}
                 </Button>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
               <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600"><Truck className="h-6 w-6" /></div>
                  <div><h4 className="font-bold text-slate-800">Free Delivery</h4><p className="text-xs text-slate-500">On orders over ₹999</p></div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-green-50 rounded-full text-green-600"><ShieldCheck className="h-6 w-6" /></div>
                  <div><h4 className="font-bold text-slate-800">2 Year Warranty</h4><p className="text-xs text-slate-500">100% Authentic</p></div>
               </div>
            </div>
          </div>
        </div>

        {/* --- Reviews Section --- */}
        <div className="border-t border-slate-200 pt-16 animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customer Reviews <span className="text-slate-400 ml-2 text-xl font-medium">({reviews?.length || 0})</span></h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review._id} className="border-none shadow-sm bg-white p-6 rounded-3xl ring-1 ring-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={review.userId?.profileImage} />
                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                          {review.userId?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">{review.userId?.name || review.name || "Anonymous"}</h4>
                            <div className="flex items-center gap-1 mt-1">{renderStars(review.rating, "h-4 w-4")}</div>
                          </div>
                          <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Verified Buyer</span>
                        </div>
                        <p className="text-slate-600 mt-3 text-base leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-500 font-medium text-lg">No reviews yet.</p>
                   <p className="text-slate-400 text-sm mt-1">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Add Review Form */}
            <div className="lg:col-span-1">
               <div className="sticky top-28">
                 <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-4xl p-8 overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                   <h3 className="text-2xl font-bold mb-2 relative z-10">Write a Review</h3>
                   <p className="text-slate-400 text-sm mb-6 relative z-10">Share your experience with this product.</p>
                   
                   {isAuthenticated ? (
                     <div className="space-y-5 relative z-10">
                       <div>
                         <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Rating</label>
                         <StarInput />
                       </div>
                       <div>
                         <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Comment</label>
                         <textarea 
                           rows="4" 
                           className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600 transition-all resize-none"
                           placeholder="What did you like or dislike?"
                           value={comment}
                           onChange={(e) => setComment(e.target.value)}
                         ></textarea>
                       </div>
                       <Button 
                         className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
                         onClick={handleSubmitReview}
                         disabled={reviewSubmitting}
                       >
                         {reviewSubmitting ? <Loader2 className="animate-spin" /> : "Submit Review"}
                       </Button>
                     </div>
                   ) : (
                     <div className="text-center py-8 relative z-10">
                       <p className="text-slate-400 text-sm mb-6">Please login to write a review.</p>
                       <Link to="/login">
                         <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-800 hover:text-white rounded-2xl h-12 font-bold">
                           Login Now
                         </Button>
                       </Link>
                     </div>
                   )}
                 </Card>
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;