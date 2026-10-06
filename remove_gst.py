import re

filepath = r"D:\deep clothes\client\src\pages\admin\AdminProfile.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove state
content = re.sub(r'  const \[gstSettings, setGstSettings\] = useState\(\{[\s\S]*?\}\);\n', '', content)

# 2. Remove useEffect parts
content = re.sub(r"    const storedGstNumber = localStorage\.getItem\('shopGstNumber'\) \|\| '';\n    const storedIncludeGst = localStorage\.getItem\('includeGstInBill'\) === 'true';\n    \n    setGstSettings\(\{\n      gstNumber: storedGstNumber,\n      includeGstInBill: storedIncludeGst\n    \}\);\n", "", content)

# 3. Remove handlers
content = re.sub(r"  const handleGstChange = \(e\) => \{[\s\S]*?\}\};\n", "", content)
content = re.sub(r"  const handleGstSubmit = \(e\) => \{[\s\S]*?\}\};\n", "", content)

# 4. Remove UI form
content = re.sub(r"      \{\/\* GST Settings Form \*\/\}[\s\S]*?<\/form>\n      <\/div>", "", content)

# 5. Fix text
content = content.replace("Manage your personal profile and shop billing settings", "Manage your personal profile and shop business details")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed GST billing settings from AdminProfile.jsx")
