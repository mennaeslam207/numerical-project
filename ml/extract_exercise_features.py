
from pathlib import Path
from zipfile import ZipFile
from html.parser import HTMLParser
from html import unescape
import re
import json
import csv

BASE_DIR = Path(__file__).resolve().parent.parent
ZIP_DIR = BASE_DIR / "data" / "raw" / "exercises"
OUTPUT_DIR = BASE_DIR / "data" / "processed"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

JSON_OUTPUT = OUTPUT_DIR / "exercise_features.json"
CSV_OUTPUT = OUTPUT_DIR / "exercise_features.csv"

EXERCISE_CODES = {
    "001002": "Es_1_1",
    "005030": "Es_1_2",
    "005040": "Es_1_3",
    "005050": "Es_1_4",
}


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        text = data.strip()
        if text:
            self.parts.append(text)

    def get_text(self):
        return " ".join(self.parts)


def extract_html_text(content):
    parser = TextExtractor()
    parser.feed(content.decode("utf-8", errors="ignore"))
    return unescape(parser.get_text())


def detect_tasks(text):
    lower = text.lower()

    patterns = {
        "schematic_design": [
            "complete the schematic",
            "complete it to obtain the schematic",
            "complete the drawing",
        ],
        "functional_simulation": [
            "functional simulation",
            "interactive animation",
        ],
        "truth_table": [
            "truth table",
            "draw the truth table",
            "compile a truth table",
        ],
        "timing_simulation": [
            "timing simulation",
            "timing diagram",
        ],
        "component_naming": [
            "name the input",
            "name the output",
            "components to be named",
        ],
        "circuit_analysis": [
            "verify the behavior",
            "test the simplified",
        ],
    }

    return [
        task for task, phrases in patterns.items()
        if any(phrase in lower for phrase in phrases)
    ]


def detect_topic(title, text):
    content = (title + " " + text).lower()

    patterns = {
        "logic_gates": [
            "logic gates",
            "combinational logic",
        ],
        "multiplexer": [
            "multiplexer",
            "mux",
        ],
        "demultiplexer": [
            "demultiplexer",
            "demux",
        ],
        "communication_channel": [
            "communication channel",
            "shared-line",
        ],
    }

    detected = [
        topic for topic, words in patterns.items()
        if any(word in content for word in words)
    ]

    return detected if detected else ["unknown"]


def extract_circuit_components(archive, pbs_files):
    components = set()

    for file_name in pbs_files:
        try:
            raw = archive.read(file_name)

            strings = re.findall(
                rb"[A-Za-z][A-Za-z0-9_ -]{1,35}",
                raw
            )

            for item in strings:
                value = item.decode(
                    "ascii", errors="ignore"
                ).strip()

                if value:
                    components.add(value)

        except Exception as error:
            print(f"Could not inspect {file_name}: {error}")

    return sorted(components)


def analyze_zip(zip_path):
    code = zip_path.stem
    exercise_id = EXERCISE_CODES.get(code)

    if exercise_id is None:
        print(f"Unknown exercise code: {code}")
        return None

    print(f"\nAnalyzing: {exercise_id} ({code})")

    with ZipFile(zip_path, "r") as archive:
        files = archive.namelist()

        html_files = [
            name for name in files
            if name.lower().endswith("index.htm")
        ]

        if not html_files:
            html_files = [
                name for name in files
                if name.lower().endswith(".htm")
                and "_it." not in name.lower()
            ]

        if not html_files:
            print("No instruction HTML file found.")
            return None

        html_text = extract_html_text(
            archive.read(html_files[0])
        )

        title_match = re.search(
            r"Deeds\s*-\s*(.*?)\s+\[\d+\]",
            html_text,
            re.IGNORECASE
        )

        title = (
            title_match.group(1).strip()
            if title_match else html_text[:120]
        )

        topics = detect_topic(title, html_text)
        tasks = detect_tasks(html_text)

        pbs_files = [
            name for name in files
            if name.lower().endswith(".pbs")
        ]

        image_files = [
            name for name in files
            if name.lower().endswith(
                (".png", ".jpg", ".jpeg")
            )
        ]

        report_files = [
            name for name in files
            if name.lower().endswith(
                (".doc", ".docx")
            )
        ]

        components = extract_circuit_components(
            archive, pbs_files
        )

        result = {
            "exercise_id": exercise_id,
            "exercise_code": code,
            "title": title,
            "topics": topics,
            "instruction_text": html_text,
            "tasks": tasks,
            "task_count": len(tasks),
            "has_schematic": "schematic_design" in tasks,
            "has_functional_simulation": (
                "functional_simulation" in tasks
            ),
            "has_truth_table": "truth_table" in tasks,
            "has_timing_simulation": (
                "timing_simulation" in tasks
            ),
            "pbs_files": pbs_files,
            "image_files": image_files,
            "report_files": report_files,
            "circuit_components": components,
            "zip_file": zip_path.name,
        }

        print(f"Title: {title}")
        print(f"Topics: {topics}")
        print(f"Tasks: {tasks}")
        print(f"Task count: {len(tasks)}")
        print(f"PBS files: {len(pbs_files)}")

        return result


def main():
    print("=" * 55)
    print("SMART STUDY PLANNER")
    print("EXERCISE FEATURE EXTRACTION")
    print("=" * 55)

    ZIP_DIR.mkdir(parents=True, exist_ok=True)

    zip_files = sorted(ZIP_DIR.glob("*.zip"))

    if not zip_files:
        print("ERROR: No ZIP files found.")
        print(f"Expected folder: {ZIP_DIR}")
        return

    results = []

    for zip_path in zip_files:
        try:
            result = analyze_zip(zip_path)

            if result is not None:
                results.append(result)

        except Exception as error:
            print(f"Error analyzing {zip_path.name}: {error}")

    with open(JSON_OUTPUT, "w", encoding="utf-8") as file:
        json.dump(
            results,
            file,
            ensure_ascii=False,
            indent=4
        )

    csv_fields = [
        "exercise_id",
        "exercise_code",
        "title",
        "topics",
        "tasks",
        "task_count",
        "has_schematic",
        "has_functional_simulation",
        "has_truth_table",
        "has_timing_simulation",
        "pbs_files",
        "image_files",
        "report_files",
        "circuit_components",
        "zip_file",
    ]

    with open(
        CSV_OUTPUT,
        "w",
        newline="",
        encoding="utf-8-sig"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=csv_fields
        )

        writer.writeheader()

        for result in results:
            row = {}

            for field in csv_fields:
                value = result.get(field, "")

                if isinstance(value, list):
                    value = " | ".join(map(str, value))

                row[field] = value

            writer.writerow(row)

    print("\n" + "=" * 55)
    print("EXTRACTION SUMMARY")
    print("=" * 55)
    print(f"ZIP files found: {len(zip_files)}")
    print(f"Exercises analyzed: {len(results)}")
    print(f"JSON saved: {JSON_OUTPUT}")
    print(f"CSV saved: {CSV_OUTPUT}")
    print("\nExtraction completed successfully!")


if __name__ == "__main__":
    main()
