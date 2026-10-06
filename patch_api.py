import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminCustomerOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("api.get(`/admin/customers?search=${encodeURIComponent(customer.mobile)}`);", "api.get(`/customers?search=${encodeURIComponent(customer.mobile)}`);")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Patched API call!')
