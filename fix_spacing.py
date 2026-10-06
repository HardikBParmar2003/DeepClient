import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminSellerPurchases.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = r'return \(\s*<div className="space-y-8 animate-fade-in">'
end_marker = r'<div className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-xl p-6 shadow-\[var\(--shadow-card\)\]">\s*<div className="overflow-x-auto">\s*<table className="w-full text-left border-collapse">'

# We need to find the slice between start_marker and end_marker
match = re.search(f'({start_marker})[\\s\\S]*?({end_marker})', text)

new_layout = r'''return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <Link to="/admin/sellers" className="text-luxury-gold hover:text-luxury-gold-dark transition-colors flex items-center gap-2 mb-2 uppercase tracking-widest text-xs">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Sellers
          </Link>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">
            {seller ? seller.name : 'Loading...'}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage purchases for this seller</p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-4 rounded-xl shadow-[var(--shadow-card)]">
              <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block mb-1 font-medium">Total Bill</span>
              <span className="text-2xl font-semibold text-luxury-gold">{"\u20B9"}{totalBill.toFixed(2)}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-4 rounded-xl shadow-[var(--shadow-card)]">
              <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block mb-1 font-medium">Total Advance</span>
              <span className="text-2xl font-semibold text-green-400">{"\u20B9"}{totalAdvance.toFixed(2)}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-4 rounded-xl shadow-[var(--shadow-card)]">
              <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block mb-1 font-medium">Total Due</span>
              <span className="text-2xl font-semibold text-red-400">{"\u20B9"}{totalDue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <button 
            onClick={openAddModal}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0 h-[42px]"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Purchase
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center border-b border-[var(--border-color)] pb-4">
        <h2 className="text-sm tracking-widest uppercase text-[var(--text-secondary)]">Purchase History</h2>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">From</span>
            <div className="w-40">
              <CustomDatePicker 
                value={startDate ? new Date(startDate) : null}
                onChange={(date) => {
                  if(!date) { setStartDate(''); return; }
                  const d = new Date(date);
                  setStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                  setPage(1);
                }}
                placeholder="Start Date"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">To</span>
            <div className="w-40">
              <CustomDatePicker 
                value={endDate ? new Date(endDate) : null}
                onChange={(date) => {
                  if(!date) { setEndDate(''); return; }
                  const d = new Date(date);
                  setEndDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                  setPage(1);
                }}
                placeholder="End Date"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">'''

text = text[:match.start()] + new_layout + text[match.end():]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed extreme spacing!')
