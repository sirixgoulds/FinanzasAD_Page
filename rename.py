import os

base_dir = r"c:\WebPages\Finanzas Alan Dente"

# Rename the file
old_file = os.path.join(base_dir, "nosotros.html")
new_file = os.path.join(base_dir, "sobre-mi.html")

if os.path.exists(old_file):
    os.rename(old_file, new_file)
    print(f"Renamed nosotros.html to sobre-mi.html")

# Update all html files
html_files = [f for f in os.listdir(base_dir) if f.endswith('.html')]

for file in html_files:
    file_path = os.path.join(base_dir, file)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Replace href
    if 'href="nosotros.html"' in content:
        content = content.replace('href="nosotros.html"', 'href="sobre-mi.html"')
        modified = True
        
    # Replace text in nav links
    if '>Nosotros</a>' in content:
        content = content.replace('>Nosotros</a>', '>Sobre Mí</a>')
        modified = True
        
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")

print("Done.")
