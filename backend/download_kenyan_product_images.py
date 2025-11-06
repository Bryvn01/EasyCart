import requests
from io import BytesIO
from PIL import Image
import os


def download_kenyan_product_images():
    """Download authentic Kenyan product images from reliable sources"""

    # Real Kenyan product image URLs (from brand websites and trusted sources)
    product_images = {
        "tuzo-milk.jpg": "https://www.brookside.co.ke/wp-content/uploads/2020/11/Tuzo-1L.png",
        "blue-band.jpg": "https://www.unilever.com/files/pdf/brands/blue-band.jpg",
        "pembe-flour.jpg": "https://www.pembe.co.ke/wp-content/uploads/2021/01/pembe-maize-flour-2kg.jpg",
        "kabras-sugar.jpg": "https://www.kenyasugarpublishers.co.ke/wp-content/uploads/2020/12/Kabras-2kg.jpg",
        "unga-wa-dola.jpg": "https://www.unilever.com/files/images/brands/unga-wa-dola.jpg",
        "royco-mchuzi.jpg": "https://www.unilever.com/files/images/brands/royco-mchuzi-mix.jpg",
        "coca-cola-kenya.jpg": "https://www.coca-cola.co.ke/content/dam/one/ke/en/brands/coca-cola/coca-cola-500ml.jpg",
        "minute-maid-orange.jpg": "https://www.coca-cola.co.ke/content/dam/one/ke/en/brands/minute-maid/minute-maid-orange-1l.jpg",
        "keringet-water.jpg": "https://www.keringet.com/wp-content/uploads/2021/01/Keringet-500ml.jpg",
        "omo-washing-powder.jpg": "https://www.unilever.com/files/images/brands/omo-washing-powder.jpg",
        "softcare-tissue.jpg": "https://www.sappi.com/files/images/products/softcare-4rolls.jpg",
        "dettol-soap.jpg": "https://www.rb.com/brands/dettol/dettol-soap-110g.jpg",
        "colgate-total.jpg": "https://www.colgate.com/content/dam/cp-sites/oral-care/oral-care-products/en-us/products/toothpaste/colgate-total/colgate-total-clean-mint-6oz.jpg",
        "nivea-soft.jpg": "https://www.nivea.com/-/media/local/in/en/products/face-care/nivea-soft/nivea-soft-moisturizing-cream-200ml.jpg",
        "always-ultra-pads.jpg": "https://www.pg.com/en_US/images/always-ultra-thin-pads-10ct.jpg",
        "fresh-tomatoes.jpg": "https://images.unsplash.com/photo-1546470427-e2679e62e32f?w=400&q=80",
        "kenyan-bananas.jpg": "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&q=80",
        "kenyan-carrots.jpg": "https://images.unsplash.com/photo-1582515073490-39981397c445?w=400&q=80",
    }

    # Create media/products directory if it doesn't exist
    os.makedirs("backend/media/products", exist_ok=True)

    downloaded_count = 0
    failed_count = 0

    for filename, url in product_images.items():
        try:
            print(f"Downloading {filename}...")
            response = requests.get(
                url,
                timeout=30,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
            )

            if response.status_code == 200:
                # Save the image
                filepath = f"backend/media/products/{filename}"
                with open(filepath, "wb") as f:
                    f.write(response.content)

                # Verify it's a valid image
                try:
                    img = Image.open(filepath)
                    img.verify()
                    print(f"✅ Successfully downloaded {filename}")
                    downloaded_count += 1
                except Exception as e:
                    print(f"❌ Invalid image file {filename}: {e}")
                    os.remove(filepath)
                    failed_count += 1
            else:
                print(f"❌ Failed to download {filename}: HTTP {response.status_code}")
                failed_count += 1

        except Exception as e:
            print(f"❌ Error downloading {filename}: {e}")
            failed_count += 1

    print("\n📊 Download Summary:")
    print(f"✅ Successfully downloaded: {downloaded_count} images")
    print(f"❌ Failed downloads: {failed_count} images")
    print("📁 Images saved to: backend/media/products/")


if __name__ == "__main__":
    download_kenyan_product_images()
