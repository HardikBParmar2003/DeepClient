import re

layout_file = r"D:\deep clothes\client\src\components\layout\AdminLayout.jsx"
with open(layout_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we import HiOutlineChartPie
if "HiOutlineChartPie" not in content:
    content = content.replace("HiOutlineShoppingCart}", "HiOutlineShoppingCart, HiOutlineChartPie}")

link_injection = """
            <Link to="/admin/profit-loss" onClick={closeSidebar} className={getLinkClasses('/admin/profit-loss')}>
              <HiOutlineChartPie className="h-5 w-5" />
              <span>Profit & Loss</span>
            </Link>"""

# Find the end of the Sellers link and inject after it
sellers_link_regex = r'(<span>Sellers</span>\s*</Link>)'
if "profit-loss" not in content:
    content = re.sub(sellers_link_regex, r'\1' + link_injection, content)
    with open(layout_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully injected profit-loss link")
else:
    print("Link already exists")
