import re

filepath = r"D:\deep clothes\client\src\components\shared\CustomerModal.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove email from state initialization
content = re.sub(r"email: '',\s*", "", content)
content = re.sub(r"email: customer\.email \|\| '',\s*", "", content)

# 2. Remove email from view section
view_email_regex = r'<div className="flex items-center gap-3 p-3 rounded-xl bg-\[var\(--bg-card\)\] border border-\[var\(--border-color\)\]">\s*<div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0">\s*<HiOutlineMail className="h-4 w-4 text-luxury-gold" />\s*</div>\s*<div className="min-w-0">\s*<p className="text-\[10px\] uppercase tracking-widest text-\[var\(--text-muted\)\]">Email</p>\s*<p className="text-sm text-\[var\(--text-primary\)\] truncate">\{customer\.email \|\| \'Not set\'\}</p>\s*</div>\s*</div>'
content = re.sub(view_email_regex, "", content)

# 3. Remove email from edit form section
edit_email_regex = r'<div>\s*<label className="block text-\[10px\] text-\[var\(--text-secondary\)\] uppercase tracking-widest mb-1\.5">Email Address</label>\s*<input\s*name="email"\s*type="email"\s*className="appearance-none block w-full px-4 py-2\.5 border border-\[var\(--input-border\)\] bg-\[var\(--input-bg\)\] text-\[var\(--input-text\)\] rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-gold text-sm"\s*value=\{formData\.email\}\s*onChange=\{handleChange\}\s*/>\s*</div>'
content = re.sub(edit_email_regex, "", content)

# 4. Remove HiOutlineMail import
content = content.replace("HiOutlineMail, ", "")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed email fields")

