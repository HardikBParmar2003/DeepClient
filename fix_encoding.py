import re

filepath = r"D:\deep clothes\client\src\pages\admin\AdminProfitLoss.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any character just before {totalRevenue, {totalCost, {Math.abs etc. with \u20B9
content = re.sub(r'.(\{totalRevenue\.toFixed)', r'\\u20B9\1', content)
content = re.sub(r'.(\{totalCost\.toFixed)', r'\\u20B9\1', content)
content = re.sub(r'.(\{Math\.abs)', r'\\u20B9\1', content)
content = re.sub(r'.(\{data\.revenue\.toFixed)', r'\\u20B9\1', content)
content = re.sub(r'.(\{data\.cost\.toFixed)', r'\\u20B9\1', content)
content = re.sub(r'.(\{data\.unitCost\.toFixed)', r'\\u20B9\1', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced with unicode escape")
