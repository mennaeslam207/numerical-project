
from pathlib import Path
import json
import re
from collections import Counter

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "data" / "processed" / "materials_analysis.json"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "materials_topics.json"

# Common words that do not help identify topics
STOPWORDS = {
    "the", "and", "for", "with", "from", "that", "this",
    "are", "was", "were", "has", "have", "can", "will",
    "into", "their", "then", "than", "when", "what",
    "which", "who", "how", "why", "not", "but", "also",
    "use", "used", "using", "such", "one", "two",
    "من", "في", "على", "إلى", "عن", "أن", "هو", "هي",
    "هذا", "هذه", "التي", "الذي", "مع", "أو", "و", "لا",
    "كل", "كان", "يكون", "بعد", "قبل", "بين"
}


def clean_text(text):
    text = text or ""
    text = text.replace("\x00", " ")
    text = re.sub(r"[\u200e\u200f\u202a-\u202e]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def get_words(text):
    return re.findall(r"[A-Za-z]+|[\u0600-\u06FF]+", text.lower())


def find_candidate_headings(text):
    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    headings = []

    for line in lines:
        line = clean_text(line)

        if len(line) < 4 or len(line) > 100:
            continue

        words = line.split()

        if len(words) > 12:
            continue

        letters = [c for c in line if c.isalpha()]

        if not letters:
            continue

        uppercase_ratio = sum(c.isupper() for c in letters) / len(letters)

        looks_like_heading = (
            uppercase_ratio > 0.55
            or line.endswith(":")
            or re.match(r"^\d+[\.\-\)]\s*", line)
        )

        if looks_like_heading:
            headings.append(line)

    return list(dict.fromkeys(headings))


def analyze_material(material):
    pages = material.get("pages") or material.get("slides") or []

    page_results = []
    all_text = []

    for page in pages:
        page_number = page.get("page_number", page.get("slide_number"))
        text = clean_text(page.get("cleaned_text", ""))

        words = get_words(text)
        all_text.extend(words)

        page_results.append({
            "page_number": page_number,
            "word_count": len(words),
            "text_length": len(text),
            "candidate_headings": find_candidate_headings(
                page.get("cleaned_text", "")
            )
        })

    useful_words = [
        word for word in all_text
        if len(word) > 2 and word not in STOPWORDS
    ]

    keywords = Counter(useful_words).most_common(15)

    all_headings = []
    for page in page_results:
        for heading in page["candidate_headings"]:
            all_headings.append({
                "page_number": page["page_number"],
                "heading": heading
            })

    total_words = sum(page["word_count"] for page in page_results)

    return {
        "file_name": material.get("file_name"),
        "file_type": material.get("file_type"),
        "pages_count": len(page_results),
        "total_words": total_words,
        "average_words_per_page": round(
            total_words / len(page_results), 2
        ) if page_results else 0,
        "candidate_headings": all_headings,
        "top_keywords": [
            {"word": word, "frequency": count}
            for word, count in keywords
        ],
        "pages": page_results
    }


def main():
    if not INPUT_FILE.exists():
        print("ERROR: materials_analysis.json was not found.")
        return

    try:
        materials = json.loads(
            INPUT_FILE.read_text(encoding="utf-8")
        )

        results = [
            analyze_material(material)
            for material in materials
        ]

        OUTPUT_FILE.write_text(
            json.dumps(results, ensure_ascii=False, indent=4),
            encoding="utf-8"
        )

        print("\nMaterial analysis completed successfully!")

        for result in results:
            print("\n" + "=" * 45)
            print("File:", result["file_name"])
            print("Pages / Slides:", result["pages_count"])
            print("Total words:", result["total_words"])
            print(
                "Average words per page:",
                result["average_words_per_page"]
            )
            print(
                "Candidate headings:",
                len(result["candidate_headings"])
            )
            print("Top keywords:")
            for item in result["top_keywords"][:10]:
                print("-", item["word"], ":", item["frequency"])

        print("\nSaved to:", OUTPUT_FILE)

    except Exception as error:
        print("\nAnalysis failed:", error)


if __name__ == "__main__":
    main()
