import os
import subprocess
import re
from PIL import Image, ImageDraw

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
svg_path = os.path.abspath('client/public/favicon.svg')

print('1. Rendering High-Resolution Vectors with Edge Headless...')

# Render 1: Full squircle icon
with open(svg_path, 'r', encoding='utf-8') as f:
    svg_raw = f.read()

html_squircle = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ width: 1024px; height: 1024px; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; }}
  svg {{ width: 1024px; height: 1024px; display: block; }}
</style>
</head>
<body>
{svg_raw}
</body>
</html>'''

with open('temp_sq.html', 'w', encoding='utf-8') as f:
    f.write(html_squircle)

out_sq = os.path.abspath('temp_sq.png')
subprocess.run([
    edge_path, '--headless=new', '--disable-gpu', '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    '--window-size=1024,1024', f'--screenshot={out_sq}',
    'file:///' + os.path.abspath('temp_sq.html').replace('\\', '/')
], check=True)

# Render 2: Foreground only (Q ring + Star) without background rect
svg_fg_only = re.sub(r'<rect[^>]*/>', '', svg_raw)
html_fg = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ width: 1024px; height: 1024px; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; }}
  svg {{ width: 1024px; height: 1024px; display: block; }}
</style>
</head>
<body>
{svg_fg_only}
</body>
</html>'''

with open('temp_fg.html', 'w', encoding='utf-8') as f:
    f.write(html_fg)

out_fg = os.path.abspath('temp_fg.png')
subprocess.run([
    edge_path, '--headless=new', '--disable-gpu', '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    '--window-size=1024,1024', f'--screenshot={out_fg}',
    'file:///' + os.path.abspath('temp_fg.html').replace('\\', '/')
], check=True)

sq_img = Image.open(out_sq).convert('RGBA')
fg_img = Image.open(out_fg).convert('RGBA')

print('2. Generating Launcher Icons...')
res_root = os.path.abspath('client/android/app/src/main/res')

icon_sizes = {
    'mipmap-mdpi': {'legacy': 48, 'fg': 108},
    'mipmap-hdpi': {'legacy': 72, 'fg': 162},
    'mipmap-xhdpi': {'legacy': 96, 'fg': 216},
    'mipmap-xxhdpi': {'legacy': 144, 'fg': 324},
    'mipmap-xxxhdpi': {'legacy': 192, 'fg': 432},
}

for folder, s in icon_sizes.items():
    folder_path = os.path.join(res_root, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    # 2a. Legacy square icon (squircle)
    legacy_size = s['legacy']
    legacy_icon = sq_img.resize((legacy_size, legacy_size), Image.Resampling.LANCZOS)
    legacy_icon.save(os.path.join(folder_path, 'ic_launcher.png'))
    
    # 2b. Legacy round icon (circular crop with antialiasing)
    supersample = legacy_size * 4
    round_canvas = Image.new('RGBA', (supersample, supersample), (0, 0, 0, 0))
    round_bg = Image.new('RGBA', (supersample, supersample), (0x1E, 0x1E, 0x22, 0xFF))
    
    # Draw circle mask
    mask = Image.new('L', (supersample, supersample), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((0, 0, supersample, supersample), fill=255)
    
    # Scale fg into round_bg (~70% of canvas)
    fg_scaled_size = int(supersample * 0.70)
    fg_scaled = fg_img.resize((fg_scaled_size, fg_scaled_size), Image.Resampling.LANCZOS)
    offset = (supersample - fg_scaled_size) // 2
    round_bg.paste(fg_scaled, (offset, offset), fg_scaled)
    
    round_canvas.paste(round_bg, (0, 0), mask)
    round_final = round_canvas.resize((legacy_size, legacy_size), Image.Resampling.LANCZOS)
    round_final.save(os.path.join(folder_path, 'ic_launcher_round.png'))
    
    # 2c. Adaptive foreground icon
    fg_canvas_size = s['fg']
    fg_canvas = Image.new('RGBA', (fg_canvas_size, fg_canvas_size), (0, 0, 0, 0))
    # Android adaptive safe zone is 66% (72dp / 108dp). We scale FG to 58% to be safely inside
    fg_placed_size = int(fg_canvas_size * 0.58)
    fg_placed = fg_img.resize((fg_placed_size, fg_placed_size), Image.Resampling.LANCZOS)
    fg_offset = (fg_canvas_size - fg_placed_size) // 2
    fg_canvas.paste(fg_placed, (fg_offset, fg_offset), fg_placed)
    fg_canvas.save(os.path.join(folder_path, 'ic_launcher_foreground.png'))
    print(f'Saved launcher icons in {folder}')

print('3. Generating Android 12+ Splash Icon...')
# Android 12+ windowSplashScreenAnimatedIcon: 288x288 or 512x512
splash_icon_canvas = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
# Sized comfortably in center
sq_splash_size = 360
sq_splash_placed = sq_img.resize((sq_splash_size, sq_splash_size), Image.Resampling.LANCZOS)
splash_offset = (512 - sq_splash_size) // 2
splash_icon_canvas.paste(sq_splash_placed, (splash_offset, splash_offset), sq_splash_placed)
splash_icon_path = os.path.join(res_root, 'drawable', 'splash_icon.png')
splash_icon_canvas.save(splash_icon_path)
print('Saved drawable/splash_icon.png')

print('4. Generating Full-Screen Splash Images (Dark Theme #18181B)...')
splash_specs = [
    ('drawable', 480, 320),
    ('drawable-port-mdpi', 320, 480),
    ('drawable-port-hdpi', 480, 800),
    ('drawable-port-xhdpi', 720, 1280),
    ('drawable-port-xxhdpi', 960, 1600),
    ('drawable-port-xxxhdpi', 1280, 1920),
    ('drawable-land-mdpi', 480, 320),
    ('drawable-land-hdpi', 800, 480),
    ('drawable-land-xhdpi', 1280, 720),
    ('drawable-land-xxhdpi', 1600, 960),
    ('drawable-land-xxxhdpi', 1920, 1280),
]

# Color: #18181B = (24, 24, 27)
dark_bg_color = (0x18, 0x18, 0x1B, 0xFF)

for folder, width, height in splash_specs:
    folder_path = os.path.join(res_root, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    splash_canvas = Image.new('RGBA', (width, height), dark_bg_color)
    
    # Scale Q logo to ~24% of shorter dimension
    min_dim = min(width, height)
    logo_size = max(64, int(min_dim * 0.28))
    logo_placed = sq_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    pos_x = (width - logo_size) // 2
    pos_y = (height - logo_size) // 2
    splash_canvas.paste(logo_placed, (pos_x, pos_y), logo_placed)
    
    splash_canvas.save(os.path.join(folder_path, 'splash.png'))
    print(f'Saved {folder}/splash.png ({width}x{height})')

print('5. Cleaning up temp files...')
for tmp in ['temp_sq.html', 'temp_sq.png', 'temp_fg.html', 'temp_fg.png', 'temp_fg_rgba.png', 'temp_squircle_rgba.png', 'temp_icon.html', 'temp_icon_1024.png']:
    if os.path.exists(tmp):
        os.remove(tmp)

print('All assets generated successfully!')
