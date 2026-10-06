import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminCustomers.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('navigate(`/admin/customers/${c.id}/orders`);', 'navigate(`/admin/customers/${c.id}/orders`, { state: { customer: c } });')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Patched navigate with state!')
