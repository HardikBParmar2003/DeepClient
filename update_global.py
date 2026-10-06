import re
import glob
import os

# Update Footer.jsx
filepath = r"D:\deep clothes\client\src\components\layout\Footer.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "AuthContext" not in content:
    content = content.replace("import { shopConfig } from '../../config/shop.js';", "import { shopConfig } from '../../config/shop.js';\nimport { AuthContext } from '../../context/AuthContext';\nimport { useContext } from 'react';")
    content = content.replace("const Footer = () => {", "const Footer = () => {\n  const { user } = useContext(AuthContext);")

content = content.replace("{shopConfig.shortName}", "{user?.shopName || shopConfig.shortName}")
content = content.replace("{shopConfig.shopName}", "{user?.shopName || shopConfig.shopName}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Update Invoice
filepath = r"D:\deep clothes\client\src\templates\ShivnetraChashamagharInvoice.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "AuthContext" not in content:
    content = content.replace("import { shopConfig } from '../config/shop';", "import { shopConfig } from '../config/shop';\nimport { AuthContext } from '../context/AuthContext';\nimport { useContext } from 'react';")
    content = content.replace("const Invoice = ({", "const Invoice = ({") # Not modifying params
    # Inject user inside the function manually
    content = content.replace("  const date = new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {", "  const { user } = useContext(AuthContext) || {};\n  const date = new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {")

content = content.replace("{shopConfig.shopName}", "{user?.shopName || shopConfig.shopName}")
content = content.replace("{shopConfig.shortName}", "{user?.shopName || shopConfig.shortName}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Footer and Invoice")
