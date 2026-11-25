
from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.dummy import DummyRegressor

# Project paths
ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "processed" / "epm_student_exercise_aggregated.csv"
MODEL_PATH = ROOT / "ml" / "study_time_model.pkl"
REPORT_PATH = ROOT / "data" / "processed" / "time_model_report.json"

# Load data
df = pd.read_csv(DATA_PATH)

# Features available before completing an exercise
numeric_features = [
    "task_count",
    "has_schematic",
    "has_functional_simulation",
    "has_truth_table",
    "has_timing_simulation",
]

categorical_features = [
    "exercise_id",
    "topics",
]

target = "tracked_relevant_minutes"
required = (
    numeric_features
    + categorical_features
    + ["student_id", target]
)

missing = [col for col in required if col not in df.columns]
if missing:
    raise ValueError(f"Missing required columns: {missing}")

# Prepare data
data = df[required].copy()
data[target] = pd.to_numeric(data[target], errors="coerce")

for col in numeric_features:
    data[col] = pd.to_numeric(data[col], errors="coerce")

for col in categorical_features:
    data[col] = data[col].fillna("Unknown").astype(str)

data = data.dropna(subset=[target, "student_id"]).copy()

X = data[numeric_features + categorical_features]
y = data[target]
groups = data["student_id"]

# Split by student to avoid testing on students seen during training
splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.20,
    random_state=42
)

train_idx, test_idx = next(splitter.split(X, y, groups))

X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

# Preprocessing
numeric_transformer = Pipeline([
    ("imputer", SimpleImputer(strategy="median"))
])

categorical_transformer = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore"))
])

preprocessor = ColumnTransformer([
    ("numeric", numeric_transformer, numeric_features),
    ("categorical", categorical_transformer, categorical_features),
])

# Baseline: predict the median training time
baseline = DummyRegressor(strategy="median")
baseline.fit(X_train, y_train)
baseline_predictions = baseline.predict(X_test)

# Random Forest model
model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(
        n_estimators=300,
        max_depth=6,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1
    ))
])

model.fit(X_train, y_train)
predictions = model.predict(X_test)

# Evaluation
baseline_mae = mean_absolute_error(y_test, baseline_predictions)
model_mae = mean_absolute_error(y_test, predictions)
model_rmse = mean_squared_error(y_test, predictions) ** 0.5
model_r2 = r2_score(y_test, predictions)

# Train final model using all available records
model.fit(X, y)
joblib.dump(model, MODEL_PATH)

report = {
    "model": "RandomForestRegressor",
    "target": target,
    "target_mean_minutes": round(float(y.mean()), 2),
    "records_used": int(len(data)),
    "unique_students": int(groups.nunique()),
    "unique_exercises": int(data["exercise_id"].nunique()),
    "features": numeric_features + categorical_features,
    "test_students": int(groups.iloc[test_idx].nunique()),
    "baseline_mae_minutes": round(float(baseline_mae), 2),
    "model_mae_minutes": round(float(model_mae), 2),
    "model_rmse_minutes": round(float(model_rmse), 2),
    "model_r2": round(float(model_r2), 3),
    "warning": (
        "Exploratory model only. The dataset contains four exercises, "
        "and tracked interaction time is not necessarily actual study time."
    )
}

REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
with open(REPORT_PATH, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=4, ensure_ascii=False)

print("=" * 55)
print("STUDY TIME PREDICTION MODEL")
print("=" * 55)
print(f"Records used: {len(data)}")
print(f"Students: {groups.nunique()}")
print(f"Exercises: {data['exercise_id'].nunique()}")
print("-" * 55)
print(f"Baseline MAE: {baseline_mae:.2f} minutes")
print(f"Model MAE:    {model_mae:.2f} minutes")
print(f"Model RMSE:   {model_rmse:.2f} minutes")
print(f"Model R2:     {model_r2:.3f}")
print("-" * 55)
print(f"Model saved: {MODEL_PATH}")
print(f"Report saved: {REPORT_PATH}")
print("=" * 55)
print("Training completed.")
