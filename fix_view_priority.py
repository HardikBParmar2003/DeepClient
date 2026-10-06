import os
import glob

base_dir = r"D:\deep clothes\client\src\pages\admin"
files = glob.glob(os.path.join(base_dir, "*.jsx"))

old_string = r'''const editBtn = e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]') || e.currentTarget.querySelector('button[title="View"]');'''
new_string = r'''const editBtn = e.currentTarget.querySelector('button[title="View"]') || e.currentTarget.querySelector('button[title="View Details"]') || e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]');'''

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if old_string in content:
        content = content.replace(old_string, new_string)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated prioritize view logic in " + os.path.basename(filepath))

