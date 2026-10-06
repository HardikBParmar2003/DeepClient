import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Add a useEffect to check for 'edit' param
edit_effect = r'''
  // Check for edit param in URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && orders.length > 0) {
      const orderToEdit = orders.find(o => String(o.id) === String(editId));
      if (orderToEdit && !isModalOpen) {
        openEditModal(orderToEdit);
      }
    }
  }, [searchParams, orders]);

  // Reset page when filters change'''

text = text.replace('  // Reset page when filters change', edit_effect)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Patched AdminOrders to support edit param!')
