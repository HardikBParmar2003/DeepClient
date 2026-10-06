import re

filepath = r"D:\deep clothes\client\src\pages\admin\AdminProfitLoss.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace \u20B9{ with {"\u20B9"}{
content = content.replace(r'\u20B9{', r'{"\u20B9"}{')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed jsx syntax for unicode escape")
