import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Actions
import { fetchAddresses, addAddress, deleteAddress, setDefaultAddress, updateAddress } from "../Store/addressSlice";
import { createRazorpayOrder, verifyPayment } from "../Store/orderSlice";

// Components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

// Icons & Utils
import { 
  MapPin, Plus, Trash2, CheckCircle, Loader2, CreditCard, 
  ShoppingBag, Phone, Home, Edit2, ShieldCheck, ArrowRight, X 
} from "lucide-react";
import { formatPrice } from "../Utils/helper.js";
import { loadRazorpay } from "../Utils/loadRazorpay";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux State Access
  const { addressList = [], loading: addressLoading } = useSelector((state) => state.address || {});
  const { cartItems = [] } = useSelector((state) => state.cart || {});
  const { user } = useSelector((state) => state.user || {});
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "", phone: "", street: "", city: "", state: "", pincode: "", country: "India", isDefault: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);

  // 1. Fetch Addresses on Load
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, user]);

  // 2. Auto-select Logic
  useEffect(() => {
    if (addressList.length > 0) {
      const currentSelected = selectedAddress ? addressList.find(addr => addr._id === selectedAddress._id) : null;
      
      if (!currentSelected) {
          const defaultAddr = addressList.find(addr => addr.isDefault) || addressList[0];
          setSelectedAddress(defaultAddr);
      } else {
          setSelectedAddress(currentSelected);
      }
    } else {
        setSelectedAddress(null);
    }
  }, [addressList]);

  // Calculations
  const validCartItems = Array.isArray(cartItems) ? cartItems : [];
  const subTotal = validCartItems.reduce((acc, item) => {
     const productData = item.productId || {};
     const price = productData.price || item.priceAtAddTime || 0;
     return acc + (price * item.quantity);
  }, 0);
  const tax = subTotal * 0.18;
  const totalAmount = subTotal + tax;

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleEdit = (addr) => {
    setEditAddressId(addr._id);
    setIsEditing(true);
    setFormData({
      name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, 
      state: addr.state, pincode: addr.pincode, country: addr.country, isDefault: addr.isDefault
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let success = false;
    if (isEditing) {
      success = await dispatch(updateAddress(editAddressId, formData));
    } else {
      success = await dispatch(addAddress(formData));
    }
    
    if (success) {
      setShowAddForm(false);
      setIsEditing(false);
      setFormData({ name: "", phone: "", street: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
    }
  };

  const handleDelete = (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      dispatch(deleteAddress(addressId)); 
    }
  };

  // 🔥 CORE PAYMENT LOGIC
  const handlePayment = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address!");
      return;
    }

    setPaymentProcessing(true);

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load.");
      setPaymentProcessing(false);
      return;
    }

    // 1. Amount Rounding (Crucial for Razorpay)
    const finalAmount = Math.round(totalAmount);

    // 2. Create Order on Backend
    const orderData = await dispatch(createRazorpayOrder(finalAmount, selectedAddress._id));
    
    if (!orderData || !orderData.success) {
      alert("Failed to create order. Please try again.");
      setPaymentProcessing(false);
      return;
    }

    // 3. Open Razorpay Popup
    // Backend se 'razorpayOrder' object milta hai
    const { razorpayOrder } = orderData; 

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "ShopEcom",
      description: "Secure Payment",
      order_id: razorpayOrder.id,
      // Removed 'image' property to prevent ERR_INVALID_URL
      
      handler: async function (response) {
        const paymentData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          addressId: selectedAddress._id,
        };

        const isSuccess = await dispatch(verifyPayment(paymentData));
        if (isSuccess) navigate("/order-success");
        else alert("Payment Verification Failed!");
        setPaymentProcessing(false);
      },
      
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: selectedAddress?.phone,
      },
      theme: { color: "#2563eb" },
      modal: { ondismiss: function() { setPaymentProcessing(false); } }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response){
        console.error("Payment Failed Error:", response.error);
        alert(`Payment Failed: ${response.error.description}`);
        setPaymentProcessing(false);
    });
    rzp1.open();
  };

  if (validCartItems.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800">Your cart is empty!</h2>
        <Button variant="link" onClick={() => navigate("/shop")}>Go to Shop</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:px-8 font-sans pb-24">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Address Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Shipping Address</h2>
                <p className="text-sm text-slate-500 mt-1">Select where you want your order delivered.</p>
              </div>
              {!showAddForm && (
                 <Button onClick={() => { setShowAddForm(true); setIsEditing(false); setFormData({ name: "", phone: "", street: "", city: "", state: "", pincode: "", country: "India", isDefault: false }); }} variant="outline" className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50">
                   <Plus className="w-4 h-4 mr-2" /> Add New
                 </Button>
              )}
            </div>

            {/* Form */}
            {showAddForm && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex flex-row justify-between items-center">
                    <CardTitle className="text-lg font-bold text-slate-800">
                      {isEditing ? "Edit Address" : "Add New Address"}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)} className="h-8 w-8 rounded-full hover:bg-slate-200"><X className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSave} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-1.5"><Label className="text-slate-600">Full Name</Label><Input name="name" value={formData.name} onChange={handleChange} required placeholder="Receiver Name" className="h-11 bg-slate-50 focus:bg-white" /></div>
                         <div className="space-y-1.5"><Label className="text-slate-600">Phone Number</Label><Input name="phone" value={formData.phone} onChange={handleChange} required placeholder="10 Digit Phone" className="h-11 bg-slate-50 focus:bg-white" /></div>
                      </div>

                      <div className="space-y-1.5"><Label className="text-slate-600">Street Address</Label><Input name="street" value={formData.street} onChange={handleChange} required placeholder="Flat No, Building, Area..." className="h-11 bg-slate-50 focus:bg-white" /></div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5"><Label className="text-slate-600">City</Label><Input name="city" value={formData.city} onChange={handleChange} required placeholder="City" className="h-11 bg-slate-50 focus:bg-white" /></div>
                        <div className="space-y-1.5"><Label className="text-slate-600">State</Label><Input name="state" value={formData.state} onChange={handleChange} required placeholder="State" className="h-11 bg-slate-50 focus:bg-white" /></div>
                        <div className="space-y-1.5"><Label className="text-slate-600">Pincode</Label><Input name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="Pincode" className="h-11 bg-slate-50 focus:bg-white" /></div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="isDefault" className="text-sm font-medium text-slate-600 cursor-pointer">Set as default address</label>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                        <Button type="submit" className="bg-slate-900 hover:bg-blue-600 text-white min-w-[140px] h-11 rounded-lg transition-colors">
                          {addressLoading ? <Loader2 className="animate-spin h-4 w-4" /> : isEditing ? "Update Address" : "Save Address"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Address List */}
            <div className="grid grid-cols-1 gap-4">
              {addressList.map((addr) => (
                <div 
                  key={addr._id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedAddress?._id === addr._id 
                      ? "border-blue-600 bg-blue-50/30 shadow-lg shadow-blue-100 scale-[1.01]" 
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-full ${selectedAddress?._id === addr._id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-slate-900 text-lg">{addr.name}</p>
                          {addr.isDefault && <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Default</span>}
                        </div>
                        <p className="text-slate-600 mt-1.5 leading-relaxed">{addr.street}, {addr.city}</p>
                        <p className="text-slate-600">{addr.state} - {addr.pincode}</p>
                        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-lg w-fit">
                           <Phone className="h-3.5 w-3.5" /> {addr.phone}
                        </div>
                      </div>
                    </div>
                    
                    {selectedAddress?._id === addr._id && (
                      <div className="text-blue-600 bg-white rounded-full p-1 shadow-sm">
                        <CheckCircle className="h-6 w-6 fill-blue-600 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {selectedAddress?._id !== addr._id && (
                       <>
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEdit(addr); }} className="h-8 w-8 bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-blue-600 rounded-lg">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(addr._id); }} className="h-8 w-8 bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-red-600 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                       </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-none shadow-2xl rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-slate-100/60">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  Order Summary
                </h2>
                
                <div className="space-y-4 text-sm text-slate-600 mb-6">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 text-base">{formatPrice(subTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">FREE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tax (GST 18%)</span>
                    <span className="font-semibold text-slate-900">{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-slate-100 pt-6 mb-8 flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-800">Total Amount</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tight">{formatPrice(totalAmount)}</span>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white shadow-xl hover:shadow-blue-200 font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  onClick={handlePayment}
                  disabled={!selectedAddress || paymentProcessing}
                >
                  {paymentProcessing ? (
                    <><Loader2 className="animate-spin h-5 w-5" /> Processing...</>
                  ) : (
                    <>Pay Now <CreditCard className="h-5 w-5" /></>
                  )}
                </Button>
                
                {/* Visual Feedback */}
                {!selectedAddress ? (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700 animate-pulse">
                     <MapPin className="h-5 w-5" />
                     <p className="text-xs font-bold">Please select an address to proceed</p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                     <div className="bg-green-500 rounded-full p-0.5 mt-0.5"><CheckCircle className="h-3 w-3 text-white" /></div>
                     <div>
                        <p className="text-xs font-bold text-green-800 uppercase mb-0.5">Delivering To:</p>
                        <p className="text-xs font-semibold text-slate-700 line-clamp-1">{selectedAddress.name}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{selectedAddress.street}, {selectedAddress.city}</p>
                     </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" /> 100% Secure Payment powered by Razorpay
                  </p>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;