import os

filepath = r"D:\deep clothes\client\src\pages\admin\AdminProfitLoss.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state for categories
state_injection = """  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['Shirt', 'T-Shirt', 'Pant']);
"""
content = content.replace("  const [startDate, setStartDate] = useState('');\n  const [endDate, setEndDate] = useState('');", state_injection)

# 2. Add toggleCategory
toggle_func = """  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  useEffect(() => {"""
content = content.replace("  useEffect(() => {", toggle_func, 1)

# 3. Add filtering logic in items loop
item_loop_find = """    items.forEach(item => {
      const uCode = item.uniqueCode?.toUpperCase() || 'UNKNOWN';
      const cat = item.category || 'Other';"""
      
item_loop_replace = """    items.forEach(item => {
      const uCode = item.uniqueCode?.toUpperCase() || 'UNKNOWN';
      const cat = item.category || 'Other';
      
      if (!selectedCategories.includes(cat) && selectedCategories.length > 0) return;
"""
content = content.replace(item_loop_find, item_loop_replace)

# 4. Update Category Metrics to only show if included, or just leave as is. Leaving as is (it will just be 0 if unselected).
# Wait, actually if we hide the cards for unselected categories, it's cleaner.
cat_map_find = """          {Object.entries(categoryMetrics).map(([cat, data]) => {"""
cat_map_replace = """          {Object.entries(categoryMetrics).filter(([cat]) => selectedCategories.length === 0 || selectedCategories.includes(cat)).map(([cat, data]) => {"""
content = content.replace(cat_map_find, cat_map_replace)


# 5. Inject Checkboxes UI
ui_find = """        <div className="w-full md:w-48">
          <CustomDatePicker 
            label="End Date"
            value={endDate}
            onChange={(date) => setEndDate(date)}
          />
        </div>"""
        
ui_replace = """        <div className="w-full md:w-48">
          <CustomDatePicker 
            label="End Date"
            value={endDate}
            onChange={(date) => setEndDate(date)}
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex items-center gap-4 ml-0 md:ml-4 border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-4 md:pt-0 md:pl-4 w-full md:w-auto">
          {['Shirt', 'T-Shirt', 'Pant'].map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(cat)} 
                  onChange={() => toggleCategory(cat)} 
                  className="peer appearance-none w-5 h-5 border-2 border-[var(--border-color)] rounded bg-[var(--bg-primary)] checked:bg-luxury-gold checked:border-luxury-gold transition-colors cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-luxury-gold transition-colors">{cat}</span>
            </label>
          ))}
        </div>"""
content = content.replace(ui_find, ui_replace)

# 6. Update Clear Filters button
clear_find = """        <button 
          onClick={() => { setStartDate(''); setEndDate(''); }}
          className="text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-luxury-gold transition-colors ml-auto"
        >"""
clear_replace = """        <button 
          onClick={() => { setStartDate(''); setEndDate(''); setSelectedCategories(['Shirt', 'T-Shirt', 'Pant']); }}
          className="text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-luxury-gold transition-colors ml-auto mt-4 md:mt-0"
        >"""
content = content.replace(clear_find, clear_replace)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdminProfitLoss.jsx with category multi-select filter")

