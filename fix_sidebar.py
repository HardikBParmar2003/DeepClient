import re

filepath = r"D:\deep clothes\client\src\components\layout\AdminLayout.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

profile_link = r'''
              <Link to="/admin/profile" onClick={closeSidebar} className={getLinkClasses('/admin/profile')}>
                <HiOutlineUserCircle className="h-5 w-5" />
                <span>My Profile</span>
              </Link>'''

# Make sure we don't inject twice
if "My Profile" not in content:
    content = re.sub(r'(<span>My Expenses</span>\s*</Link>)', r'\1' + profile_link, content)
    
    if "HiOutlineUserCircle" not in content:
        content = content.replace("HiOutlineChartPie } from", "HiOutlineChartPie, HiOutlineUserCircle } from")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected My Profile link successfully.")
else:
    print("Already exists")

