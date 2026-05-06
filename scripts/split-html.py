#!/usr/bin/env python3
"""
Agent Frontend — Découpage du fichier monolithique index.html
Extrait CSS → src/css/styles.css
Extrait JS  → src/js/ui.js (partie UI) + src/js/data-legacy.js (données à migrer)
Produit     → src/index.html propre
"""
import os, re

BASE    = os.path.join(os.path.dirname(__file__), '..')
SRC     = os.path.join(BASE, 'src')
HTML_IN = os.path.join(BASE, 'index.html')   # original (conservé intact)
HTML_OUT= os.path.join(SRC,  'index.html')
CSS_OUT = os.path.join(SRC,  'css', 'styles.css')
UI_OUT  = os.path.join(SRC,  'js',  'ui.js')
DATA_OUT= os.path.join(SRC,  'js',  'data-legacy.js')

html = open(HTML_IN, encoding='utf-8').read()
lines = html.split('\n')

# ── Localiser les blocs ───────────────────────────────────────────────────────
css_start = css_end = js_start = js_end = None
for i, line in enumerate(lines, 1):
    if line.strip() == '<style>' and css_start is None:
        css_start = i
    if line.strip() == '</style>' and css_start and css_end is None:
        css_end = i
    if line.strip() == '<script>' and js_start is None:
        js_start = i
    if line.strip() == '</script>' and js_start and js_end is None:
        js_end = i

print(f"CSS: lignes {css_start}–{css_end}")
print(f"JS:  lignes {js_start}–{js_end}")

css_content = '\n'.join(lines[css_start:css_end-1])
js_content  = '\n'.join(lines[js_start:js_end-1])

# ── 1. Écrire le CSS ──────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(CSS_OUT), exist_ok=True)
with open(CSS_OUT, 'w', encoding='utf-8') as f:
    f.write('/* SkinMatch — Styles globaux\n')
    f.write(' * Agent Frontend — src/css/styles.css\n')
    f.write(' * Extrait depuis index.html (refactoring Sprint 3)\n')
    f.write(' */\n\n')
    f.write(css_content)
    f.write('\n\n/* ── Styles RTL (Arabe) ────────────────────────────────────────────────── */\n')
    f.write('[dir="rtl"] .topbar { flex-direction: row-reverse; }\n')
    f.write('[dir="rtl"] .btn-back { flex-direction: row-reverse; }\n')
    f.write('[dir="rtl"] .sr { flex-direction: row-reverse; }\n')
    f.write('[dir="rtl"] .ph { flex-direction: row-reverse; }\n')
    f.write('[dir="rtl"] .pu { border-left: none; border-right: 2px solid var(--acc); padding-left: 0; padding-right: 10px; }\n')
    f.write('[dir="rtl"] .conseil { text-align: right; }\n')
    f.write('\n/* ── Reduced motion ──────────────────────────────────────────────────── */\n')
    f.write('@keyframes spin { to { transform: rotate(360deg); } }\n')
    f.write('@media (prefers-reduced-motion: reduce) {\n')
    f.write('  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }\n')
    f.write('}\n')

print(f"✅ CSS extrait → src/css/styles.css ({len(css_content.splitlines())} lignes)")

# ── 2. Séparer JS: données (T, DB, IMGS, ROUTE) vs UI ─────────────────────────
# Les constantes de données sont en début de script (lignes 1-~440)
# Les fonctions UI commencent après ROUTE

# Trouver la frontière données/fonctions dans le JS
js_lines = js_content.split('\n')

data_end_idx = 0
for i, line in enumerate(js_lines):
    if 'function gB(' in line or 'function go(' in line or 'function build(' in line:
        data_end_idx = i
        break

data_js = '\n'.join(js_lines[:data_end_idx])
ui_js   = '\n'.join(js_lines[data_end_idx:])

# ── 3. Écrire data-legacy.js (données à terme dans les JSON) ─────────────────
os.makedirs(os.path.dirname(DATA_OUT), exist_ok=True)
with open(DATA_OUT, 'w', encoding='utf-8') as f:
    f.write('/**\n')
    f.write(' * SkinMatch — Données legacy (temporaire)\n')
    f.write(' * Ces données seront progressivement migrées vers src/data/*.json\n')
    f.write(' * Agent Products gère products.json\n')
    f.write(' * Agent Algorithm gère routes.json\n')
    f.write(' * Agent Localization gère translations.json\n')
    f.write(' *\n')
    f.write(' * NE PAS MODIFIER CE FICHIER DIRECTEMENT\n')
    f.write(' */\n\n')
    f.write("'use strict';\n\n")
    f.write(data_js)

print(f"✅ Données legacy → src/js/data-legacy.js ({len(data_js.splitlines())} lignes)")

# ── 4. Écrire ui.js ──────────────────────────────────────────────────────────
with open(UI_OUT, 'w', encoding='utf-8') as f:
    f.write('/**\n')
    f.write(' * SkinMatch — Logique UI et navigation\n')
    f.write(' * Agent Frontend — src/js/ui.js\n')
    f.write(' *\n')
    f.write(' * Gère: navigation entre écrans, rendu des composants, events UI\n')
    f.write(' * Dépend de: data-legacy.js, algorithm.js, i18n.js\n')
    f.write(' */\n\n')
    f.write("'use strict';\n\n")
    f.write(ui_js)

print(f"✅ UI JS → src/js/ui.js ({len(ui_js.splitlines())} lignes)")

# ── 5. Générer src/index.html propre ─────────────────────────────────────────
os.makedirs(SRC, exist_ok=True)

# Extraire le HTML pur (sans le bloc <style> et <script>)
html_before_style = '\n'.join(lines[:css_start-1])  # avant <style>
html_mid           = '\n'.join(lines[css_end:js_start-1])  # entre </style> et <script>
html_after_script  = '\n'.join(lines[js_end:])      # après </script>

# Reconstruire avec les liens externes
new_html = html_before_style
# Remplacer <style> inline par <link>
new_html += '\n<link rel="stylesheet" href="/src/css/styles.css">\n'
new_html += html_mid
# Remplacer <script> inline par les fichiers séparés
new_html += '\n'
new_html += '<!-- Données produits et traductions -->\n'
new_html += '<script src="/src/data/products.json" type="application/json" id="products-data"></script>\n'
new_html += '<!-- Scripts principaux -->\n'
new_html += '<script src="/src/js/data-legacy.js"></script>\n'
new_html += '<script src="/src/js/algorithm.js"></script>\n'
new_html += '<script src="/src/js/ui.js"></script>\n'
new_html += html_after_script

with open(HTML_OUT, 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f"✅ HTML propre → src/index.html")
print(f"\n📊 Résumé du découpage:")
print(f"   index.html original:   {len(lines)} lignes")
print(f"   src/css/styles.css:    {len(css_content.splitlines())} lignes")
print(f"   src/js/data-legacy.js: {len(data_js.splitlines())} lignes")
print(f"   src/js/ui.js:          {len(ui_js.splitlines())} lignes")
print(f"   src/index.html:        {len(new_html.splitlines())} lignes")
