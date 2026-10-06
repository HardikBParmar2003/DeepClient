import os

filepath = r'D:\deep clothes\client\src\pages\admin\AdminOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '{/* Sleek Minimalist Table View */}'
end_marker = '<CustomPagination'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers.")
else:
    replacement = r'''<div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">#</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Client Details</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Order Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Delivery Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Order Status</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Pay Status</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Total</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-[var(--text-muted)] tracking-widest uppercase">
                    Loading orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => {
                  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                  const due = parseFloat(order.totalAmount) - parseFloat(order.advance);
                  const serialNumber = (page - 1) * limit + index + 1;
                  
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                      onClick={(e) => {
                        if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; 
                        const editBtn = e.currentTarget.querySelector('button[title="View"]') || e.currentTarget.querySelector('button[title="View Details"]') || e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]'); 
                        if(editBtn) editBtn.click();
                      }}
                    >
                      <td className="px-6 py-4 text-[var(--text-muted)] font-medium">
                        {serialNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--text-primary)]">{order.name || order.customer?.name}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{order.customer?.mobile}</div>
                        <div className="text-xs text-luxury-gold mt-1 bg-luxury-gold/10 inline-block px-2 py-0.5 rounded border border-luxury-gold/20 tracking-widest">{items.length} Items</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text-primary)]">{new Date(order.orderDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text-primary)]">{new Date(order.deliverDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium tracking-wider uppercase border ${
                          order.orderStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium tracking-wider uppercase border ${
                          order.paymentStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-[var(--text-primary)] font-medium">{"\\u20B9"}{parseFloat(order.totalAmount).toFixed(2)}</div>
                        <div className={`text-xs mt-1 ${due <= 0 ? 'text-green-400' : 'text-red-400'}`}>Due: {"\\u20B9"}{due.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedOrderForView(order); }}
                            className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors flex items-center justify-center cursor-pointer bg-luxury-gold/10 p-2 rounded-md border border-luxury-gold/30"
                            title="View"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(order); }}
                            className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-2 rounded-md border border-luxury-gold/30 bg-luxury-gold/10"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                            className="text-red-400 hover:text-white hover:bg-red-500 transition-colors p-2 rounded-md border border-red-500/30 bg-red-500/10"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      '''
    
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully reverted to basic table layout with separated columns!")
