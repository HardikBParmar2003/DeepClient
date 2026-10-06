import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminDashboard.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the edit button click handler
old_edit_btn = r'''onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsEditing(true); }}'''
new_edit_btn = r'''onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders?edit=${order.id}`); }}'''

text = text.replace(old_edit_btn, new_edit_btn)

# Remove EditOrderModal import and JSX block
text = re.sub(r'import EditOrderModal from \'../../components/shared/EditOrderModal\';\s*', '', text)
text = re.sub(r'\{isEditing && selectedOrder && \([\s\S]*?<EditOrderModal[\s\S]*?/>\s*\)\}', '', text)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Patched AdminDashboard edit button!')
