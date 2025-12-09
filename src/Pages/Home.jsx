import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHomeData } from "../Store/productSlice"; 
import { Button } from "../components/ui/button";
import ProductCard from "../components/product/ProductCard"; 
import { ArrowRight, Sparkles, Play, Truck, ShieldCheck, Zap, Loader2, ShoppingBag, TrendingUp, Star, Clock } from "lucide-react";

// Animations & Styles
const customStyles = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(1deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  @keyframes slide-up {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .float-anim { animation: float 6s ease-in-out infinite; }
  .slide-up-anim { animation: slide-up 0.8s ease-out forwards; }
  
  .hero-text-gradient {
    background: linear-gradient(135deg, #0f172a 0%, #2563eb 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .section-title {
    font-size: 2.25rem;
    line-height: 2.5rem;
    font-weight: 900;
    color: #1e293b;
    letter-spacing: -0.025em;
  }
`;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { homeData, loading } = useSelector((state) => state.product || {});

  // Extract Data Sections (with fallbacks)
  const trendingProducts = homeData?.trending || [];
  const newArrivals = homeData?.newArrivals || [];
  const topRated = homeData?.topRated || [];
  const bestDeals = homeData?.bestDeals || [];

  useEffect(() => {
    dispatch(fetchHomeData());
  }, [dispatch]);

  // Loading Skeleton
  const ProductSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
       {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[380px] w-full bg-slate-200 rounded-3xl animate-pulse" />
       ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-200 selection:text-blue-900">
      <style>{customStyles}</style>

      {/* --- 1. Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-6 bg-linear-to-b from-white to-slate-100 border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 opacity-60"></div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 text-xs font-bold text-blue-600 uppercase tracking-wider shadow-sm slide-up-anim" style={{ animationDelay: '0.1s' }}>
                <Sparkles className="h-3.5 w-3.5 fill-blue-600" />
                New Collection 2025
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 slide-up-anim" style={{ animationDelay: '0.2s' }}>
                Discover the <br />
                <span className="hero-text-gradient">Future of Tech.</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed slide-up-anim" style={{ animationDelay: '0.3s' }}>
                Experience premium gadgets, fashion, and lifestyle essentials. Curated for quality, designed for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 slide-up-anim" style={{ animationDelay: '0.4s' }}>
                <Button 
                   size="lg" 
                   onClick={() => navigate('/shop')}
                   className="h-14 px-8 rounded-full text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xl shadow-blue-200 hover:-translate-y-1"
                >
                   Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <div className="flex items-center gap-3 cursor-pointer group p-2 rounded-full hover:bg-white/50 transition-all">
                  <div className="h-12 w-12 rounded-full border border-slate-300 bg-white flex items-center justify-center group-hover:border-blue-500 transition-colors shadow-sm">
                    <Play className="h-5 w-5 text-slate-700 group-hover:text-blue-600 fill-current ml-0.5" />
                  </div>
                  <span className="font-semibold text-base text-slate-600 group-hover:text-blue-700 transition-colors">See How It Works</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="lg:w-1/2 relative w-full flex justify-center perspective-1000 slide-up-anim" style={{ animationDelay: '0.5s' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] opacity-60" />
              
              <div className="relative z-20 float-anim">
                 <div className="relative w-[340px] sm:w-[420px] bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 p-5 border border-white/60 overflow-hidden group hover:shadow-blue-200/50 transition-shadow duration-500">
                    <div className="h-[380px] w-full bg-linear-to-br from-slate-100 to-slate-200 rounded-4xl overflow-hidden relative flex items-center justify-center">
                       <img 
                         src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" 
                         alt="Hero Product" 
                         className="w-4/5 h-auto object-contain mix-blend-multiply transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 ease-out drop-shadow-2xl"
                       />
                       <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 border border-slate-200 shadow-sm">
                         Best Seller
                       </div>
                    </div>
                    
                    <div className="mt-5 px-3 pb-2">
                       <div className="flex justify-between items-start">
                          <div>
                             <h3 className="font-bold text-slate-900 text-xl">Sony WH-1000XM5</h3>
                             <p className="text-slate-500 text-sm font-medium">Noise Cancelling</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                             <Star className="h-4 w-4 fill-current" />
                             <span className="text-sm font-bold text-slate-900">4.9</span>
                          </div>
                       </div>
                       <div className="flex justify-between items-center mt-4">
                          <span className="font-black text-2xl text-slate-900">₹24,999</span>
                          <Button size="sm" className="rounded-full bg-slate-900 hover:bg-slate-800 h-10 px-6 font-bold text-white">Buy</Button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. Trust Features --- */}
      <div className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Super Fast Delivery", desc: "Get your order in 24 hours" },
              { icon: ShieldCheck, title: "Secure Payment", desc: "100% secure payment gateways" },
              { icon: Zap, title: "Top-Notch Support", desc: "We are here to help 24/7" }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-5 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                <div className="p-4 rounded-2xl bg-white text-blue-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900">{feature.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 3. TRENDING PRODUCTS --- */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-blue-600 font-bold tracking-wider text-xs uppercase bg-blue-100 px-3 py-1 rounded-full flex items-center w-fit gap-1 mb-2">
                <TrendingUp className="h-3 w-3" /> Hot Right Now
              </span>
              <h2 className="section-title">Trending Products</h2>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="rounded-full border-slate-300 hover:bg-white hover:border-blue-300 px-6 font-semibold">
                View All
              </Button>
            </Link>
          </div>

          {loading ? <ProductSkeleton /> : 
            trendingProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {trendingProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : <p className="text-center text-slate-500">No trending items found.</p>
          }
        </div>
      </section>

      {/* --- 4. NEW ARRIVALS --- */}
      <section className="py-24 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-purple-600 font-bold tracking-wider text-xs uppercase bg-purple-100 px-3 py-1 rounded-full flex items-center w-fit gap-1 mb-2">
                <Clock className="h-3 w-3" /> Just Dropped
              </span>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link to="/shop?sort=newest">
               <Button variant="outline" className="rounded-full">See Newest</Button>
            </Link>
          </div>

          {loading ? <ProductSkeleton /> : 
            newArrivals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {newArrivals.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : <p className="text-center text-slate-500">No new arrivals found.</p>
          }
        </div>
      </section>

      {/* --- 5. TOP RATED --- */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-amber-600 font-bold tracking-wider text-xs uppercase bg-amber-100 px-3 py-1 rounded-full flex items-center w-fit gap-1 mb-2">
                <Star className="h-3 w-3 fill-current" /> Customer Favorites
              </span>
              <h2 className="section-title">Top Rated</h2>
            </div>
            <Link to="/shop?sort=rating">
               <Button variant="outline" className="rounded-full">View Top Rated</Button>
            </Link>
          </div>

          {loading ? <ProductSkeleton /> : 
            topRated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {topRated.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : <p className="text-center text-slate-500">No top rated items found.</p>
          }
        </div>
      </section>

      {/* --- 6. Newsletter --- */}
      <section className="py-24 px-6 bg-white border-t border-slate-200">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-slate-300">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
               <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px]"></div>
               <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"></div>
            </div>
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Join the <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">Club</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
                Get exclusive access to new drops, secret sales, and limited edition products directly in your inbox.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto pt-6">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="grow px-8 py-4 rounded-full text-slate-900 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all font-medium" 
                />
                <Button size="lg" className="rounded-full px-10 h-14 bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-900/20 font-bold transition-all border-none text-lg">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-6 font-medium">No spam, ever. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;