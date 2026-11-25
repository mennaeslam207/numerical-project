
from pathlib import Path
import pandas as pd
import json

# ==========================================
# PATHS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSES_DIR = (
    BASE_DIR
    / "data"
    / "raw"
    / "EPMDataset"
    / "EPM Dataset 2"
    / "Data"
    / "Processes"
)

PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

FEATURES_FILE = PROCESSED_DIR / "exercise_features.csv"

OUTPUT_FILE = PROCESSED_DIR / "epm_training_data.csv"
REPORT_FILE = PROCESSED_DIR / "epm_training_report.json"

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
    "keystroke",
]

DATE_FORMAT = "%d.%m.%Y %H:%M:%S"

TARGET_EXERCISES = {
    "Es_1_1",
    "Es_1_2",
    "Es_1_3",
    "Es_1_4",
}


# ==========================================
# CLASSIFY STUDENT ACTIVITIES
# ==========================================

def classify_activity(activity):

    activity = str(activity).strip()

    if activity.startswith("Study_Es_"):
        return "content_view"

    if activity == "Study_Materials":
        return "study_materials"

    if activity.startswith("Deeds_Es_"):
        return "deeds_practice"

    if activity.startswith("FSM_Es_"):
        return "fsm_practice"

    if activity == "Diagram":
        return "timing_diagram"

    if activity.startswith("TextEditor_Es_"):
        return "written_work"

    if activity in ("TextEditor_Es", "TextEditor"):
        return "other_writing"

    if activity in ("Deeds", "Deeds_Es"):
        return "other_deeds"

    if activity == "FSM_Related":
        return "fsm_components"

    if activity == "Properties":
        return "properties"

    if activity == "Aulaweb":
        return "learning_platform"

    if activity == "Blank":
        return "blank"

    if activity == "Other":
        return "other"

    return "unclassified"


# ==========================================
# LOAD RAW EPM DATA
# ==========================================

def load_epm_data():

    if not PROCESSES_DIR.exists():
        raise FileNotFoundError(
            f"Processes folder not found:\n{PROCESSES_DIR}"
        )

    files = [
        path for path in PROCESSES_DIR.rglob("*")
        if path.is_file()
    ]

    if not files:
        raise FileNotFoundError(
            "No EPM data files found."
        )

    frames = []
    skipped_files = 0

    print(f"Files found: {len(files)}")

    for index, file_path in enumerate(files, start=1):

        try:
            df = pd.read_csv(
                file_path,
                header=None,
                names=COLUMNS,
                skipinitialspace=True,
                on_bad_lines="skip",
                low_memory=False
            )

            if df.empty:
                skipped_files += 1
                continue

            if not df["start_time"].astype(str).str.contains(
                r"\d{1,2}\.\d{1,2}\.\d{4}",
                regex=True
            ).any():
                skipped_files += 1
                continue

            frames.append(df)

        except Exception:
            skipped_files += 1

        if index % 100 == 0:
            print(f"Processed files: {index}/{len(files)}")

    if not frames:
        raise ValueError(
            "No valid EPM records could be loaded."
        )

    data = pd.concat(frames, ignore_index=True)

    print(f"Records loaded: {len(data)}")
    print(f"Files skipped: {skipped_files}")

    return data, len(files), skipped_files


# ==========================================
# CLEAN DATA
# ==========================================

def clean_data(data):

    data["start_time"] = pd.to_datetime(
        data["start_time"].astype(str).str.strip(),
        format=DATE_FORMAT,
        errors="coerce"
    )

    data["end_time"] = pd.to_datetime(
        data["end_time"].astype(str).str.strip(),
        format=DATE_FORMAT,
        errors="coerce"
    )

    data["session"] = pd.to_numeric(
        data["session"], errors="coerce"
    )

    data["student_id"] = pd.to_numeric(
        data["student_id"], errors="coerce"
    )

    data["duration_seconds"] = (
        data["end_time"] - data["start_time"]
    ).dt.total_seconds()

    before = len(data)

    data = data.dropna(
        subset=[
            "session",
            "student_id",
            "exercise",
            "start_time",
            "end_time",
            "duration_seconds",
        ]
    ).copy()

    data = data[
        (data["duration_seconds"] >= 0) &
        (data["duration_seconds"] <= 86400)
    ].copy()

    print(f"Records before cleaning: {before}")
    print(f"Records after cleaning: {len(data)}")

    return data


# ==========================================
# LOAD EXERCISE FEATURES
# ==========================================

def load_exercise_features():

    if not FEATURES_FILE.exists():
        raise FileNotFoundError(
            f"Exercise features file not found:\n{FEATURES_FILE}"
        )

    features = pd.read_csv(FEATURES_FILE)

    required = [
        "exercise_id",
        "title",
        "topics",
        "task_count",
    ]

    missing = [
        col for col in required
        if col not in features.columns
    ]

    if missing:
        raise ValueError(
            f"Missing columns in exercise features: {missing}"
        )

    features = features.drop_duplicates(
        subset=["exercise_id"]
    )

    return features


# ==========================================
# BUILD STUDENT EXERCISE DATA
# ==========================================

def build_training_data(data, features):

    data["exercise"] = (
        data["exercise"].astype(str).str.strip()
    )

    data = data[
        data["exercise"].isin(TARGET_EXERCISES)
    ].copy()

    print(
        f"Records belonging to the 4 target exercises: {len(data)}"
    )

    if data.empty:
        raise ValueError(
            "No records matched the four target exercises."
        )

    data["activity"] = (
        data["activity"].astype(str).str.strip()
    )

    data["activity_category"] = (
        data["activity"].apply(classify_activity)
    )

    # Do not subtract idle_time_ms here.
    # Its values have not yet been validated.

    duration_table = data.pivot_table(
        index=["session", "student_id", "exercise"],
        columns="activity_category",
        values="duration_seconds",
        aggfunc="sum",
        fill_value=0
    )

    duration_table.columns = [
        f"{name}_seconds"
        for name in duration_table.columns
    ]

    count_table = data.pivot_table(
        index=["session", "student_id", "exercise"],
        columns="activity_category",
        values="activity",
        aggfunc="count",
        fill_value=0
    )

    count_table.columns = [
        f"{name}_events"
        for name in count_table.columns
    ]

    result = duration_table.join(
        count_table,
        how="outer"
    ).fillna(0).reset_index()

    result = result.rename(
        columns={"exercise": "exercise_id"}
    )

    seconds_columns = [
        col for col in result.columns
        if col.endswith("_seconds")
    ]

    for col in seconds_columns:
        result[col.replace("_seconds", "_minutes")] = (
            result[col] / 60
        )

    # Content viewing time is not the same as total study time.
    result["content_view_minutes"] = (
        result.get("content_view_seconds", 0) +
        result.get("study_materials_seconds", 0)
    ) / 60

    result["practice_minutes"] = (
        result.get("deeds_practice_seconds", 0) +
        result.get("fsm_practice_seconds", 0) +
        result.get("timing_diagram_seconds", 0) +
        result.get("fsm_components_seconds", 0) +
        result.get("other_deeds_seconds", 0)
    ) / 60

    result["writing_minutes"] = (
        result.get("written_work_seconds", 0) +
        result.get("other_writing_seconds", 0)
    ) / 60

    result["tracked_relevant_minutes"] = (
        result["content_view_minutes"] +
        result["practice_minutes"] +
        result["writing_minutes"]
    )

    # Attach the exercise characteristics.
    result = result.merge(
        features,
        on="exercise_id",
        how="left",
        validate="many_to_one"
    )

    return result


# ==========================================
# MAIN
# ==========================================

def main():

    print("=" * 60)
    print("SMART STUDY PLANNER")
    print("EPM STUDENT-EXERCISE DATA BUILDER")
    print("=" * 60)

    raw_data, files_found, files_skipped = load_epm_data()

    clean = clean_data(raw_data)

    features = load_exercise_features()

    result = build_training_data(clean, features)

    result.to_csv(
        OUTPUT_FILE,
        index=False,
        encoding="utf-8-sig"
    )

    report = {
        "files_found": files_found,
        "files_skipped": files_skipped,
        "raw_records": int(len(raw_data)),
        "clean_records": int(len(clean)),
        "matched_records": int(
            clean["exercise"].isin(TARGET_EXERCISES).sum()
        ),
        "students": int(result["student_id"].nunique()),
        "exercises": int(result["exercise_id"].nunique()),
        "student_exercise_rows": int(len(result)),
        "exercise_ids": sorted(
            result["exercise_id"].unique().tolist()
        ),
        "warning": (
            "Recorded activity durations are not confirmed actual "
            "study time. Idle time was not subtracted. The output "
            "is an exploratory student-exercise dataset, not yet "
            "a validated prediction-training dataset."
        ),
    }

    with open(
        REPORT_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            report,
            file,
            ensure_ascii=False,
            indent=4
        )

    print("\n" + "=" * 60)
    print("BUILD SUMMARY")
    print("=" * 60)

    for key, value in report.items():
        print(f"{key}: {value}")

    print(f"\nSaved CSV:\n{OUTPUT_FILE}")
    print(f"\nSaved report:\n{REPORT_FILE}")

    print("\nFirst rows:")

    print(
        result[
            [
                "student_id",
                "session",
                "exercise_id",
                "content_view_minutes",
                "practice_minutes",
                "writing_minutes",
                "task_count",
            ]
        ].head(10).to_string(index=False)
    )

    print("\nData building completed successfully!")


if __name__ == "__main__":
    main()
