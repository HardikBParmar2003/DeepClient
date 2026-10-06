import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminSellerPurchases.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove the old filters block from above the table
# Look for the `<div className="flex flex-col md:flex-row justify-between items-center border-b border-[var(--border-color)] pb-4">`
# down to the `table` wrapper.

old_filters_block_pattern = r'<div className="flex flex-col md:flex-row justify-between items-center border-b border-\[var\(--border-color\)\] pb-4">[\s\S]*?<h2 className="text-sm tracking-widest uppercase text-\[var\(--text-secondary\)\]">Purchase History</h2>[\s\S]*?<div className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-xl p-6 shadow-\[var\(--shadow-card\)\]">'

new_history_header = r'''<div className="flex flex-col md:flex-row justify-between items-center border-b border-[var(--border-color)] pb-4 mt-8">
        <h2 className="text-sm tracking-widest uppercase text-[var(--text-secondary)]">Purchase History</h2>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-[var(--shadow-card)]">'''

text = re.sub(old_filters_block_pattern, new_history_header, text)

# 2. Add the filters right beside the Add Purchase button
old_button_block = r'''        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <button 
            onClick={openAddModal}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0 h-\[42px\]"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Purchase
          </button>
        </div>'''

new_button_block = r'''        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <CustomDatePicker 
              label="From"
              value={startDate}
              onChange={(date) => { setStartDate(date || ''); setPage(1); }}
            />
            <CustomDatePicker 
              label="To"
              value={endDate}
              onChange={(date) => { setEndDate(date || ''); setPage(1); }}
            />
          </div>
          <button 
            onClick={openAddModal}
            className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0 h-[42px]"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Purchase
          </button>
        </div>'''

text = re.sub(old_button_block, new_button_block, text)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Moved filters next to Add Purchase!')
