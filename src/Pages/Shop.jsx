import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom"; 
import { fetchProducts } from "../Store/productSlice";
import ProductCard from "../components/product/ProductCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Loader2, Filter, X, SlidersHorizontal, Search, ArrowDownUp } from "lucide-react";

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading } = useSelector((state) => state.product);

  // Filters State (Synced with URL)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
  });

  const [showFilters, setShowFilters] = useState(false);

  // 1. Sync URL Changes to State (Navbar search support)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
    }));
  }, [searchParams]);

  // 2. Fetch Products when Filters Change (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchProducts(filters));
    }, 500); 
    return () => clearTimeout(timer);
  }, [filters, dispatch]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Update URL Params for shareability (optional but good practice)
    // setSearchParams(newFilters); 
  };

  const clearFilters = () => {
    const reset = { search: "", category: "", minPrice: "", maxPrice: "", sort: "newest" };
    setFilters(reset);
    setSearchParams({}); // Clear URL params
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        
        {/* Page Header (Mobile Only) */}
        <div className="md:hidden flex justify-between items-center mb-6">
           <h1 className="text-2xl font-black text-slate-900">Shop</h1>
           <Button variant="outline" size="sm" onClick={() => setShowFilters(true)} className="gap-2 rounded-full">
             <Filter className="h-4 w-4" /> Filters
           </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 relative">
          
          {/* --- SIDEBAR FILTERS --- */}
          <aside 
            className={`
              md:w-1/4 md:block 
              fixed inset-0 z-50 bg-white md:bg-transparent md:static 
              p-6 md:p-0 overflow-y-auto md:overflow-visible transition-transform duration-300 ease-in-out
              ${showFilters ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
          >
            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-slate-900">Filters</h3>
               <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="rounded-full bg-slate-100">
                 <X className="h-5 w-5" />
               </Button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
              <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" /> Filters
                </h3>
                <button onClick={clearFilters} className="text-xs text-slate-400 font-bold hover:text-red-500 transition-colors">
                  RESET ALL
                </button>
              </div>

              {/* Search (Local) */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Keywords</label>
                <div className="relative">
                   <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                   <Input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search..." className="bg-slate-50 pl-10 h-10 border-slate-200 focus:bg-white transition-all" />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Category</label>
                <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer hover:bg-white">
                  <option value="">All Categories</option>
                  <option value="mobiles">Mobiles</option>
                  <option value="laptops">Laptops</option>
                  <option value="fashion">Fashion</option>
                  <option value="electronics">Electronics</option>
                  <option value="home">Home & Living</option>
                  <option value="gadgets">Gadgets</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Price Range</label>
                <div className="flex gap-2 items-center">
                  <Input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="Min" className="bg-slate-50 h-10 text-sm" />
                  <span className="text-slate-300">-</span>
                  <Input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max" className="bg-slate-50 h-10 text-sm" />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Sort By</label>
                <div className="relative">
                   <ArrowDownUp className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                   <select name="sort" value={filters.sort} onChange={handleFilterChange} className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer hover:bg-white">
                     <option value="newest">Newest Arrivals</option>
                     <option value="rating">🔥 Trending / Best Rated</option>
                     <option value="price_asc">Price: Low to High</option>
                     <option value="price_desc">Price: High to Low</option>
                   </select>
                </div>
              </div>
              
              {/* Mobile Only: Apply Button */}
              <div className="md:hidden mt-8 pt-4 border-t border-slate-100">
                 <Button className="w-full bg-slate-900 text-white rounded-xl" onClick={() => setShowFilters(false)}>View Results</Button>
              </div>
            </div>
          </aside>
          
          {/* Overlay for Mobile */}
          {showFilters && (
            <div className="md:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
          )}

          {/* --- PRODUCT GRID --- */}
          <main className="md:w-3/4 w-full">
            
            <div className="hidden md:flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {filters.search ? `Results for "${filters.search}"` : "All Products"}
                <span className="text-lg font-medium text-slate-400 ml-3 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">{products.length} Items</span>
              </h2>
            </div>

            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-400 animate-pulse">Fetching fresh products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                   <Filter className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No products found</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6 max-w-xs mx-auto">
                   We couldn't find what you're looking for. Try adjusting your filters.
                </p>
                <Button variant="outline" onClick={clearFilters} className="border-slate-200 text-blue-600 hover:bg-blue-50 rounded-full px-6">
                   Clear all filters
                </Button>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default Shop;