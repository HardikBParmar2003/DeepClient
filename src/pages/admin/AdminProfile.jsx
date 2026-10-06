import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const AdminProfile = () => {
  const { user, updateUser } = useContext(AuthContext) || {};

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    shopName: '',
    shopAddress: '',
    shopMobile: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        password: '',
        shopName: user.shopName || '',
        shopAddress: user.shopAddress || '',
        shopMobile: user.shopMobile || '',
        shopLogo: user.shopLogo || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { data } = await api.put('/auth/profile', profileData);
      if (data.success) {
        if (typeof updateUser === 'function') updateUser(data.data);
        setProfileData(prev => ({ ...prev, password: '' }));
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">Profile Settings</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">Manage your personal profile and shop business details</p>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Personal Details */}
          <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden shadow-[var(--shadow-card)] flex flex-col">
            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <h2 className="text-lg font-medium text-luxury-gold uppercase tracking-wider">Personal Details</h2>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 flex-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  name="mobile"
                  required
                  value={profileData.mobile}
                  onChange={handleProfileChange}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:outline-none transition-all"
                />
              </div>
              
              <div className="pt-4 border-t border-[var(--border-color)] mt-4">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Change Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={profileData.password}
                  onChange={handleProfileChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Business Details */}
          <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden shadow-[var(--shadow-card)] flex flex-col">
            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <h2 className="text-lg font-medium text-luxury-gold uppercase tracking-wider">Business Details</h2>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 flex-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Shop Logo (JPG, PNG)
                </label>
                <div className="flex items-center gap-4">
                  {profileData.shopLogo && (
                    <img src={`${api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000'}${profileData.shopLogo}`} alt="Shop Logo" className="w-28 h-28 min-w-[7rem] min-h-[7rem] aspect-square flex-shrink-0 object-cover bg-white rounded-full border border-[var(--border-color)] shadow-md" />
                  )}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('logo', file);
                      try {
                        const { data } = await api.post('/auth/upload-logo', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        if (data.success) {
                          setProfileData(prev => ({ ...prev, shopLogo: data.data.logoUrl }));
                          toast.success('Logo uploaded. Click Save Profile to apply.');
                        }
                      } catch (err) {
                        toast.error('Failed to upload logo');
                      }
                    }}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-luxury-gold/10 file:text-luxury-gold hover:file:bg-luxury-gold/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  name="shopName"
                  value={profileData.shopName}
                  onChange={handleProfileChange}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:outline-none transition-all"
                  placeholder="e.g. Deep Clothes"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Shop Address
                </label>
                <input
                  type="text"
                  name="shopAddress"
                  value={profileData.shopAddress}
                  onChange={handleProfileChange}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Shop Mobile
                </label>
                <input
                  type="text"
                  name="shopMobile"
                  value={profileData.shopMobile}
                  onChange={handleProfileChange}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="bg-luxury-gold text-black px-10 py-3 rounded-lg uppercase tracking-widest text-sm font-semibold hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfile;
