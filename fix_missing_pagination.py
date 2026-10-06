import os
import re

files = [
    "AdminGlasses.jsx",
    "AdminMatrixBuilder.jsx",
    "AdminPOS.jsx",
    "AdminSellerPurchases.jsx"
]

base_dir = r"D:\deep clothes\client\src\pages\admin"

pagination_html = """
      <CustomPagination 
        page={page} 
        totalPages={totalPages} 
        setPage={setPage} 
        limit={limit} 
        setLimit={setLimit} 
      />
"""

for fname in files:
    filepath = os.path.join(base_dir, fname)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "<CustomPagination" in content:
        continue
        
    match = re.search(r'(            </tbody>\s*</table>\s*</div>\s*</div>)', content)
    if match:
        content = content[:match.end()] + "\n" + pagination_html + content[match.end():]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed " + fname)
    else:
        print("Could not find table end in " + fname)
