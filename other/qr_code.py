import os
import sys
import urllib.request
import urllib.parse

def generate_qr_code():
    url = "https://pamudu123.github.io/astrology_forum_app/"
    output_filename = os.path.join(os.path.dirname(__file__), "qr_code.png")
    
    print(f"Generating QR code for: {url}")
    
    # Try using the local 'qrcode' library first if installed (allows for high-quality local generation)
    try:
        import qrcode
        from qrcode.image.styledpath import StyledPilImage
        from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
        from qrcode.image.styles.colormasks import RadialGradiantColorMask

        print("Using local 'qrcode' library to generate a styled QR code...")
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)

        # Style the QR code with cosmic/astrology colors (deep indigo to gold/purple gradient)
        # using RadialGradiantColorMask: back_color, center_color, edge_color
        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=RoundedModuleDrawer(),
            color_mask=RadialGradiantColorMask(
                back_color=(15, 12, 30),        # Deep cosmic dark background
                center_color=(255, 215, 0),     # Gold center
                edge_color=(138, 43, 226)       # Purple/Indigo edges
            )
        )
        img.save(output_filename)
        print(f"Success! Styled QR code saved to {output_filename}")
        return True

    except ImportError:
        print("Local 'qrcode' or 'pillow' library not found. Falling back to public API generation...")
        try:
            # We use api.qrserver.com to generate the QR code.
            # We can also add some style parameters like color (dark purple/indigo: 4B0082 or 0F0C1E) and background color (white: FFFFFF or gold: FFD700)
            encoded_url = urllib.parse.quote_plus(url)
            
            # Let's request a high-quality 500x500 QR code
            # Color: 2D1B60 (Indigo), BgColor: FFFFFFF
            api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=500x500&data={encoded_url}&color=2d1b60&bgcolor=ffffff&qzone=2"
            
            headers = {'User-Agent': 'Mozilla/5.0'}
            req = urllib.request.Request(api_url, headers=headers)
            
            with urllib.request.urlopen(req) as response:
                with open(output_filename, 'wb') as f:
                    f.write(response.read())
            
            print(f"Success! QR code downloaded and saved to {output_filename}")
            return True
        except Exception as e:
            print(f"Error fetching QR code from API: {e}", file=sys.stderr)
            return False

if __name__ == "__main__":
    generate_qr_code()
