import re

filepath = r"D:\deep clothes\client\src\pages\admin\AdminProfitLoss.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any character before '{totalRevenue', '{totalCost', '{Math.abs' with ?
content = re.sub(r'.(\{totalRevenue\.toFixed)', r'?\1', content)
content = re.sub(r'.(\{totalCost\.toFixed)', r'?\1', content)
content = re.sub(r'.(\{Math\.abs)', r'?\1', content)
content = re.sub(r'.(\{data\.revenue\.toFixed)', r'?\1', content)
content = re.sub(r'.(\{data\.cost\.toFixed)', r'?\1', content)
content = re.sub(r'.(\{data\.unitCost\.toFixed)', r'?\1', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed currency symbol")

