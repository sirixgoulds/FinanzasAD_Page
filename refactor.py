import os
import re

base_dir = r"c:\WebPages\Finanzas Alan Dente"
index_path = os.path.join(base_dir, "index.html")

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace nav links in the full content
content = content.replace('href="#inicio"', 'href="index.html"')
content = content.replace('href="#nosotros"', 'href="nosotros.html"')
content = content.replace('href="#servicios"', 'href="fundamentos.html"')
content = content.replace('href="#mis-servicios"', 'href="servicios.html"')
content = content.replace('href="#blog"', 'href="blog.html"')

# We also want to disable the smooth scroll script for these links, since they are independent pages now.
content = content.replace('a[href^="#"]', 'a[href^="#section"]')

# Header: everything before <!-- Hero Section -->
header_idx = content.find("<!-- Hero Section -->")
header_html = content[:header_idx]

# Footer: everything from <!-- Footer -->
footer_idx = content.find("<!-- Footer -->")
footer_html = content[footer_idx:]

# Extract sections based on comments
def extract_section(start_comment, end_comment):
    start_idx = content.find(start_comment)
    end_idx = content.find(end_comment) if end_comment else footer_idx
    if start_idx != -1 and end_idx != -1:
        return content[start_idx:end_idx]
    return ""

sect_inicio = extract_section("<!-- Hero Section -->", "<!-- Nosotros / Acerca de (Sobre mi y mi misión) -->")
sect_nosotros = extract_section("<!-- Nosotros / Acerca de (Sobre mi y mi misión) -->", "<!-- Pilares / Servicios Section -->")
sect_servicios = extract_section("<!-- Pilares / Servicios Section -->", "<!-- Mis Servicios y lo que obtendrás Section -->")
sect_mis_servicios = extract_section("<!-- Mis Servicios y lo que obtendrás Section -->", "<!-- Blog de Noticias Section -->")
sect_blog = extract_section("<!-- Blog de Noticias Section -->", "<!-- Footer -->")

# Create the new pages
def create_page(filename, section_html):
    if not section_html.strip():
        print(f"Warning: Empty section for {filename}")
        return
    page_content = header_html + section_html + footer_html
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(page_content)
    print(f"Created {filename}")

# Create pages
create_page(os.path.join(base_dir, "index.html"), sect_inicio)
create_page(os.path.join(base_dir, "nosotros.html"), sect_nosotros)
create_page(os.path.join(base_dir, "fundamentos.html"), sect_servicios)
create_page(os.path.join(base_dir, "servicios.html"), sect_mis_servicios)
create_page(os.path.join(base_dir, "blog.html"), sect_blog)

# Update other pages
html_files = [f for f in os.listdir(base_dir) if f.endswith('.html')]
for file in html_files:
    if file not in ['index.html', 'nosotros.html', 'fundamentos.html', 'servicios.html', 'blog.html']:
        file_path = os.path.join(base_dir, file)
        with open(file_path, 'r', encoding='utf-8') as f:
            c_content = f.read()
        # only replace if needed
        if 'href="#inicio"' in c_content or 'href="#nosotros"' in c_content:
            c_content = c_content.replace('href="#inicio"', 'href="index.html"')
            c_content = c_content.replace('href="#nosotros"', 'href="nosotros.html"')
            c_content = c_content.replace('href="#servicios"', 'href="fundamentos.html"')
            c_content = c_content.replace('href="#mis-servicios"', 'href="servicios.html"')
            c_content = c_content.replace('href="#blog"', 'href="blog.html"')
            c_content = c_content.replace('a[href^="#"]', 'a[href^="#section"]')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(c_content)
            print(f"Updated {file}")

print("Refactor completed.")
