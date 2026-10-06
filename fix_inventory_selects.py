import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminInventory.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Add import if missing
if 'CustomSelect' not in text:
    text = text.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport CustomSelect from '../../components/shared/CustomSelect';")

# Replace first select
pattern1 = r'<select\s+value=\{formData\.category \|\| \'Shirt\'\}\s+onChange=\{e => setFormData\(\{\.\.\.formData, category: e\.target\.value\}\)\}\s+className="[^"]+"\s*>\s*<option value="Shirt">Shirt</option>\s*<option value="T-Shirt">T-Shirt</option>\s*<option value="Pant">Pant</option>\s*</select>'
replacement1 = r'''<CustomSelect 
                      name="category"
                      value={formData.category || 'Shirt'} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      options={[
                        {value: 'Shirt', label: 'Shirt'},
                        {value: 'T-Shirt', label: 'T-Shirt'},
                        {value: 'Pant', label: 'Pant'}
                      ]}
                    />'''
text = re.sub(pattern1, replacement1, text, flags=re.DOTALL)

# Replace second select
pattern2 = r'<select\s+value=\{editingItem\.category \|\| \'Shirt\'\}\s+onChange=\{e => setEditingItem\(\{\.\.\.editingItem, category: e\.target\.value\}\)\}\s+className="[^"]+"\s*>\s*<option value="Shirt">Shirt</option>\s*<option value="T-Shirt">T-Shirt</option>\s*<option value="Pant">Pant</option>\s*</select>'
replacement2 = r'''<CustomSelect 
                      name="category"
                      value={editingItem.category || 'Shirt'} 
                      onChange={e => setEditingItem({...editingItem, category: e.target.value})} 
                      options={[
                        {value: 'Shirt', label: 'Shirt'},
                        {value: 'T-Shirt', label: 'T-Shirt'},
                        {value: 'Pant', label: 'Pant'}
                      ]}
                    />'''
text = re.sub(pattern2, replacement2, text, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed AdminInventory selects!')
