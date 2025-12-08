import pyotp
import qrcode
from io import BytesIO
import base64


def generate_totp_secret():
    """Generate a new TOTP secret"""
    return pyotp.random_base32()


def get_totp_uri(user, secret):
    """Generate TOTP URI for QR code"""
    return pyotp.totp.TOTP(secret).provisioning_uri(
        name=user.email, issuer_name="EasyCart"
    )


def generate_qr_code(uri):
    """Generate QR code image as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return base64.b64encode(buffer.getvalue()).decode()


def verify_totp(secret, token):
    """Verify TOTP token"""
    if not secret or not token:
        return False
    token = str(token).strip().replace(" ", "")
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=2)  # Allow 60s window
