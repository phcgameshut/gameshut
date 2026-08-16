from PIL import Image
import sys

img_path = sys.argv[1]
try:
    img = Image.open(img_path)
    img = img.convert("RGB")
    
    # The image is 225x225. Let's crop the top and bottom black bars.
    # We crop from y=25 to y=200, making it 225x175
    cropped = img.crop((0, 30, 225, 195))
    
    # Get dominant color of cropped image
    pixels = list(cropped.getdata())
    from collections import Counter
    # filter out black/dark
    filtered = [p for p in pixels if not (p[0]<30 and p[1]<30 and p[2]<30)]
    if not filtered: filtered = pixels
    dom = Counter(filtered).most_common(1)[0][0]
    hex_color = "#{:02x}{:02x}{:02x}".format(dom[0], dom[1], dom[2])
    print(f"DOMINANT_HEX: {hex_color}")
    
    # Save logo
    cropped.save("public/logo.png", "PNG")
    
    # Save icon.png (we need a square for the app icon)
    # We can create a square transparent canvas and paste the cropped image in the middle
    icon_sq = Image.new("RGBA", (225, 225), (0,0,0,0))
    icon_sq.paste(cropped, (0, 25))
    icon_sq.save("src/app/icon.png", "PNG")
    
    print("Done processing images!")
except Exception as e:
    print(f"Error: {e}")
