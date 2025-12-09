import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllReviewsAdmin, deleteReview } from "../Store/adminSlice.js"; 
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, Star, Trash2, Search, MessageSquare, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const AdminReviews = () => {
  const dispatch = useDispatch();
  const { reviews = [], loading } = useSelector((state) => state.admin || {});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllReviewsAdmin());
  }, [dispatch]);

  const handleDelete = (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      dispatch(deleteReview(reviewId));
    }
  };

  // Helper to render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
    ));
  };

  // Filter Logic
  const filteredReviews = reviews.filter(rev => 
    rev.productId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Reviews</h1>
          <p className="text-slate-500">Monitor and moderate customer feedback.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search reviews..." 
            className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reviews Table */}
      <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Rating</th>
                <th className="px-6 py-4 font-bold">Comment</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12"><Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" /></td></tr>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Product Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                           <img 
                             src={rev.productId?.productImages?.[0] || "https://placehold.co/100"} 
                             alt="prod" 
                             className="w-full h-full object-cover"
                           />
                         </div>
                         <div className="max-w-[150px]">
                           <p className="font-semibold text-slate-900 truncate">{rev.productId?.title || "Deleted Product"}</p>
                           <p className="text-[10px] text-slate-400">ID: {rev.productId?._id?.slice(-6)}</p>
                         </div>
                      </div>
                    </td>
                    
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={rev.userId?.profileImage} />
                          <AvatarFallback className="text-xs">{rev.userId?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-700">{rev.userId?.name || "Unknown"}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5">
                        {renderStars(rev.rating)}
                        <span className="ml-2 text-xs font-bold text-slate-600">({rev.rating})</span>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <MessageSquare className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />
                        <p className="text-slate-600 line-clamp-2 italic">"{rev.comment}"</p>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(rev._id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <AlertTriangle className="h-10 w-10 opacity-20" />
                       <p>No reviews found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminReviews;