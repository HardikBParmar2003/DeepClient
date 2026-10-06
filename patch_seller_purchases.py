import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminSellerPurchases.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Add states
if 'const [startDate' not in text:
    text = text.replace('const [purchases, setPurchases] = useState([]);', 'const [purchases, setPurchases] = useState([]);\n  const [startDate, setStartDate] = useState("");\n  const [endDate, setEndDate] = useState("");')

# Filter logic
if 'const filteredPurchases' not in text:
    filter_logic = '''
  const filteredPurchases = purchases.filter(p => {
    if(!startDate && !endDate) return true;
    const pDate = new Date(p.date).getTime();
    if(startDate && pDate < new Date(startDate).getTime()) return false;
    if(endDate && pDate > new Date(endDate).getTime()) return false;
    return true;
  });
  
  const totalPages = Math.ceil(filteredPurchases.length / limit);
  const paginatedPurchases = filteredPurchases.slice((page - 1) * limit, page * limit);
'''
    text = re.sub(r'const totalPages = Math\.ceil\(purchases\.length / limit\);\s*const paginatedPurchases = purchases\.slice\(\(page - 1\) \* limit, page \* limit\);', filter_logic, text)

# UI for filters
search_ui = r'''      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-[var(--shadow-card)] mb-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Start Date</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">End Date</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="bg-[var(--bg-card)]'''

text = text.replace('<div className="bg-[var(--bg-card)]', search_ui, 1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Patched AdminSellerPurchases with date filters!')
