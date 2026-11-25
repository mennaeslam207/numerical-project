
from pathlib import Path
import pandas as pd

# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data" / "raw"

datasets = {
    "score.csv": "Score Dataset",
    "score_updated.csv": "Updated Score Dataset",
    "student_habits_performance.csv": "Student Habits Dataset",
    "student_productivity_distraction_dataset_20000.csv":
        "Student Productivity Dataset"
}

print("=" * 65)
print("       AI STUDY PLANNER - DATASET INSPECTION")
print("=" * 65)

for filename, title in datasets.items():

    file_path = DATA_DIR / filename

    print(f"\n\n{'=' * 55}")
    print(f"DATASET: {title}")
    print(f"{'=' * 55}")

    if not file_path.exists():
        print(f"ERROR: File not found: {filename}")
        continue

    try:
        df = pd.read_csv(file_path)

        print("\n1. Dataset Shape:")
        print(f"Rows: {df.shape[0]}")
        print(f"Columns: {df.shape[1]}")

        print("\n2. Column Names:")
        print(df.columns.tolist())

        print("\n3. Data Types:")
        print(df.dtypes)

        print("\n4. Missing Values:")
        print(df.isnull().sum())

        print("\n5. Duplicate Rows:")
        print(df.duplicated().sum())

        print("\n6. Statistical Summary:")
        print(df.describe(include="all").to_string())

        print("\n7. First 5 Rows:")
        print(df.head().to_string(index=False))

    except Exception as error:
        print(f"ERROR: {error}")

print("\n\nDATASET INSPECTION COMPLETED!")

