import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminCustomerOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix date
text = text.replace('new Date(order.created_at)', 'new Date(order.orderDate)')

# 2. Fix status
text = text.replace('order.status', 'order.orderStatus')

# 3. Fix pay_status
text = text.replace('order.pay_status', 'order.paymentStatus')

# 4. Fix total_price
text = text.replace('order.total_price', 'order.totalAmount')

# 5. Fix View Button
old_view_btn = r'''onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/${customer.id}/orders/${order.id}`); }}'''
new_view_btn = r'''onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}'''
text = text.replace('onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/${customer.id}/orders/${order.id}`); }}', 'onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}')

# 6. Stop row click from breaking buttons
old_row = r'''onClick={() => setSelectedOrder(order)} className="hover:bg-\[var\(--border-color\)\] transition-colors cursor-pointer group"'''
new_row = r'''onClick={(e) => { 
                      if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; 
                      setSelectedOrder(order); 
                    }} className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer group"'''

text = re.sub(r'onClick=\{\(\) => setSelectedOrder\(order\)\}\s+className="hover:bg-\[var\(--border-color\)\] transition-colors cursor-pointer group"', new_row, text)

# 7. Make the pill badges lowercase for the check if they were uppercase in DB
# In DB, they are "Completed", "Pending", etc.
# In the code, it's checking `order.orderStatus === 'completed'`. We should use `.toLowerCase()` or check for Capitalized.
# Let's fix the pill logic using regex
text = text.replace("order.orderStatus === 'completed'", "order.orderStatus?.toLowerCase() === 'completed'")
text = text.replace("order.orderStatus === 'pending'", "order.orderStatus?.toLowerCase() === 'pending'")
text = text.replace("order.orderStatus === 'processing'", "order.orderStatus?.toLowerCase() === 'processing'")
text = text.replace("order.orderStatus === 'cancelled'", "order.orderStatus?.toLowerCase() === 'cancelled'")

text = text.replace("order.paymentStatus === 'completed'", "order.paymentStatus?.toLowerCase() === 'completed'")
text = text.replace("order.paymentStatus === 'pending'", "order.paymentStatus?.toLowerCase() === 'pending'")
text = text.replace("order.paymentStatus === 'partially'", "order.paymentStatus?.toLowerCase() === 'partially'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed schema mappings in AdminCustomerOrders!')
