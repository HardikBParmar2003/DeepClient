import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminSellerPurchases.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

table_wrapper = r'<div className="bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\] rounded-xl p-6 shadow-\[var\(--shadow-card\)\]">\s*<div className="overflow-x-auto">\s*<table className="w-full text-left border-collapse">'

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

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">'''

text = re.sub(table_wrapper, new_filters_ui, text)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Injected date filters!')
