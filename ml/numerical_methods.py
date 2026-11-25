
from pathlib import Path
import json
import warnings

import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent

SESSIONS_FILE = BASE_DIR / "data" / "processed" / "study_sessions.csv"
MATERIALS_FILE = BASE_DIR / "data" / "processed" / "materials_topics.json"
RESULT_FILE = BASE_DIR / "data" / "processed" / "time_predictions.json"


# =====================================================
# 1. LOAD AND CLEAN DATA
# =====================================================

def load_data():
    if not SESSIONS_FILE.exists():
        raise FileNotFoundError(SESSIONS_FILE)

    if not MATERIALS_FILE.exists():
        raise FileNotFoundError(MATERIALS_FILE)

    sessions = pd.read_csv(SESSIONS_FILE)

    materials = json.loads(
        MATERIALS_FILE.read_text(encoding="utf-8")
    )

    required = [
        "student_id",
        "pages_count",
        "actual_minutes"
    ]

    for column in required:
        if column not in sessions.columns:
            raise ValueError(f"Missing column: {column}")

    if not isinstance(materials, list):
        raise ValueError("Materials data must be a list.")

    sessions["pages_count"] = pd.to_numeric(
        sessions["pages_count"], errors="coerce"
    )

    sessions["actual_minutes"] = pd.to_numeric(
        sessions["actual_minutes"], errors="coerce"
    )

    sessions = sessions.dropna(
        subset=["student_id", "pages_count", "actual_minutes"]
    ).copy()

    sessions = sessions[
        (sessions["pages_count"] > 0)
        & (sessions["actual_minutes"] > 0)
    ].copy()

    sessions["student_id"] = sessions["student_id"].astype(str)

    return sessions, materials


# =====================================================
# 2. PREPARE HISTORICAL POINTS
# =====================================================

def prepare_points(sessions):
    if sessions.empty:
        return np.array([], dtype=float), np.array([], dtype=float)

    grouped = (
        sessions.groupby("pages_count")["actual_minutes"]
        .median()
        .sort_index()
    )

    x = grouped.index.to_numpy(dtype=float)
    y = grouped.to_numpy(dtype=float)

    return x, y


# =====================================================
# 3. CURVE FITTING
# =====================================================

def curve_fitting(x, y, target_pages):

    if len(x) < 3:
        return None

    if target_pages < x.min() or target_pages > x.max():
        return None

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error")

            coefficients = np.polyfit(x, y, deg=2)

        model = np.poly1d(coefficients)

        prediction = float(model(target_pages))

        if not np.isfinite(prediction) or prediction <= 0:
            return None

        return round(prediction, 2)

    except (ValueError, np.linalg.LinAlgError, Warning):
        return None


# =====================================================
# 4. INTERPOLATION
# =====================================================

def interpolation(x, y, target_pages):

    if len(x) < 2:
        return None

    if target_pages < x.min() or target_pages > x.max():
        return None

    prediction = float(np.interp(target_pages, x, y))

    if not np.isfinite(prediction) or prediction <= 0:
        return None

    return round(prediction, 2)


# =====================================================
# 5. CONTENT DIFFICULTY
# =====================================================

def estimate_difficulty(average_words_per_page):

    if average_words_per_page < 30:
        return "Light", 0.90

    if average_words_per_page <= 70:
        return "Moderate", 1.00

    return "Dense", 1.20


# =====================================================
# 6. STUDENT KNOWLEDGE LEVEL
# =====================================================

def knowledge_multiplier(knowledge_level):

    if not isinstance(knowledge_level, str):
        return 1.0

    level = knowledge_level.strip().lower()

    mapping = {
        "beginner": 1.20,
        "low": 1.20,
        "hard": 1.20,
        "intermediate": 1.00,
        "moderate": 1.00,
        "medium": 1.00,
        "advanced": 0.90,
        "high": 0.90
    }

    return mapping.get(level, 1.0)


# =====================================================
# 7. CONTENT-BASED ESTIMATION
# =====================================================

def heuristic_estimate(
    pages,
    total_words,
    average_words_per_page,
    knowledge_level=None
):

    difficulty, difficulty_factor = estimate_difficulty(
        average_words_per_page
    )

    familiarity_factor = knowledge_multiplier(
        knowledge_level
    )

    page_time = pages * 2.0

    word_time = (total_words / 100.0) * 0.6

    estimate = (
        (page_time + word_time)
        * difficulty_factor
        * familiarity_factor
    )

    estimate = max(5.0, estimate)

    return {
        "method": "Initial content-based estimate",
        "predicted_minutes": round(estimate, 2),
        "difficulty_estimate": difficulty,
        "status": "heuristic_estimate",
        "confidence": "low",
        "history_samples": 0
    }


# =====================================================
# 8. PERSONALIZED STUDY RATE
# =====================================================

def personalized_rate_estimate(
    sessions,
    target_pages,
    content_estimate
):

    if sessions.empty or len(sessions) < 2:
        return None

    history = sessions.copy()

    history["minutes_per_page"] = (
        history["actual_minutes"] / history["pages_count"]
    )

    history = history[
        np.isfinite(history["minutes_per_page"])
        & (history["minutes_per_page"] > 0)
    ]

    if len(history) < 2:
        return None

    # Median is less sensitive to unusually long or short sessions.
    personal_rate = float(
        history["minutes_per_page"].median()
    )

    personal_estimate = personal_rate * target_pages

    if not np.isfinite(personal_estimate) or personal_estimate <= 0:
        return None

    # Combine the student's historical rate with content analysis.
    # The historical estimate gets more weight, but this is still experimental.
    combined_estimate = (
        0.65 * personal_estimate
        + 0.35 * content_estimate["predicted_minutes"]
    )

    return {
        "method": "Personalized study rate + content estimate",
        "predicted_minutes": round(combined_estimate, 2),
        "difficulty_estimate": content_estimate["difficulty_estimate"],
        "status": "personalized_estimate",
        "confidence": "low",
        "history_samples": len(history)
    }


# =====================================================
# 9. MAIN PREDICTION FUNCTION
# =====================================================


def predict_time(
    sessions,
    target_pages,
    total_words,
    average_words_per_page,
    knowledge_level=None
):
    if target_pages <= 0:
        raise ValueError("Target pages must be greater than zero.")

    if total_words < 0 or average_words_per_page < 0:
        raise ValueError("Word counts cannot be negative.")

    x, y = prepare_points(sessions)

    content_estimate = heuristic_estimate(
        pages=target_pages,
        total_words=total_words,
        average_words_per_page=average_words_per_page,
        knowledge_level=knowledge_level
    )

    history_samples = len(sessions)
    content_estimate["history_samples"] = history_samples
    distinct_page_counts = len(x)

    # Apply Curve Fitting when enough historical points exist.
    curve_result = curve_fitting(
        x, y, target_pages
    )

    # Apply Interpolation when at least two distinct points exist.
    interpolation_result = interpolation(
        x, y, target_pages
    )

    # Combine both numerical methods when both are available.
    if (
        curve_result is not None
        and interpolation_result is not None
    ):
        combined_prediction = (
            0.50 * curve_result
            + 0.50 * interpolation_result
        )

        return {
            "method": "Interpolation + Curve Fitting",
            "predicted_minutes": round(combined_prediction, 2),
            "difficulty_estimate": content_estimate["difficulty_estimate"],
            "status": "prediction_available",
            "confidence": "experimental",
            "history_samples": history_samples,
            "distinct_page_counts": distinct_page_counts,
            "curve_fitting_minutes": curve_result,
            "interpolation_minutes": interpolation_result
        }

    # Use Curve Fitting if Interpolation is unavailable.
    if curve_result is not None:
        return {
            "method": "Curve Fitting",
            "predicted_minutes": curve_result,
            "difficulty_estimate": content_estimate["difficulty_estimate"],
            "status": "prediction_available",
            "confidence": "low",
            "history_samples": history_samples,
            "distinct_page_counts": distinct_page_counts
        }

    # Use Interpolation if Curve Fitting is unavailable.
    if interpolation_result is not None:
        return {
            "method": "Interpolation",
            "predicted_minutes": interpolation_result,
            "difficulty_estimate": content_estimate["difficulty_estimate"],
            "status": "prediction_available",
            "confidence": "low",
            "history_samples": history_samples,
            "distinct_page_counts": distinct_page_counts
        }

    # Use personalized estimation when historical data is insufficient.
    personal_result = personalized_rate_estimate(
        sessions=sessions,
        target_pages=target_pages,
        content_estimate=content_estimate
    )

    if personal_result is not None:
        return personal_result

    # Final fallback when there is not enough historical data.
    return content_estimate

# =====================================================
# 10. GET STUDENT KNOWLEDGE
# =====================================================

def get_student_knowledge(sessions):

    if "knowledge_level" not in sessions.columns:
        return None

    history = sessions.dropna(
        subset=["knowledge_level"]
    ).copy()

    if history.empty:
        return None

    if "session_date" in history.columns:
        history["_date"] = pd.to_datetime(
            history["session_date"],
            errors="coerce"
        )

        history = history.sort_values(
            "_date",
            na_position="first"
        )

    return str(history.iloc[-1]["knowledge_level"])


# =====================================================
# 11. RUN PREDICTIONS
# =====================================================

def main():

    print("\n" + "=" * 55)
    print("SMART STUDY PLANNER")
    print("PERSONALIZED STUDY TIME PREDICTION")
    print("=" * 55)

    try:
        sessions, materials = load_data()

        if not materials:
            print("No analyzed materials found.")
            return

        if sessions.empty:
            student_ids = ["Student1"]
        else:
            student_ids = sessions["student_id"].unique().tolist()

        results = []

        for student_id in student_ids:

            student_sessions = sessions[
                sessions["student_id"] == str(student_id)
            ].copy()

            knowledge = get_student_knowledge(
                student_sessions
            )

            print("\n" + "-" * 55)
            print("Student:", student_id)

            x, y = prepare_points(student_sessions)

            print("Historical sessions:", len(student_sessions))
            print("Distinct page counts:", len(x))
            print("Knowledge level:", knowledge)

            for material in materials:

                pages = float(
                    material.get("pages_count", 0) or 0
                )

                words = float(
                    material.get("total_words", 0) or 0
                )

                average_words = float(
                    material.get("average_words_per_page", 0) or 0
                )

                if pages <= 0:
                    print("Skipped material with invalid page count.")
                    continue

                prediction = predict_time(
                    sessions=student_sessions,
                    target_pages=pages,
                    total_words=words,
                    average_words_per_page=average_words,
                    knowledge_level=knowledge
                )

                result = {
                    "student_id": str(student_id),
                    "material_name": material.get("file_name"),
                    "file_type": material.get("file_type"),
                    "pages_count": int(pages),
                    "total_words": int(words),
                    "average_words_per_page": round(average_words, 2),
                    "knowledge_level": knowledge,
                    **prediction
                }

                results.append(result)

                print("\nMaterial:", result["material_name"])
                print("Pages:", result["pages_count"])
                print("Words:", result["total_words"])
                print("Method:", result["method"])
                print(
                    "Estimated time:",
                    result["predicted_minutes"],
                    "minutes"
                )
                print("Confidence:", result["confidence"])
                print("History samples:", result["history_samples"])

        RESULT_FILE.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        RESULT_FILE.write_text(
            json.dumps(
                results,
                ensure_ascii=False,
                indent=4
            ),
            encoding="utf-8"
        )

        print("\n" + "=" * 55)
        print("RESULTS SAVED SUCCESSFULLY")
        print(RESULT_FILE)
        print("=" * 55)

    except FileNotFoundError as error:
        print("Required file not found:", error)

    except Exception as error:
        print("Error:", error)
        raise


if __name__ == "__main__":
    main()
