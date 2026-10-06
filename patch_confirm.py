import re

def patch_file(filepath, title, message, api_endpoint, resource_name):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Import ConfirmModal
    if 'ConfirmModal' not in text:
        text = text.replace("import CustomPagination from '../../components/shared/CustomPagination';", "import CustomPagination from '../../components/shared/CustomPagination';\nimport ConfirmModal from '../../components/shared/ConfirmModal';")
        # Fallback if CustomPagination is not there
        if 'ConfirmModal' not in text:
            text = text.replace("import toast", "import ConfirmModal from '../../components/shared/ConfirmModal';\nimport toast")

    # 2. Add confirmState
    if 'const [confirmState' not in text:
        state_injection = "  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });\n"
        # Find first useState
        text = re.sub(r'(const \[[a-zA-Z]+, [a-zA-Z]+\] = useState\([^)]*\);)', r'\1\n' + state_injection, text, count=1)

    # 3. Modify handleDelete and add executeDelete
    # We will find `const handleDelete = async (id) => { ... }` and replace it
    delete_pattern = r'const handleDelete = async \(id\) => \{[\s\S]*?if \(!window\.confirm\([^)]+\)\) return;[\s\S]*?try \{([\s\S]*?)\} catch \([^)]+\) \{([\s\S]*?)\}\s*\};'
    
    def repl(m):
        try_block = m.group(1).strip()
        catch_block = m.group(2).strip()
        return f'''const handleDelete = (id) => {{
    setConfirmState({{ isOpen: true, id }});
  }};

  const executeDelete = async (id) => {{
    try {{
      {try_block}
    }} catch (err) {{
      {catch_block}
    }}
  }};'''

    text = re.sub(delete_pattern, repl, text)
    
    # 4. Inject <ConfirmModal /> at the end of the return statement
    # We'll just look for the very last `</div>\n  );\n};` or similar
    modal_jsx = f'''
      <ConfirmModal
        isOpen={{confirmState.isOpen}}
        onClose={{() => setConfirmState({{ isOpen: false, id: null }})}}
        onConfirm={{() => executeDelete(confirmState.id)}}
        title="{title}"
        message="{message}"
        confirmText="Delete"
        isDestructive={{true}}
      />
    '''
    
    text = re.sub(r'( {4}\]\}\n)?(    </div>\n  \);\n\};)', modal_jsx + r'\2', text)
    # If the regex above fails because of different closing spacing
    if modal_jsx not in text:
        text = re.sub(r'(\s*</div>\s*\);\s*\};\s*export default)', modal_jsx + r'\1', text)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

files = [
    (r'D:\deep clothes\client\src\pages\admin\AdminCustomers.jsx', 'Delete Customer', 'Are you sure you want to delete this customer? All their orders will be lost!', '/customers/', 'customer'),
    (r'D:\deep clothes\client\src\pages\admin\AdminInventory.jsx', 'Delete Item', 'Are you sure you want to delete this item? This action cannot be undone.', '/inventory/', 'item'),
    (r'D:\deep clothes\client\src\pages\admin\AdminOrders.jsx', 'Delete Order', 'Are you sure you want to delete this order?', '/orders/', 'order'),
    (r'D:\deep clothes\client\src\pages\admin\AdminGallery.jsx', 'Delete Design', 'Are you sure you want to delete this design? This action cannot be undone.', '/gallery/', 'design'),
]

for filepath, title, message, ep, rn in files:
    patch_file(filepath, title, message, ep, rn)

print("All files patched successfully!")
