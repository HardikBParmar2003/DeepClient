import re

filepath = r"D:\deep clothes\client\src\components\layout\Navbar.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Super Optics", "{user?.shopName || shopConfig.shopName}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Navbar.jsx")
