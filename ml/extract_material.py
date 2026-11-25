
from pathlib import Path
from io import BytesIO
import json
import re
import unicodedata

import cv2
import numpy as np
import pymupdf
import pytesseract

from PIL import Image
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pytesseract import Output


# ==========================================
# PROJECT PATHS AND OCR SETTINGS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_DIR = BASE_DIR / "data" / "raw"
OUTPUT_DIR = BASE_DIR / "data" / "processed"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

OCR_LANGUAGE = "ara+eng"


# ==========================================
# TEXT CLEANING
# ==========================================

def clean_text(text):

    # Normalize Unicode characters
    text = unicodedata.normalize("NFC", text)

    # Remove invisible directional marks
    text = re.sub(r"[\u200e\u200f\u202a-\u202e]", "", text)

    # Remove null characters
    text = text.replace("\x00", "")

    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Keep reasonable line breaks
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


# ==========================================
# IMAGE PREPROCESSING
# ==========================================

def preprocess_image(image):

    if image.mode != "RGB":
        image = image.convert("RGB")

    # Convert PIL image to OpenCV format
    image_array = np.array(image)

    # Convert RGB to grayscale
    gray = cv2.cvtColor(
        image_array,
        cv2.COLOR_RGB2GRAY
    )

    # Enlarge image for better character recognition
    gray = cv2.resize(
        gray,
        None,
        fx=1.5,
        fy=1.5,
        interpolation=cv2.INTER_CUBIC
    )

    # Improve local contrast
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced = clahe.apply(gray)

    # Adaptive threshold
    threshold = cv2.adaptiveThreshold(
        enhanced,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )

    return [
        Image.fromarray(enhanced),
        Image.fromarray(threshold)
    ]


# ==========================================
# OCR CONFIDENCE
# ==========================================

def calculate_confidence(data):

    scores = []

    for value in data["conf"]:
        try:
            score = float(value)

            if score >= 0:
                scores.append(score)

        except (ValueError, TypeError):
            continue

    if not scores:
        return 0

    return sum(scores) / len(scores)


# ==========================================
# OCR HELPER
# ==========================================

def extract_image_text(image):

    best_text = ""
    best_confidence = -1

    try:

        processed_images = preprocess_image(image)

        configs = [
            "--oem 1 --psm 3",
            "--oem 1 --psm 6"
        ]

        for processed_image in processed_images:

            for config in configs:

                data = pytesseract.image_to_data(
                    processed_image,
                    lang=OCR_LANGUAGE,
                    config=config,
                    output_type=Output.DICT,
                    timeout=60
                )

                text = pytesseract.image_to_string(
                    processed_image,
                    lang=OCR_LANGUAGE,
                    config=config,
                    timeout=60
                )

                confidence = calculate_confidence(data)

                if text.strip() and confidence > best_confidence:

                    best_text = text.strip()
                    best_confidence = confidence

        return clean_text(best_text)

    except Exception as error:

        print("OCR error:", error)
        return ""


# ==========================================
# TEXT ANALYSIS
# ==========================================

def count_text_lines(text):

    return len([
        line for line in text.splitlines()
        if line.strip() and len(line.strip()) < 100
    ])


# ==========================================
# PDF ANALYSIS
# ==========================================

def analyze_pdf(file_path):

    doc = pymupdf.open(file_path)

    pages_text = []
    ocr_pages = 0

    try:

        for page_number, page in enumerate(doc, start=1):

            # Extract normal PDF text first
            raw_text = page.get_text("text").strip()

            final_text = raw_text

            # Use OCR if the page has very little text
            if len(raw_text) < 80:

                pix = page.get_pixmap(matrix=pymupdf.Matrix(3, 3), alpha=False)

                image = Image.open(
                    BytesIO(pix.tobytes("png"))
                )

                ocr_text = extract_image_text(image)

                if len(ocr_text) > len(raw_text):

                    final_text = ocr_text
                    ocr_pages += 1

            pages_text.append({
                "page_number": page_number,
                "raw_text": raw_text,
                "cleaned_text": clean_text(final_text)
            })

    finally:
        doc.close()

    full_raw_text = "\n".join(
        item["raw_text"] for item in pages_text
    )

    full_text = "\n".join(
        item["cleaned_text"] for item in pages_text
    )

    return {
        "file_name": file_path.name,
        "file_type": "PDF",
        "pages_count": len(pages_text),
        "word_count": len(full_text.split()),
        "ocr_pages": ocr_pages,
        "topics_count": count_text_lines(full_text),
        "pages": pages_text,
        "raw_text": full_raw_text,
        "text": full_text
    }


# ==========================================
# POWERPOINT IMAGE HELPER
# ==========================================

def extract_slide_text(slide):

    slide_parts = []

    for shape in slide.shapes:

        # Normal text
        if shape.has_text_frame:

            text = shape.text.strip()

            if text:
                slide_parts.append(text)

        # Tables
        if shape.has_table:

            for row in shape.table.rows:

                cells = [
                    cell.text.strip()
                    for cell in row.cells
                    if cell.text.strip()
                ]

                if cells:
                    slide_parts.append(" | ".join(cells))

        # Images
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:

            try:

                image = Image.open(
                    BytesIO(shape.image.blob)
                )

                image_text = extract_image_text(image)

                if image_text:
                    slide_parts.append(image_text)

            except Exception as error:

                print("Image extraction error:", error)

    return "\n".join(slide_parts)


# ==========================================
# POWERPOINT ANALYSIS
# ==========================================

def analyze_pptx(file_path):

    presentation = Presentation(file_path)

    slides_text = []
    ocr_slides = 0

    for slide_number, slide in enumerate(
        presentation.slides,
        start=1
    ):

        normal_text = []

        for shape in slide.shapes:

            if shape.has_text_frame and shape.text.strip():
                normal_text.append(shape.text.strip())

        slide_text = extract_slide_text(slide)

        if not normal_text and slide_text:
            ocr_slides += 1

        slides_text.append({
            "slide_number": slide_number,
            "raw_text": slide_text,
            "cleaned_text": clean_text(slide_text)
        })

    full_raw_text = "\n".join(
        item["raw_text"] for item in slides_text
    )

    full_text = "\n".join(
        item["cleaned_text"] for item in slides_text
    )

    return {
        "file_name": file_path.name,
        "file_type": "PowerPoint",
        "pages_count": len(slides_text),
        "word_count": len(full_text.split()),
        "ocr_slides": ocr_slides,
        "topics_count": count_text_lines(full_text),
        "slides": slides_text,
        "raw_text": full_raw_text,
        "text": full_text
    }


# ==========================================
# MAIN
# ==========================================

def main():

    results = []

    print("\nStarting improved material extraction...")
    print("OCR languages:", OCR_LANGUAGE)

    if not INPUT_DIR.exists():

        print("Input directory not found:", INPUT_DIR)
        return

    for file_path in INPUT_DIR.iterdir():

        if not file_path.is_file():
            continue

        suffix = file_path.suffix.lower()

        try:

            if suffix == ".pdf":

                result = analyze_pdf(file_path)

            elif suffix == ".pptx":

                result = analyze_pptx(file_path)

            else:
                continue

            results.append(result)

            print("\n" + "=" * 45)
            print("File:", result["file_name"])
            print("Type:", result["file_type"])
            print("Pages / Slides:", result["pages_count"])
            print("Words:", result["word_count"])
            print("Estimated topic lines:", result["topics_count"])

            if suffix == ".pdf":

                print(
                    "Pages processed with OCR:",
                    result["ocr_pages"]
                )

            elif suffix == ".pptx":

                print(
                    "Slides with image-only text:",
                    result["ocr_slides"]
                )

        except Exception as error:

            print("\nCould not process:", file_path.name)
            print("Reason:", error)

    output_file = OUTPUT_DIR / "materials_analysis.json"

    output_file.write_text(
        json.dumps(
            results,
            ensure_ascii=False,
            indent=4
        ),
        encoding="utf-8"
    )

    print("\n" + "=" * 45)
    print("Analysis saved to:", output_file)
    print("Total files processed:", len(results))
    print("Extraction completed!")


if __name__ == "__main__":
    main()
