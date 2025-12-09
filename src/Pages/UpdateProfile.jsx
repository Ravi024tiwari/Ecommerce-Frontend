import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserAction, changePasswordAction } from "../Store/userSlice.js"; 
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Camera, Save, Loader2, Lock, User, Mail, Phone, ShieldCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", currentPassword: "", newPassword: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
      });
      setPreview(user.profileImage);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password Logic
    if (showPassword && formData.currentPassword && formData.newPassword) {
      const passResult = await dispatch(changePasswordAction({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }));
      if (!passResult.success) { alert(passResult.message); return; }
      alert("Password Updated!");
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      setShowPassword(false);
    }

    // Profile Logic
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    if (image) data.append("profileImage", image);

    const profileResult = await dispatch(updateUserAction(data));
    if (profileResult.success) alert("Profile Updated Successfully!");
    else if (!showPassword) alert(profileResult.message);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-5xl">
        
        {/* Page Title */}
        <div className="mb-8 animate-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile details and security.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left Column: Identity Card --- */}
          <div className="lg:col-span-1 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden text-center p-8 sticky top-24 ring-1 ring-slate-100">
              <div className="relative inline-block mb-6 group">
                <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-lg mx-auto">
                  <AvatarImage src={preview} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-slate-100 text-slate-400 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload Button Overlay */}
                <label htmlFor="profile-upload" className="absolute bottom-1 right-1 bg-slate-900 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-600 transition-all shadow-md hover:scale-110 active:scale-95">
                  <Camera className="h-5 w-5" />
                  <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-slate-500 mb-4">{user?.email}</p>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  user?.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                {user?.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {user?.role === 'admin' ? 'Administrator' : 'Verified Member'}
              </div>
            </Card>
          </div>

          {/* --- Right Column: Edit Form --- */}
          <div className="lg:col-span-2 animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-5 border-b border-slate-100 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-medium">Full Name</Label>
                        <div className="relative">
                           <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                           <Input name="name" value={formData.name} onChange={handleChange} className="pl-10 h-11 bg-slate-50 focus:bg-white transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-medium">Phone Number</Label>
                        <div className="relative">
                           <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                           <Input name="phone" value={formData.phone} onChange={handleChange} className="pl-10 h-11 bg-slate-50 focus:bg-white transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-slate-600 font-medium">Email Address</Label>
                        <div className="relative">
                           <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                           <Input value={formData.email} disabled className="pl-10 h-11 bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 ml-1">Email cannot be changed for security reasons.</p>
                      </div>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div>
                    <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-2">
                      <h3 className="text-lg font-bold text-slate-900">Security</h3>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-sm font-semibold"
                      >
                        {showPassword ? "Cancel Change" : "Change Password"}
                      </Button>
                    </div>

                    {showPassword && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <div className="space-y-2">
                          <Label className="text-slate-700">Current Password</Label>
                          <div className="relative">
                             <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                             <Input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="pl-9 bg-white" placeholder="••••••" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700">New Password</Label>
                          <div className="relative">
                             <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                             <Input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="pl-9 bg-white" placeholder="••••••" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="bg-slate-900 hover:bg-blue-600 text-white min-w-40 h-12 rounded-xl text-base font-bold shadow-xl hover:shadow-blue-200 transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? (
                        <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Saving...</>
                      ) : (
                        <><Save className="mr-2 h-5 w-5" /> Save Changes</>
                      )}
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;