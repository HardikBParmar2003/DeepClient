import re

filepath = r"D:\deep clothes\client\src\pages\admin\AdminProfile.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initial state and useEffect
state_find = """  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: ''
  });"""
state_replace = """  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: '',
    shopName: '',
    shopAddress: '',
    shopMobile: ''
  });"""
content = content.replace(state_find, state_replace)

effect_find = """      setProfileData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || ''
      });"""
effect_replace = """      setProfileData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        shopName: user.shopName || '',
        shopAddress: user.shopAddress || '',
        shopMobile: user.shopMobile || ''
      });"""
content = content.replace(effect_find, effect_replace)

# 2. Update API call and context update
api_find = """const { data } = await api.put(/users/, profileData);"""
api_replace = """const { data } = await api.put('/auth/profile', profileData);"""
content = content.replace(api_find, api_replace)

context_find = """        setUser(data.data);"""
context_replace = """        // Assuming updateUser is available in context, or just let useEffect reload
        if (typeof updateUser === 'function') updateUser(data.data);
        else window.location.reload();"""
# wait, better to use the updateUser from useContext(AuthContext)
content = content.replace(context_find, context_replace)

# We need to import AuthContext
if "import { AuthContext }" not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useContext } from 'react';\nimport { AuthContext } from '../../context/AuthContext';")
    content = content.replace("const AdminProfile = () => {", "const AdminProfile = () => {\n  const { updateUser } = useContext(AuthContext) || {};")

# 3. Add Business Details Section to the Personal Details form
# I'll just replace the form to include it.
form_end_find = """          </div>
          
          <div className="pt-6 border-t border-[var(--border-color)] flex justify-end">"""
business_fields = """          </div>
          
          <div className="pt-8 mt-8 border-t border-[var(--border-color)]">
            <h2 className="text-lg font-medium text-luxury-gold uppercase tracking-wider mb-6">Business Details</h2>
            <div className="space-y-4 max-w-xl">
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
          
          <div className="pt-6 border-t border-[var(--border-color)] flex justify-end">"""
content = content.replace(form_end_find, business_fields)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdminProfile.jsx")
