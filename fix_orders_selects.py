import re

filepath = r'D:\deep clothes\client\src\pages\admin\AdminOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Add import if missing
if 'CustomSelect' not in text:
    text = text.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport CustomSelect from '../../components/shared/CustomSelect';")

# 1. filterOrderStatus
pattern1 = r'<select\s+value=\{filterOrderStatus\}\s+onChange=\{\(e\) => setFilterOrderStatus\(e\.target\.value\)\}\s+className="[^"]+"\s*>\s*<option value="All">All Order Statuses</option>\s*<option value="Pending">Pending</option>\s*<option value="Completed">Completed</option>\s*</select>'
replacement1 = r'''<CustomSelect 
              name="filterOrderStatus"
              value={filterOrderStatus} 
              onChange={(e) => setFilterOrderStatus(e.target.value)}
              options={[
                {value: 'All', label: 'All Order Statuses'},
                {value: 'Pending', label: 'Pending'},
                {value: 'Completed', label: 'Completed'}
              ]}
            />'''
text = re.sub(pattern1, replacement1, text, flags=re.DOTALL)

# 2. filterPaymentStatus
pattern2 = r'<select\s+value=\{filterPaymentStatus\}\s+onChange=\{\(e\) => setFilterPaymentStatus\(e\.target\.value\)\}\s+className="[^"]+"\s*>\s*<option value="All">All Payment Statuses</option>\s*<option value="Pending">Pending</option>\s*<option value="Completed">Completed</option>\s*</select>'
replacement2 = r'''<CustomSelect 
              name="filterPaymentStatus"
              value={filterPaymentStatus} 
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              options={[
                {value: 'All', label: 'All Payment Statuses'},
                {value: 'Pending', label: 'Pending'},
                {value: 'Completed', label: 'Completed'}
              ]}
            />'''
text = re.sub(pattern2, replacement2, text, flags=re.DOTALL)

# 3. formData.orderStatus
pattern3 = r'<select\s+value=\{formData\.orderStatus\}\s+onChange=\{e => setFormData\(\{\.\.\.formData,\s*orderStatus: e\.target\.value\}\)\}\s+className="[^"]+"\s*>\s*<option value="Pending">Pending</option>\s*<option value="Completed">Completed</option>\s*</select>'
replacement3 = r'''<CustomSelect 
                          name="orderStatus"
                          value={formData.orderStatus} 
                          onChange={e => setFormData({...formData, orderStatus: e.target.value})}
                          options={[
                            {value: 'Pending', label: 'Pending'},
                            {value: 'Completed', label: 'Completed'}
                          ]}
                        />'''
text = re.sub(pattern3, replacement3, text, flags=re.DOTALL)

# 4. formData.paymentStatus
pattern4 = r'<select\s+value=\{formData\.paymentStatus\}\s+onChange=\{e => setFormData\(\{\.\.\.formData,\s*paymentStatus: e\.target\.value\}\)\}\s+className="[^"]+"\s*>\s*<option value="Pending">Pending</option>\s*<option value="Completed">Completed</option>\s*</select>'
replacement4 = r'''<CustomSelect 
                          name="paymentStatus"
                          value={formData.paymentStatus} 
                          onChange={e => setFormData({...formData, paymentStatus: e.target.value})}
                          options={[
                            {value: 'Pending', label: 'Pending'},
                            {value: 'Completed', label: 'Completed'}
                          ]}
                        />'''
text = re.sub(pattern4, replacement4, text, flags=re.DOTALL)

# 5. item.category
pattern5 = r'<select\s+value=\{item\.category\}\s+onChange=\{\(e\) => handleItemChange\(index,\s*\'category\',\s*e\.target\.value\)\}\s+className="[^"]+"\s*>\s*<option value="Shirt">Shirt</option>\s*<option value="T-Shirt">T-Shirt</option>\s*<option value="Pant">Pant</option>\s*</select>'
replacement5 = r'''<CustomSelect 
                              name="category"
                              value={item.category} 
                              onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                              options={[
                                {value: 'Shirt', label: 'Shirt'},
                                {value: 'T-Shirt', label: 'T-Shirt'},
                                {value: 'Pant', label: 'Pant'}
                              ]}
                            />'''
text = re.sub(pattern5, replacement5, text, flags=re.DOTALL)

# 6. item.uniqueCode
pattern6 = r'<select\s+value=\{item\.uniqueCode\}\s+onChange=\{\(e\) => handleItemChange\(index,\s*\'uniqueCode\',\s*e\.target\.value\)\}\s+className="[^"]+"\s+required\s*>\s*<option value="">Select Code</option>\s*\{filteredCodes\.map\(code => \(\s*<option key=\{code\.id\} value=\{code\.uniqueCode\}>\{code\.uniqueCode\}</option>\s*\)\)\}\s*</select>'
replacement6 = r'''<CustomSelect 
                              name="uniqueCode"
                              value={item.uniqueCode} 
                              onChange={(e) => handleItemChange(index, 'uniqueCode', e.target.value)}
                              searchable={true}
                              options={[
                                {value: '', label: 'Select Code'},
                                ...filteredCodes.map(code => ({value: code.uniqueCode, label: code.uniqueCode}))
                              ]}
                            />'''
text = re.sub(pattern6, replacement6, text, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed AdminOrders selects!')
