import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-slate-300 py-12 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
          
          {/* Brand Section (Bada Logo) */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
              🛍️ ShopEcom
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your premium destination for quality products. 
              Experience the best shopping journey with us.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">All Products</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Featured</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">FAQs</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Admin Area (Company Section) */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Company</h3>
            <div className="flex flex-col gap-3 text-sm">
               <p className="text-gray-500">&copy; {new Date().getFullYear()} ShopEcom Inc.</p>
               
               {/* Admin Link */}
               <Link 
                 to="/admin/login" 
                 className="text-gray-600 hover:text-white transition-colors mt-2 text-xs font-semibold flex items-center justify-center md:justify-start gap-2"
               >
                 <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                 Admin Access
               </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;