import re

app_file = r"D:\deep clothes\client\src\App.jsx"
with open(app_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Import AdminProfile
if "AdminProfile" not in content:
    content = content.replace("import AdminProfitLoss from './pages/admin/AdminProfitLoss';", "import AdminProfitLoss from './pages/admin/AdminProfitLoss';\nimport AdminProfile from './pages/admin/AdminProfile';")
    
    route_injection = """
        <Route path="/admin/profile" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout><AdminProfile /></AdminLayout>
          </ProtectedRoute>
        } />
    """
    
    content = content.replace("</Routes>", route_injection + "</Routes>")
    with open(app_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected route in App.jsx")

layout_file = r"D:\deep clothes\client\src\components\layout\AdminLayout.jsx"
with open(layout_file, 'r', encoding='utf-8') as f:
    content = f.read()

if "/admin/profile" not in content:
    from_icon = "import { HiOutlineHome, HiOutlineUserGroup, HiOutlineViewGrid, HiOutlineBell, HiLogout, HiOutlineExternalLink, HiMenu, HiX, HiOutlineSun, HiOutlineMoon, HiOutlineShoppingBag, HiOutlineCog, HiOutlinePhotograph , HiOutlineUsers, HiOutlineShoppingCart, HiOutlineChartPie } from 'react-icons/hi';"
    to_icon = "import { HiOutlineHome, HiOutlineUserGroup, HiOutlineViewGrid, HiOutlineBell, HiLogout, HiOutlineExternalLink, HiMenu, HiX, HiOutlineSun, HiOutlineMoon, HiOutlineShoppingBag, HiOutlineCog, HiOutlinePhotograph , HiOutlineUsers, HiOutlineShoppingCart, HiOutlineChartPie, HiOutlineUserCircle } from 'react-icons/hi';"
    content = content.replace(from_icon, to_icon)
    
    link_injection = """
              <Link to="/admin/profile" onClick={closeSidebar} className={getLinkClasses('/admin/profile')}>
                <HiOutlineUserCircle className="h-5 w-5" />
                <span>My Profile</span>
              </Link>
    """
    # Insert right before Settings if exists, otherwise at the end before Logout
    logout_btn = """<button onClick={logout} className="w-full flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors p-2 rounded-md hover:bg-red-400/10 cursor-pointer">"""
    
    content = content.replace(logout_btn, link_injection + "\n              " + logout_btn)
    
    with open(layout_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected link in AdminLayout.jsx")

