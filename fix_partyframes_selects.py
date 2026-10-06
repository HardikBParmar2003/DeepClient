import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminPartyFrames.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Add import if missing
if 'CustomSelect' not in text:
    text = text.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport CustomSelect from '../../components/shared/CustomSelect';")

pattern1 = r'<select value=\{newFrame\.status\} onChange=\{e => setNewFrame\(\{\.\.\.newFrame, status: e\.target\.value\}\)\} className="[^"]+">\s*<option value="in_stock">In Stock</option>\s*<option value="sold">Sold</option>\s*</select>'
replacement1 = r'''<CustomSelect 
                      name="status"
                      value={newFrame.status} 
                      onChange={e => setNewFrame({...newFrame, status: e.target.value})} 
                      options={[
                        {value: 'in_stock', label: 'In Stock'},
                        {value: 'sold', label: 'Sold'}
                      ]}
                    />'''
text = re.sub(pattern1, replacement1, text, flags=re.DOTALL)

pattern2 = r'<select value=\{selectedFrame\.status\} onChange=\{e => setSelectedFrame\(\{\.\.\.selectedFrame, status: e\.target\.value\}\)\} className="[^"]+">\s*<option value="in_stock">In Stock</option>\s*<option value="sold">Sold</option>\s*</select>'
replacement2 = r'''<CustomSelect 
                      name="status"
                      value={selectedFrame.status} 
                      onChange={e => setSelectedFrame({...selectedFrame, status: e.target.value})} 
                      options={[
                        {value: 'in_stock', label: 'In Stock'},
                        {value: 'sold', label: 'Sold'}
                      ]}
                    />'''
text = re.sub(pattern2, replacement2, text, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed AdminPartyFrames selects!')
