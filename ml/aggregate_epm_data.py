
from pathlib import Path
import pandas as pd
import json

# =====================================
# PATHS
# =====================================

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    BASE_DIR / "data" / "processed" / "epm_training_data.csv"
)

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "epm_student_exercise_aggregated.csv"
REPORT_FILE = OUTPUT_DIR / "epm_aggregation_report.json"


# =====================================
# MAIN
# =====================================

def main():

    print("=" * 55)
    print("STUDENT-EXERCISE DATA AGGREGATION")
    print("=" * 55)

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Input file not found: {INPUT_FILE}"
        )

    df = pd.read_csv(INPUT_FILE)

    if df.empty:
        raise ValueError("Input dataset is empty.")

    required = ["student_id", "exercise_id", "session"]

    missing = [col for col in required if col not in df.columns]

    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    print(f"Original rows: {len(df)}")
    print(f"Unique students: {df['student_id'].nunique()}")
    print(f"Unique exercises: {df['exercise_id'].nunique()}")

    # ---------------------------------
    # Columns to aggregate
    # ---------------------------------

    sum_columns = [
        col for col in df.columns
        if (
            col.endswith("_seconds")
            or col.endswith("_minutes")
            or col.endswith("_events")
        )
    ]

    for col in sum_columns:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # ---------------------------------
    # Metadata columns
    # ---------------------------------

    metadata_columns = [
        col for col in [
            "exercise_code",
            "title",
            "topics",
            "task_count",
            "has_schematic",
            "has_functional_simulation",
            "has_truth_table",
            "has_timing_simulation",
            "pbs_files",
            "image_files",
            "report_files",
            "zip_file",
        ]
        if col in df.columns
    ]

    aggregation = {
        col: "sum" for col in sum_columns
    }

    for col in metadata_columns:
        aggregation[col] = "first"

    aggregation["session"] = "nunique"

    # ---------------------------------
    # Aggregate by student and exercise
    # ---------------------------------

    grouped = (
        df.groupby(
            ["student_id", "exercise_id"],
            as_index=False
        )
        .agg(aggregation)
    )

    grouped = grouped.rename(
        columns={"session": "session_count"}
    )

    # Count original rows for each student/exercise
    row_counts = (
        df.groupby(["student_id", "exercise_id"])
        .size()
        .reset_index(name="source_record_count")
    )

    grouped = grouped.merge(
        row_counts,
        on=["student_id", "exercise_id"],
        how="left"
    )

    # List the sessions in which the student appeared
    session_lists = (
        df.groupby(["student_id", "exercise_id"])["session"]
        .apply(
            lambda values: ", ".join(
                map(
                    str,
                    sorted(pd.to_numeric(values).dropna().unique())
                )
            )
        )
        .reset_index(name="session_ids")
    )

    grouped = grouped.merge(
        session_lists,
        on=["student_id", "exercise_id"],
        how="left"
    )

    # ---------------------------------
    # Recalculate total tracked time
    # ---------------------------------

    time_columns = [
        col for col in [
            "content_view_minutes",
            "practice_minutes",
            "writing_minutes",
        ]
        if col in grouped.columns
    ]

    grouped["tracked_relevant_minutes"] = (
        grouped[time_columns].sum(axis=1)
    )

    # ---------------------------------
    # Save aggregated dataset
    # ---------------------------------

    grouped = grouped.sort_values(
        ["student_id", "exercise_id"]
    )

    grouped.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    # ---------------------------------
    # Create report
    # ---------------------------------

    report = {
        "original_rows": int(len(df)),
        "aggregated_rows": int(len(grouped)),
        "unique_students": int(grouped["student_id"].nunique()),
        "unique_exercises": int(grouped["exercise_id"].nunique()),
        "total_student_exercise_pairs": int(len(grouped)),
        "students_with_multiple_sessions": int(
            (grouped["session_count"] > 1).sum()
        ),
        "average_sessions_per_pair": round(
            float(grouped["session_count"].mean()), 2
        ),
        "average_tracked_minutes": round(
            float(grouped["tracked_relevant_minutes"].mean()), 2
        ),
        "exercise_summary": {}
    }

    for exercise_id, part in grouped.groupby("exercise_id"):

        report["exercise_summary"][exercise_id] = {
            "student_count": int(part["student_id"].nunique()),
            "average_tracked_minutes": round(
                float(part["tracked_relevant_minutes"].mean()), 2
            ),
            "median_tracked_minutes": round(
                float(part["tracked_relevant_minutes"].median()), 2
            )
        }

    with open(REPORT_FILE, "w", encoding="utf-8") as file:
        json.dump(
            report,
            file,
            ensure_ascii=False,
            indent=4
        )

    # ---------------------------------
    # Print results
    # ---------------------------------

    print("\nAGGREGATION RESULTS")
    print("-" * 55)

    for key, value in report.items():
        print(f"{key}: {value}")

    print("\nFirst 10 aggregated rows:")

    display_columns = [
        col for col in [
            "student_id",
            "exercise_id",
            "session_count",
            "content_view_minutes",
            "practice_minutes",
            "writing_minutes",
            "tracked_relevant_minutes",
            "task_count",
        ]
        if col in grouped.columns
    ]

    print(
        grouped[display_columns]
        .head(10)
        .to_string(index=False)
    )

    print("\nSaved files:")
    print(OUTPUT_FILE)
    print(REPORT_FILE)

    print("\nAggregation completed successfully!")


if __name__ == "__main__":
    main()
