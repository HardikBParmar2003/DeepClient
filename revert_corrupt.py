import os
import glob

base_dir = r"D:\deep clothes\client\src\pages\admin"
files = glob.glob(os.path.join(base_dir, "*.jsx"))

bad_string = r''' onClick={(e) => { if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; const editBtn = e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]') || e.currentTarget.querySelector('button[title="View"]'); if(editBtn) editBtn.click(); }}'''

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target_to_replace = "=" + bad_string + ">"
    if target_to_replace in content:
        content = content.replace(target_to_replace, "=>")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed corrupted syntax in " + os.path.basename(filepath))

