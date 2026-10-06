import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Thead
thead_pattern = re.compile(r'<thead>.*?</thead>', re.DOTALL)
thead_replacement = '''<thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">#</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Client Details</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Order Date</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Delivery Date</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Order Status</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Pay Status</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Total</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Actions</th>
                </tr>
              </thead>'''
content = thead_pattern.sub(lambda m: thead_replacement, content)

# Replace Colspan 6 -> Colspan 8
content = content.replace('colSpan="6"', 'colSpan="8"')

# Replace table body rows
tbody_tds_pattern = re.compile(r'<td className="px-6 py-4 text-\[var\(--text-muted\)\] font-medium">.*?<td className="px-6 py-4">.*?<div className="flex items-center justify-end gap-2">', re.DOTALL)
tbody_tds_replacement = '''<td className="px-6 py-4 text-[var(--text-muted)] font-medium">
                          {serialNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-[var(--text-primary)]">{order.name || order.customer?.name}</div>
                          <div className="text-sm text-[var(--text-secondary)]">{order.customer?.mobile}</div>
                          <div className="text-[10px] text-luxury-gold mt-1.5 bg-luxury-gold/10 inline-block px-2 py-0.5 rounded border border-luxury-gold/20 uppercase tracking-widest">{items.length} Items</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[var(--text-primary)] font-medium">{new Date(order.orderDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[var(--text-primary)] font-medium">{new Date(order.deliverDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-medium tracking-widest uppercase border ${
                            order.orderStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {order.orderStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-medium tracking-widest uppercase border ${
                            order.paymentStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-[var(--text-primary)] font-medium">{"\\u20B9"}{parseFloat(order.totalAmount).toFixed(2)}</div>
                          <div className={`text-xs mt-1 font-medium ${due <= 0 ? 'text-green-400' : 'text-red-400'}`}>Due: {"\\u20B9"}{due.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">'''
content = tbody_tds_pattern.sub(lambda m: tbody_tds_replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated table layout in AdminOrders.jsx')
