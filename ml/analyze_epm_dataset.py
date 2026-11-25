
from pathlib import Path
import json
import pandas as pd

# ==========================================
# 1. PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

EPM_DIR = (
    BASE_DIR
    / "data"
    / "raw"
    / "EPMDataset"
    / "EPM Dataset 2"
)

PROCESSES_DIR = EPM_DIR / "Data" / "Processes"

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_CSV = OUTPUT_DIR / "epm_activity_analysis.csv"
OUTPUT_JSON = OUTPUT_DIR / "epm_dataset_report.json"

# Maximum reasonable duration for one activity record
MAX_DURATION_SECONDS = 24 * 60 * 60

COLUMNS = [
    "session",
    "student_id",
    "exercise",
    "activity",
    "start_time",
    "end_time",
    "idle_time_ms",
    "mouse_wheel",
    "mouse_wheel_click",
    "mouse_click_left",
    "mouse_click_right",
    "mouse_movement",
    "keystroke"
]

NUMERIC_COLUMNS = [
    "idle_time_ms",
    "mouse_wheel",
    "mouse_wheel_click",
    "mouse_click_left",
    "mouse_click_right",
    "mouse_movement",
    "keystroke"
]


# ==========================================
# 2. LOAD ACTIVITY FILES
# ==========================================

def load_activity_files():

    if not PROCESSES_DIR.exists():
        raise FileNotFoundError(
            f"Processes folder not found: {PROCESSES_DIR}"
        )

    all_data = []

    session_folders = sorted(
        folder for folder in PROCESSES_DIR.iterdir()
        if folder.is_dir()
        and folder.name.lower().startswith("session")
    )

    if not session_folders:
        raise ValueError(
            "No session folders found inside Processes."
        )

    for session_folder in session_folders:

        try:
            session_number = int(
                session_folder.name.split()[-1]
            )
        except ValueError:
            print(
                "Skipping folder with unexpected name:",
                session_folder.name
            )
            continue

        activity_files = [
            file for file in session_folder.rglob("*")
            if file.is_file()
        ]

        for file_path in activity_files:

            try:
                df = pd.read_csv(
                    file_path,
                    header=None,
                    names=COLUMNS,
                    sep=",",
                    skipinitialspace=True,
                    encoding="utf-8",
                    on_bad_lines="skip"
                )

                # Attach source information
                df["session"] = session_number
                df["student_id"] = file_path.stem

                all_data.append(df)

            except Exception as error:
                print(
                    "Could not read:",
                    file_path,
                    "| Reason:",
                    error
                )

    if not all_data:
        raise ValueError(
            "No activity records could be loaded."
        )

    return pd.concat(
        all_data,
        ignore_index=True
    )


# ==========================================
# 3. CLEAN AND PROCESS DATA
# ==========================================

def clean_and_process(df):

    df = df.copy()

    original_count = len(df)

    # Convert timestamps
    df["start_time"] = pd.to_datetime(
        df["start_time"],
        format="%d.%m.%Y %H:%M:%S",
        errors="coerce"
    )

    df["end_time"] = pd.to_datetime(
        df["end_time"],
        format="%d.%m.%Y %H:%M:%S",
        errors="coerce"
    )

    # Convert numeric columns safely
    for column in NUMERIC_COLUMNS:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        ).fillna(0)

    # Remove rows with invalid timestamps
    invalid_timestamp_count = int(
        df[["start_time", "end_time"]]
        .isna()
        .any(axis=1)
        .sum()
    )

    df = df.dropna(
        subset=["start_time", "end_time"]
    ).copy()

    # Calculate elapsed activity time
    df["duration_seconds"] = (
        df["end_time"] - df["start_time"]
    ).dt.total_seconds()

    # Remove negative and unusually long records
    invalid_duration_count = int(
        (
            (df["duration_seconds"] < 0)
            | (
                df["duration_seconds"]
                > MAX_DURATION_SECONDS
            )
        ).sum()
    )

    df = df[
        (df["duration_seconds"] >= 0)
        & (
            df["duration_seconds"]
            <= MAX_DURATION_SECONDS
        )
    ].copy()

    # Convert idle time from milliseconds to seconds
    df["idle_seconds_original"] = (
        df["idle_time_ms"] / 1000
    )

    # Count negative idle values
    negative_idle_count = int(
        (df["idle_seconds_original"] < 0).sum()
    )

    # Count idle values exceeding activity duration
    excessive_idle_count = int(
        (
            df["idle_seconds_original"]
            > df["duration_seconds"]
        ).sum()
    )

    # Correct idle time to valid range
    df["idle_seconds"] = df[
        "idle_seconds_original"
    ].clip(lower=0)

    df["idle_seconds"] = df[
        ["idle_seconds", "duration_seconds"]
    ].min(axis=1)

    # Calculate active interaction time
    df["active_seconds"] = (
        df["duration_seconds"]
        - df["idle_seconds"]
    ).clip(lower=0)

    cleaning_report = {
        "original_records": original_count,
        "invalid_timestamp_records": invalid_timestamp_count,
        "invalid_duration_records": invalid_duration_count,
        "negative_idle_records": negative_idle_count,
        "excessive_idle_records": excessive_idle_count,
        "valid_records": len(df)
    }

    return df, cleaning_report


# ==========================================
# 4. CREATE EXERCISE SUMMARY
# ==========================================

def create_exercise_summary(df):

    exercise_data = df[
        df["exercise"].astype(str).str.match(
            r"^Es_\d+_\d+$",
            na=False
        )
    ].copy()

    if exercise_data.empty:
        return pd.DataFrame(
            columns=[
                "session",
                "student_id",
                "exercise",
                "activity_records",
                "total_duration_seconds",
                "idle_seconds",
                "active_seconds",
                "activity_types",
                "total_keystrokes",
                "mouse_clicks",
                "active_minutes",
                "total_duration_minutes"
            ]
        )

    summary = (
        exercise_data.groupby(
            ["session", "student_id", "exercise"],
            as_index=False
        )
        .agg(
            activity_records=("activity", "count"),
            total_duration_seconds=(
                "duration_seconds", "sum"
            ),
            idle_seconds=("idle_seconds", "sum"),
            active_seconds=("active_seconds", "sum"),
            activity_types=("activity", "nunique"),
            total_keystrokes=("keystroke", "sum"),
            mouse_clicks=("mouse_click_left", "sum")
        )
    )

    summary["active_minutes"] = (
        summary["active_seconds"] / 60
    ).round(2)

    summary["total_duration_minutes"] = (
        summary["total_duration_seconds"] / 60
    ).round(2)

    return summary


# ==========================================
# 5. CREATE DATASET REPORT
# ==========================================

def create_report(df, summary, cleaning_report):

    report = {
        "dataset": "Educational Process Mining",
        "original_activity_records": (
            cleaning_report["original_records"]
        ),
        "valid_activity_records": len(df),
        "students_count": int(
            df["student_id"].nunique()
        ),
        "sessions_count": int(
            df["session"].nunique()
        ),
        "exercises_count": int(
            summary["exercise"].nunique()
        ),
        "exercise_records": len(summary),
        "total_recorded_duration_minutes": round(
            float(df["duration_seconds"].sum() / 60),
            2
        ),
        "total_active_interaction_minutes": round(
            float(df["active_seconds"].sum() / 60),
            2
        ),
        "average_activity_seconds": round(
            float(df["duration_seconds"].mean()),
            2
        ),
        "average_active_seconds": round(
            float(df["active_seconds"].mean()),
            2
        ),
        "average_exercise_active_minutes": round(
            float(summary["active_minutes"].mean()),
            2
        ) if not summary.empty else 0,
        "cleaning_report": cleaning_report,
        "activity_types": {
            str(key): int(value)
            for key, value in
            df["activity"].value_counts().items()
        }
    }

    return report


# ==========================================
# 6. MAIN
# ==========================================

def main():

    print("\nEPM DATASET ANALYSIS")
    print("=" * 50)

    print("Dataset path:", EPM_DIR)
    print("Processes folder exists:", PROCESSES_DIR.exists())

    # Load
    raw_data = load_activity_files()

    print("\nRaw activity records:", len(raw_data))

    # Clean
    data, cleaning_report = clean_and_process(
        raw_data
    )

    print("\nDATA CLEANING")
    print("-" * 40)

    for key, value in cleaning_report.items():
        print(f"{key}: {value}")

    # Summarize
    summary = create_exercise_summary(data)

    # Report
    report = create_report(
        data,
        summary,
        cleaning_report
    )

    # Save CSV
    summary.to_csv(
        OUTPUT_CSV,
        index=False,
        encoding="utf-8-sig"
    )

    # Save JSON
    OUTPUT_JSON.write_text(
        json.dumps(
            report,
            ensure_ascii=False,
            indent=4
        ),
        encoding="utf-8"
    )

    # Display results
    print("\n" + "=" * 50)
    print("FINAL RESULTS")
    print("=" * 50)

    print("Students:", report["students_count"])
    print("Sessions:", report["sessions_count"])
    print("Exercises:", report["exercises_count"])

    print(
        "Valid records:",
        report["valid_activity_records"]
    )

    print(
        "Total recorded minutes:",
        report["total_recorded_duration_minutes"]
    )

    print(
        "Total active interaction minutes:",
        report["total_active_interaction_minutes"]
    )

    print(
        "Average activity seconds:",
        report["average_activity_seconds"]
    )

    print(
        "Average active seconds:",
        report["average_active_seconds"]
    )

    print("\nSaved files:")
    print(OUTPUT_CSV)
    print(OUTPUT_JSON)

    print("\nAnalysis completed successfully!")


if __name__ == "__main__":
    try:
        main()

    except Exception as error:
        print("\nANALYSIS FAILED")
        print("Error:", error)
        raise
