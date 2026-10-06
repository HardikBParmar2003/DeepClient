import os
import re
import glob

base_dir = r"D:\deep clothes\client\src\pages\admin"
files = glob.glob(os.path.join(base_dir, "*.jsx"))

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the main map loop that renders table rows.
    # Usually: <tr key={item.id} className="...">
    # We want to replace <tr key={...} className="... "> with
    # <tr key={...} className="... cursor-pointer" onClick={(e) => { if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; const editBtn = e.currentTarget.querySelector('button[title=\"Edit\"]') || e.currentTarget.querySelector('button[title=\"Edit Name\"]'); if(editBtn) editBtn.click(); }}>
    
    # We should be careful to only target the tbody tr rows. 
    # Usually they look like <tr\s+key=\{[^}]+\}\s+className="([^"]+)"
    
    # Some don't have className, some have multiple lines. 
    
    # Pattern to match <tr key={...} className="...">
    
    def replacer(match):
        full_tag = match.group(0)
        
        # Avoid duplicate injection
        if "e.target.closest('button')" in full_tag:
            return full_tag
            
        # Add cursor-pointer to className if not present
        if 'className="' in full_tag:
            if 'cursor-pointer' not in full_tag:
                full_tag = re.sub(r'className="([^"]*)"', r'className="\1 cursor-pointer"', full_tag, count=1)
        else:
            # Add className="cursor-pointer"
            full_tag = full_tag.replace("<tr", '<tr className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"', 1)
            
        # Add onClick
        onclick_logic = r''' onClick={(e) => { if(e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return; const editBtn = e.currentTarget.querySelector('button[title="Edit"]') || e.currentTarget.querySelector('button[title="Edit Name"]') || e.currentTarget.querySelector('button[title="View"]'); if(editBtn) editBtn.click(); }}'''
        
        full_tag = full_tag.replace(">", onclick_logic + ">", 1)
        return full_tag

    new_content = re.sub(r'<tr\s+key=\{[^}]+\}[^>]*>', replacer, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Updated " + os.path.basename(filepath))

