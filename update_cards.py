import os

filepath = r'D:\deep clothes\client\src\pages\admin\AdminOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '<div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">'
end_marker = '<CustomPagination'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers.")
else:
    replacement = r'''      {/* Cards Grid View */}
      {loading ? (
        <div className="py-12 text-center text-[var(--text-muted)] tracking-widest uppercase border border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)]">
          Loading orders...
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="py-12 text-center text-[var(--text-muted)] border border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)]">
          No orders found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedOrders.map((order, index) => {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            const due = parseFloat(order.totalAmount) - parseFloat(order.advance);
            const serialNumber = (page - 1) * limit + index + 1;
            
            return (
              <div 
                key={order.id} 
                className="bg-[var(--bg-card)]/50 backdrop-blur-md border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)] hover:border-luxury-gold/50 transition-all group flex flex-col cursor-pointer"
                onClick={(e) => {
                  if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; 
                  const viewBtn = e.currentTarget.querySelector('button[title="View"]'); 
                  if(viewBtn) viewBtn.click();
                }}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--text-muted)]">#{serialNumber}</span>
                    <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">ID: {order.id}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedOrderForView(order); }}
                      className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-1.5 rounded border border-luxury-gold/30 bg-luxury-gold/10"
                      title="View"
                    >
                      <HiOutlineEye className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditModal(order); }}
                      className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors p-1.5 rounded border border-luxury-gold/30 bg-luxury-gold/10"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                      className="text-red-400 hover:text-white hover:bg-red-500 transition-colors p-1.5 rounded border border-red-500/30 bg-red-500/10"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 space-y-5">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">{order.name || order.customer?.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-[var(--text-muted)]/10 flex items-center justify-center"></span>
                      {order.customer?.mobile}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-medium tracking-widest uppercase border ${
                      order.orderStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {order.orderStatus || 'Pending'}
                    </span>
                    <span className={`px-2 py-1 rounded text-[10px] font-medium tracking-widest uppercase border ${
                      order.paymentStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                    <span className="px-2 py-1 rounded text-[10px] font-medium tracking-widest uppercase border border-luxury-gold/30 bg-luxury-gold/10 text-luxury-gold">
                      {items.length} Items
                    </span>
                  </div>

                  {/* Dates Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Order Date</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{new Date(order.orderDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Delivery Date</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{new Date(order.deliverDate).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Total Amount</p>
                    <p className="text-lg font-medium text-luxury-gold">{"\u20B9"}{parseFloat(order.totalAmount).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${due <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Due: {"\u20B9"}{due.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      '''
    
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully sliced and replaced!")
