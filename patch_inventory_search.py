import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminInventory.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Import search icon if not present
if 'HiOutlineSearch' not in text:
    text = text.replace("import { HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlinePencil }", "import { HiOutlinePlus, HiOutlineX, HiOutlineTrash, HiOutlinePencil, HiOutlineSearch }")

# 2. Add searchTerm state
if 'const [searchTerm' not in text:
    text = text.replace('const [page, setPage] = useState(1);', 'const [searchTerm, setSearchTerm] = useState("");\n  const [page, setPage] = useState(1);')

# 3. Filter inventory
if 'const filteredInventory =' not in text:
    text = text.replace('const totalPages = Math.ceil(inventory.length / limit);', '''
  const filteredInventory = inventory.filter(item => 
    item.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredInventory.length / limit);''')
    text = text.replace('const paginatedInventory = inventory.slice((page - 1) * limit, page * limit);', 'const paginatedInventory = filteredInventory.slice((page - 1) * limit, page * limit);')

# 4. Add search bar UI
search_ui = r'''      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-[var(--shadow-card)]">
        <div className="relative md:col-span-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
          <input 
            type="text"
            placeholder="Search unique code or category..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="glassmorphism'''

text = text.replace('<div className="glassmorphism', search_ui)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Patched AdminInventory with search bar!')
