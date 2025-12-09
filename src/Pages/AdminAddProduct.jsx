import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Upload, X, ArrowLeft, Save, Sparkles } from "lucide-react";

// Custom Animation Styles
const formStyles = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .form-animate { animation: slideUp 0.5s ease-out forwards; }
  .image-hover:hover .remove-btn { opacity: 1; }
`;

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL se ID nikalo (agar Edit mode hai)
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); // Data fetch loading state

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
  });

  const [images, setImages] = useState([]); // New files to upload
  const [previews, setPreviews] = useState([]); // Previews for UI (New Images)
  const [oldImages, setOldImages] = useState([]); // Existing URLs (Edit mode only)
  const [imagesToDelete, setImagesToDelete] = useState([]); // URLs to delete from backend

  // --- 1. Fetch Data if Edit Mode ---
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        setFetching(true);
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/single-product/${id}`,
            { withCredentials: true }
          );

          if (response.data.success) {
            const prod = response.data.product;
            setFormData({
              title: prod.title,
              description: prod.description,
              price: prod.price,
              category: prod.category,
              brand: prod.brand,
              stock: prod.stock,
            });
            setOldImages(prod.productImages || []); 
          }
        } catch (error) {
          console.error("Fetch Error:", error);
          if (error.response?.status === 401) {
             alert("Session expired. Please login again.");
             navigate("/admin/login");
          } else {
             alert("Failed to fetch product details");
          }
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, navigate]);

  // --- 2. Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Nayi Images select karna
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Nayi Image remove karna (Upload hone se pehle)
  const removeNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  // 🔥 OLD IMAGE REMOVE HANDLER
  const removeOldImage = (imageVal) => {
    // 1. UI se hatao (oldImages state update karo)
    setOldImages(oldImages.filter((img) => img !== imageVal));
    
    // 2. Delete list mein daalo (Backend ko batane ke liye)
    setImagesToDelete((prev) => [...prev, imageVal]);
  };

  // --- 3. Submit Form ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Text fields append karo
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Nayi images append karo
      images.forEach((image) => {
        data.append("productImages", image);
      });

      // 🔥 Images To Delete (Agar koi purani image delete karni hai)
      if (imagesToDelete.length > 0) {
        // Array ko loop karke append karo, backend array expect karega ya multiple values
        imagesToDelete.forEach((url) => {
            data.append("deleteImages", url);
        });
      }

      let response;
      if (isEditMode) {
        // 🔥 UPDATE API CALL
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/update-product/${id}`,
          data,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        // 🔥 CREATE API CALL
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/create-product`,
          data,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      if (response.data.success) {
        alert(isEditMode ? "Product Updated Successfully!" : "Product Created Successfully!");
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans">
      <style>{formStyles}</style>
      
      <div className="mx-auto max-w-4xl space-y-6 form-animate">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")} className="rounded-full hover:bg-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              {isEditMode ? "Edit Product" : "Add New Product"}
              <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </h1>
            <p className="text-slate-500 text-sm">
              {isEditMode ? "Existing product ki details update karein." : "Naya product list karne ke liye details bharein."}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-none overflow-hidden rounded-2xl">
          <CardHeader className="bg-linear-to-r from-slate-900 to-slate-800 p-6">
            <CardTitle className="text-white text-lg font-medium">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Row 1: Title & Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-600">Product Title</Label>
                  <Input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g. Sony Wireless Headphones" 
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Brand Name</Label>
                  <Input 
                    name="brand" 
                    value={formData.brand} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g. Sony" 
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Row 2: Description */}
              <div className="space-y-2">
                <Label className="text-slate-600">Description</Label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y"
                  placeholder="Describe the product features, specs, etc..."
                />
              </div>

              {/* Row 3: Pricing & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-600">Price (₹)</Label>
                  <Input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    required 
                    className="h-11 font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Stock Quantity</Label>
                  <Input 
                    type="number" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleChange} 
                    required 
                    className="h-11 font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Category</Label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select Category</option>
                    <option value="mobiles">Mobiles</option>
                    <option value="laptops">Laptops</option>
                    <option value="fashion">Fashion</option>
                    <option value="electronics">Electronics</option>
                    <option value="home">Home</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Images */}
              <div className="space-y-4">
                <Label className="text-slate-600">Product Images</Label>
                
                {/* Upload Box */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleImageChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-3 transition-transform group-hover:scale-105">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG (Max 5 files)</p>
                    </div>
                  </div>
                </div>

                {/* Previews (Old + New) */}
                {(previews.length > 0 || oldImages.length > 0) && (
                  <div className="flex gap-4 overflow-x-auto py-4 px-2">
                    
                    {/* 🔥 OLD IMAGES (With Delete Button) */}
                    {oldImages.map((src, index) => (
                      <div key={`old-${index}`} className="relative w-28 h-28 shrink-0 border rounded-xl overflow-hidden shadow-sm group image-hover">
                        <img src={src} alt="old" className="w-full h-full object-cover" />
                        
                        {/* Overlay Label */}
                        <div className="absolute inset-0 bg-black/10 transition-opacity flex items-end justify-center pb-1">
                          <span className="text-[10px] bg-black/50 text-white px-2 rounded">Existing</span>
                        </div>

                        {/* 🔥 Cross Button to Delete Old Image */}
                        <button 
                          type="button" 
                          onClick={() => removeOldImage(src)}
                          className="remove-btn absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 transition-opacity shadow-md hover:bg-red-700 z-20"
                          title="Delete this image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* New Images (With Remove Button) */}
                    {previews.map((src, index) => (
                      <div key={`new-${index}`} className="relative w-28 h-28 shrink-0 border-2 border-blue-500 rounded-xl overflow-hidden shadow-md group image-hover animate-in fade-in zoom-in duration-300">
                        <img src={src} alt="new" className="w-full h-full object-cover" />
                        
                        {/* Remove New Image Button */}
                        <button 
                          type="button" 
                          onClick={() => removeNewImage(index)}
                          className="remove-btn absolute top-1 right-1 bg-slate-800 text-white rounded-full p-1 opacity-0 transition-opacity shadow-sm hover:bg-slate-900"
                          title="Remove from upload"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-medium bg-slate-900 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all rounded-xl" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {isEditMode ? "Updating..." : "Creating..."}</>
                  ) : (
                    <><Save className="mr-2 h-5 w-5" /> {isEditMode ? "Update Product" : "Publish Product"}</>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAddProduct;