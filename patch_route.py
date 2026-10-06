filepath = r'D:\deep clothes\client\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Add import
if 'AdminCustomerOrders' not in text:
    text = text.replace("import AdminCustomers from './pages/admin/AdminCustomers';", "import AdminCustomers from './pages/admin/AdminCustomers';\nimport AdminCustomerOrders from './pages/admin/AdminCustomerOrders';")

# Add route
if 'customers/:id/orders' not in text:
    text = text.replace('<Route path="customers" element={<AdminCustomers />} />', '<Route path="customers" element={<AdminCustomers />} />\n          <Route path="customers/:id/orders" element={<AdminCustomerOrders />} />')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Registered AdminCustomerOrders route!')
