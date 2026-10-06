import os
import re

app_file = r"D:\deep clothes\client\src\App.jsx"
with open(app_file, 'r', encoding='utf-8') as f:
    content = f.read()

if "AdminProfitLoss" not in content:
    content = content.replace("import AdminSellerPurchases from './pages/admin/AdminSellerPurchases';", "import AdminSellerPurchases from './pages/admin/AdminSellerPurchases';\nimport AdminProfitLoss from './pages/admin/AdminProfitLoss';")
    
    route_injection = """
      <Route path="/admin/profit-loss" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminProfitLoss /></AdminLayout>
        </ProtectedRoute>
      } />
    """
    
    # insert before </Routes>
    content = content.replace("</Routes>", route_injection + "</Routes>")
    
    with open(app_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected route in App.jsx")

layout_file = r"D:\deep clothes\client\src\components\layout\AdminLayout.jsx"
with open(layout_file, 'r', encoding='utf-8') as f:
    content = f.read()

if "/admin/profit-loss" not in content:
    from_icon = "import { HiOutlineHome, HiOutlineUserGroup, HiOutlineViewGrid, HiOutlineBell, HiLogout, HiOutlineExternalLink, HiMenu, HiX, HiOutlineSun, HiOutlineMoon, HiOutlineShoppingBag, HiOutlineCog, HiOutlinePhotograph , HiOutlineUsers, HiOutlineShoppingCart} from 'react-icons/hi';"
    to_icon = "import { HiOutlineHome, HiOutlineUserGroup, HiOutlineViewGrid, HiOutlineBell, HiLogout, HiOutlineExternalLink, HiMenu, HiX, HiOutlineSun, HiOutlineMoon, HiOutlineShoppingBag, HiOutlineCog, HiOutlinePhotograph , HiOutlineUsers, HiOutlineShoppingCart, HiOutlineChartPie } from 'react-icons/hi';"
    content = content.replace(from_icon, to_icon)
    
    link_injection = """
              <Link to="/admin/profit-loss" onClick={closeSidebar} className={getLinkClasses('/admin/profit-loss')}>
                <HiOutlineChartPie className="h-5 w-5" />
                <span>Profit & Loss</span>
              </Link>
    """
    # Insert right after inventory link
    inventory_link_end = "<span>Inventory</span>\n              </Link>"
    content = content.replace(inventory_link_end, inventory_link_end + link_injection)
    
    with open(layout_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected link in AdminLayout.jsx")

