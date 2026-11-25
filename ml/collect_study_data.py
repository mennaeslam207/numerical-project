
from pathlib import Path
import csv
from datetime import date

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_FILE = BASE_DIR / "data" / "processed" / "study_sessions.csv"

FIELDS = [
    "student_id",
    "material_name",
    "pages_count",
    "word_count",
    "difficulty_level",
    "knowledge_level",
    "expected_minutes",
    "actual_minutes",
    "session_date"
]


def get_positive_number(message, allow_empty=False):
    while True:
        value = input(message).strip()

        if allow_empty and value == "":
            return ""

        try:
            number = int(value)
            if number > 0:
                return number
        except ValueError:
            pass

        print("Please enter a positive whole number.")


def get_level(message):
    valid_levels = ["Easy", "Medium", "Hard"]

    while True:
        value = input(message).strip().capitalize()

        if value in valid_levels:
            return value

        print("Choose: Easy, Medium, or Hard.")


def collect_session():
    print("\n===== New Study Session =====\n")

    student_id = input("Student ID or nickname: ").strip()
    while not student_id:
        student_id = input("Student ID cannot be empty: ").strip()

    material_name = input("Material name: ").strip()
    while not material_name:
        material_name = input("Material name cannot be empty: ").strip()

    pages_count = get_positive_number("Number of pages: ")
    word_count = get_positive_number("Number of words: ")

    difficulty = get_level("Difficulty (Easy/Medium/Hard): ")
    knowledge = get_level("Your knowledge level (Easy/Medium/Hard): ")

    expected = get_positive_number(
        "Expected minutes (press Enter if unknown): ",
        allow_empty=True
    )

    actual = get_positive_number("Actual study minutes: ")

    session_date = input(
        f"Session date (YYYY-MM-DD, Enter for today): "
    ).strip()

    if not session_date:
        session_date = date.today().isoformat()
    else:
        try:
            date.fromisoformat(session_date)
        except ValueError:
            print("Invalid date. Today's date will be used.")
            session_date = date.today().isoformat()

    return {
        "student_id": student_id,
        "material_name": material_name,
        "pages_count": pages_count,
        "word_count": word_count,
        "difficulty_level": difficulty,
        "knowledge_level": knowledge,
        "expected_minutes": expected,
        "actual_minutes": actual,
        "session_date": session_date
    }


def save_session(session):
    CSV_FILE.parent.mkdir(parents=True, exist_ok=True)

    file_exists = CSV_FILE.exists() and CSV_FILE.stat().st_size > 0

    with CSV_FILE.open("a", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)

        if not file_exists:
            writer.writeheader()

        writer.writerow(session)

    print("\nStudy session saved successfully!")
    print("Saved in:", CSV_FILE)


def main():
    print("SMART STUDY PLANNER - DATA COLLECTION")

    while True:
        session = collect_session()
        save_session(session)

        again = input("\nAdd another session? (yes/no): ").strip().lower()

        if again not in ["yes", "y"]:
            print("\nData collection finished.")
            break


if __name__ == "__main__":
    main()
