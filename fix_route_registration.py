import re

filepath = r'D:\deep clothes\client\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

route_to_add = r'''
      <Route path="/admin/customers/:id/orders" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout><AdminCustomerOrders /></AdminLayout>
        </ProtectedRoute>
      } />
'''

if '/admin/customers/:id/orders' not in text:
    target = r'''      <Route path="/admin/customers" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout><AdminCustomers /></AdminLayout>
          </ProtectedRoute>
        } />'''
    
    text = text.replace(target, target + route_to_add)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)
    print('Route correctly added!')
else:
    print('Route already exists!')
