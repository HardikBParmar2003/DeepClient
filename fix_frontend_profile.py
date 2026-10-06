import re

filepath = r"D:\deep clothes\client\src\pages\admin\AdminProfile.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initial state to include password
state_find = """  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: '',"""
state_replace = """  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',"""
content = content.replace(state_find, state_replace)

# 2. Reset password field after update
submit_find = """      if (data.success) {
        setUser(data.data);"""
submit_replace = """      if (data.success) {
        setUser(data.data);
        setProfileData(prev => ({ ...prev, password: '' }));"""
content = content.replace(submit_find, submit_replace)

# 3. Add password input field to form
mobile_input = """                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
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
              </div>"""
              
password_input = """                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
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
              </div>"""

content = content.replace(mobile_input, password_input)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added password field to AdminProfile.jsx")
