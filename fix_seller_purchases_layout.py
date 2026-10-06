import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminSellerPurchases.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure CustomDatePicker is imported
if 'CustomDatePicker' not in text:
    text = text.replace("import ConfirmModal from '../../components/shared/ConfirmModal';", "import ConfirmModal from '../../components/shared/ConfirmModal';\nimport CustomDatePicker from '../../components/shared/CustomDatePicker';")

# 1. We will completely extract the Filters block.
# Since it was poorly injected, we'll find it and remove it.
filters_pattern = r'(\s*\{/\* Filters \*/\}\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-xl p-4 shadow-\[var\(--shadow-card\)\] mb-6">[\s\S]*?</div>\s*</div>\s*)'
text = re.sub(filters_pattern, '\n', text)

# 2. We'll reconstruct the stat boxes to be big and beautiful.
# We'll find the `<div className="flex flex-wrap gap-4 mt-6">` and the three stat boxes.
stat_boxes_pattern = r'<div className="flex flex-wrap gap-4 mt-6">\s*<div className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] px-5 py-3 rounded-xl shadow-\[var\(--shadow-card\)\]">\s*<span className="text-\[10px\] uppercase tracking-widest text-\[var\(--text-secondary\)\] block mb-1">Total Bill</span>\s*<span className="text-xl font-semibold text-luxury-gold">.*?</span>\s*</div>\s*<div className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] px-5 py-3 rounded-xl shadow-\[var\(--shadow-card\)\]">\s*<span className="text-\[10px\] uppercase tracking-widest text-\[var\(--text-secondary\)\] block mb-1">Total Advance</span>\s*<span className="text-xl font-semibold text-green-400">.*?</span>\s*</div>\s*<div className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] px-5 py-3 rounded-xl shadow-\[var\(--shadow-card\)\]">\s*<span className="text-\[10px\] uppercase tracking-widest text-\[var\(--text-secondary\)\] block mb-1">Total Due</span>\s*<span className="text-xl font-semibold text-red-400">.*?</span>\s*</div>\s*</div>'

new_stat_boxes = r'''<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-[var(--shadow-card)] flex flex-col justify-center items-center text-center hover:border-luxury-gold/50 transition-colors">
              <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block mb-2 font-medium">Total Bill</span>
              <span className="text-3xl font-light text-luxury-gold">{"\\u20B9"}{totalBill.toFixed(2)}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-[var(--shadow-card)] flex flex-col justify-center items-center text-center hover:border-green-500/50 transition-colors">
              <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block mb-2 font-medium">Total Advance</span>
              <span className="text-3xl font-light text-green-400">{"\\u20B9"}{totalAdvance.toFixed(2)}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-[var(--shadow-card)] flex flex-col justify-center items-center text-center hover:border-red-500/50 transition-colors">
              <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block mb-2 font-medium">Total Due</span>
              <span className="text-3xl font-light text-red-400">{"\\u20B9"}{totalDue.toFixed(2)}</span>
            </div>
          </div>'''

text = re.sub(stat_boxes_pattern, new_stat_boxes, text, flags=re.DOTALL)

# 3. Add the filters right above the table
# We look for `<div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">`
table_wrapper = '<div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">'

new_filters_ui = r'''      {/* Date Filters */}
      <div className="flex flex-col md:flex-row gap-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-[var(--shadow-card)] items-center">
        <div className="flex-1 w-full">
          <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Start Date</label>
          <CustomDatePicker 
            value={startDate ? new Date(startDate) : null}
            onChange={(date) => {
              if(!date) { setStartDate(''); return; }
              const d = new Date(date);
              setStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
              setPage(1);
            }}
            placeholder="Select start date"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">End Date</label>
          <CustomDatePicker 
            value={endDate ? new Date(endDate) : null}
            onChange={(date) => {
              if(!date) { setEndDate(''); return; }
              const d = new Date(date);
              setEndDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
              setPage(1);
            }}
            placeholder="Select end date"
          />
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">'''

text = text.replace(table_wrapper, new_filters_ui)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed layout and added brand date picker!')
