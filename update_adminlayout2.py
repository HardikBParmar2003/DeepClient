import re

filepath = r"D:\deep clothes\client\src\components\layout\AdminLayout.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const { logout } = useContext(AuthContext);", "const { user, logout } = useContext(AuthContext);")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AdminLayout.jsx")
