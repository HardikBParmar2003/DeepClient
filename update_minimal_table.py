import os

filepath = r'D:\deep clothes\client\src\pages\admin\AdminOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '{/* Cards Grid View */}'
end_marker = '<CustomPagination'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers.")
else:
    replacement = r'''{/* Sleek Minimalist Table View */}
      <div className="bg-[var(--bg-card)]/50 backdrop-blur-md border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/80">
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] whitespace-nowrap">Order #</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Client</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] whitespace-nowrap">Order Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] whitespace-nowrap">Delivery Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)]">Payment</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Total</th>
                <th className="px-6 py-4 font-medium tracking-wider text-xs uppercase text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-[var(--text-muted)] tracking-widest uppercase">
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
                  
                  return (
                    <tr 
                      key={order.id} 
                      className="group hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                      onClick={(e) => {
                        if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; 
                        const viewBtn = e.currentTarget.querySelector('button[title="View"]'); 
                        if(viewBtn) viewBtn.click();
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[var(--text-primary)] font-medium text-sm">#{order.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[var(--text-primary)] whitespace-nowrap">{order.name || order.customer?.name}</div>
                        <div className="text-sm text-[var(--text-secondary)] whitespace-nowrap">{order.customer?.mobile}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{items.length} Items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-primary)] font-medium">{new Date(order.orderDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-primary)] font-medium">{new Date(order.deliverDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase border ${
                          order.orderStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase border ${
                          order.paymentStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="text-[var(--text-primary)] font-medium">{"\u20B9"}{parseFloat(order.totalAmount).toFixed(2)}</div>
                        <div className={`text-xs mt-0.5 font-medium ${due <= 0 ? 'text-green-400/70' : 'text-red-400/80'}`}>Due: {"\u20B9"}{due.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedOrderForView(order); }}
                            className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-1.5 rounded-md border border-luxury-gold/30 bg-luxury-gold/10"
                            title="View"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(order); }}
                            className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-1.5 rounded-md border border-luxury-gold/30 bg-luxury-gold/10"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                            className="text-red-400 hover:text-white hover:bg-red-500 transition-colors p-1.5 rounded-md border border-red-500/30 bg-red-500/10"
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
    print("Successfully replaced grid with sleek table!")
