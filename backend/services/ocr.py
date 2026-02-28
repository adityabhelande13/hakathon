import fitz  # PyMuPDF
import io
import numpy as np
from PIL import Image

try:
    import easyocr
    has_easyocr = True
except ImportError:
    has_easyocr = False

reader = None

def get_reader():
    global reader
    if reader is None and has_easyocr:
        # Initialize EasyOCR reader (runs on CPU by default if no CUDA)
        reader = easyocr.Reader(['en'], gpu=False)
    return reader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text.strip()
    except Exception as e:
        print(f"PDF Extraction Error: {e}")
        return ""

def extract_text_from_image(file_bytes: bytes) -> str:
    if not has_easyocr:
        return "[Simulated OCR] - EasyOCR not installed. Please install easyocr for full image text extraction."
    try:
        image = Image.open(io.BytesIO(file_bytes))
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        img_array = np.array(image)
        r = get_reader()
        results = r.readtext(img_array)
        text = "\n".join([res[1] for res in results])
        return text.strip()
    except Exception as e:
        print(f"Image Extraction Error: {e}")
        return ""

def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    else:
        return extract_text_from_image(file_bytes)
