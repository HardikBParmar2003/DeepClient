import re

filepath = r"D:\deep clothes\client\src\templates\ShivnetraChashamagharInvoice.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Inject user into ShivnetraChashamagharInvoice
find_str = "  if (!order) return null;"
replace_str = "  if (!order) return null;\n  const { user } = useContext(AuthContext) || {};"

if "const { user } = useContext(AuthContext)" not in content:
    content = content.replace(find_str, replace_str)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed ShivnetraChashamagharInvoice.jsx")
else:
    print("Already fixed")
