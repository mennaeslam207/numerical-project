
from pathlib import Path
import pandas as pd
import json

# Project paths
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

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_JSON = OUTPUT_DIR / "epm_validation_report.json"

# The extensionless EPM files contain 13 comma-separated fields.
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


def load_epm_files():
    if not PROCESSES_DIR.exists():
        raise FileNotFoundError(
            f"Processes folder not found: {PROCESSES_DIR}"
        )

    files = [
        path for path in PROCESSES_DIR.rglob("*")
        if path.is_file()
    ]

    if not files:
        raise FileNotFoundError("No data files found in Processes folder.")

    frames = []
    skipped_files = []

    for file_path in files:
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
                skipped_files.append(str(file_path))
                continue

            # Keep only files that contain valid EPM activity structure.
            if not df["start_time"].astype(str).str.contains(
                r"\d{1,2}\.\d{1,2}\.\d{4}",
                regex=True
            ).any():
                skipped_files.append(str(file_path))
                continue

            df["source_file"] = str(file_path)
            frames.append(df)

        except Exception as error:
            skipped_files.append(
                f"{file_path} | {error}"
            )

    if not frames:
        raise ValueError(
            "No valid EPM activity files could be loaded."
        )

    data = pd.concat(frames, ignore_index=True)

    return data, len(files), skipped_files


def validate_data(data):
    original_records = len(data)

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

    numeric_columns = [
        "session",
        "student_id",
        "idle_time_ms",
        "mouse_wheel",
        "mouse_wheel_click",
        "mouse_click_left",
        "mouse_click_right",
        "mouse_movement",
        "keystroke",
    ]

    for column in numeric_columns:
        data[column] = pd.to_numeric(
            data[column],
            errors="coerce"
        )

    invalid_timestamps = data[
        data["start_time"].isna() |
        data["end_time"].isna()
    ]

    data = data.drop(invalid_timestamps.index).copy()

    data["duration_seconds"] = (
        data["end_time"] - data["start_time"]
    ).dt.total_seconds()

    invalid_duration = data[
        (data["duration_seconds"] < 0) |
        (data["duration_seconds"] > 86400)
    ]

    data = data.drop(invalid_duration.index).copy()

    negative_idle = int(
        (data["idle_time_ms"] < 0).sum()
    )

    excessive_idle = int(
        (
            data["idle_time_ms"] >
            data["duration_seconds"] * 1000
        ).sum()
    )

    data["idle_seconds_raw"] = (
        data["idle_time_ms"] / 1000
    )

    # Keep the original idle value for validation.
    # Clip only when calculating estimated active time.
    data["idle_seconds_clipped"] = (
        data["idle_seconds_raw"]
        .clip(lower=0)
    )

    data["active_seconds_estimated"] = (
        data["duration_seconds"] -
        data["idle_seconds_clipped"]
    ).clip(lower=0)

    report = {
        "original_records": int(original_records),
        "invalid_timestamp_records": int(
            len(invalid_timestamps)
        ),
        "invalid_duration_records": int(
            len(invalid_duration)
        ),
        "negative_idle_records": negative_idle,
        "idle_exceeds_duration_records": excessive_idle,
        "valid_records": int(len(data)),
        "students": int(data["student_id"].nunique()),
        "sessions": int(data["session"].nunique()),
        "exercises": int(data["exercise"].nunique()),
        "total_recorded_minutes": round(
            data["duration_seconds"].sum() / 60, 2
        ),
        "estimated_active_minutes": round(
            data["active_seconds_estimated"].sum() / 60, 2
        ),
        "warning": (
            "Estimated active time is not confirmed study time. "
            "Idle-time values must be interpreted using the dataset "
            "documentation before training a study-time prediction model."
        )
    }

    return data, report


def check_overlaps(data):
    """
    Estimate overlaps between activity intervals for each student
    within each session. This helps identify whether summing event
    durations may double-count elapsed time.
    """

    overlap_groups = 0
    overlap_records = 0
    overlap_seconds = 0.0
    union_seconds = 0.0

    grouped = data.groupby(
        ["session", "student_id"],
        dropna=True
    )

    for _, group in grouped:
        group = group.sort_values("start_time")

        intervals = list(
            zip(
                group["start_time"],
                group["end_time"]
            )
        )

        if not intervals:
            continue

        current_start, current_end = intervals[0]
        group_union = 0.0
        group_overlap = 0.0
        group_overlap_count = 0

        for start, end in intervals[1:]:
            if start < current_end:
                group_overlap_count += 1
                group_overlap += (
                    current_end - start
                ).total_seconds()

                if end > current_end:
                    current_end = end
            else:
                group_union += (
                    current_end - current_start
                ).total_seconds()

                current_start = start
                current_end = end

        group_union += (
            current_end - current_start
        ).total_seconds()

        if group_overlap_count:
            overlap_groups += 1

        overlap_records += group_overlap_count
        overlap_seconds += group_overlap
        union_seconds += group_union

    return {
        "groups_with_overlaps": int(overlap_groups),
        "overlapping_interval_count": int(overlap_records),
        "estimated_overlap_minutes": round(
            overlap_seconds / 60, 2
        ),
        "union_elapsed_minutes": round(
            union_seconds / 60, 2
        ),
    }


def main():
    print("=" * 55)
    print("EPM DATA VALIDATION")
    print("=" * 55)

    data, total_files, skipped_files = load_epm_files()

    print(f"Files found: {total_files}")
    print(f"Valid activity records loaded: {len(data)}")
    print(f"Files skipped: {len(skipped_files)}")

    data, report = validate_data(data)

    overlap_report = check_overlaps(data)
    report.update(overlap_report)

    report["files_found"] = int(total_files)
    report["files_skipped"] = int(len(skipped_files))

    with open(OUTPUT_JSON, "w", encoding="utf-8") as file:
        json.dump(
            report,
            file,
            ensure_ascii=False,
            indent=4
        )

    print("\nVALIDATION RESULTS")
    print("-" * 55)

    for key, value in report.items():
        print(f"{key}: {value}")

    print("\nSaved report:")
    print(OUTPUT_JSON)

    print("\nValidation completed successfully.")


if __name__ == "__main__":
    main()
