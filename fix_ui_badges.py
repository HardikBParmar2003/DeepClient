import os
import re

base_dir = r"D:\deep clothes\client\src\pages\admin"

# 1. Update View Eye Icon in Orders & Customers
files_with_eye = ['AdminOrders.jsx', 'AdminCustomers.jsx']
old_eye_class = 'className="text-[var(--text-secondary)] hover:text-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-[var(--input-bg)] p-2 rounded-md border border-[var(--border-color)]"'
new_eye_class = 'className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"'

for fname in files_with_eye:
    filepath = os.path.join(base_dir, fname)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace(old_eye_class, new_eye_class)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated View button in " + fname)

# 2. Update Total Orders Badge in AdminCustomers.jsx
cust_file = os.path.join(base_dir, 'AdminCustomers.jsx')
if os.path.exists(cust_file):
    with open(cust_file, 'r', encoding='utf-8') as f:
        content = f.read()
    old_cust_badge = 'className="px-2 py-1 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-md text-xs font-medium tracking-wider text-[var(--text-primary)]"'
    new_cust_badge = 'className="px-2 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-md text-xs font-medium tracking-wider text-luxury-gold"'
    content = content.replace(old_cust_badge, new_cust_badge)
    with open(cust_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Total Orders badge in AdminCustomers.jsx")

# 3. Update Shirt/Pant Badge in AdminInventory.jsx
inv_file = os.path.join(base_dir, 'AdminInventory.jsx')
if os.path.exists(inv_file):
    with open(inv_file, 'r', encoding='utf-8') as f:
        content = f.read()
    old_inv_badge = 'className="px-2 py-1 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-md text-xs font-medium tracking-wider uppercase"'
    new_inv_badge = 'className="px-2 py-1 bg-luxury-gold/10 border border-luxury-gold/30 rounded-md text-xs font-medium tracking-wider uppercase text-luxury-gold"'
    content = content.replace(old_inv_badge, new_inv_badge)
    with open(inv_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Shirt/Pant badge in AdminInventory.jsx")

