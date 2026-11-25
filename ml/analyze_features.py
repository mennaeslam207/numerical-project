
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "raw" / "student_productivity_distraction_dataset_20000.csv"

df = pd.read_csv(DATA_PATH)

target = "study_hours_per_day"

print("\n========== TARGET ANALYSIS ==========")
print(df[target].describe())

print("\n========== TARGET DISTRIBUTION ==========")
print("Unique values:", df[target].nunique())
print("Most common values:")
print(df[target].value_counts().head(10))

print("\n========== NUMERIC CORRELATIONS ==========")
numeric_df = df.select_dtypes(include="number")

correlations = numeric_df.corr()[target].drop(target)
correlations = correlations.sort_values(
    key=lambda values: values.abs(),
    ascending=False
)

print(correlations)

print("\n========== CATEGORICAL FEATURES ==========")
categorical_columns = df.select_dtypes(
    exclude="number"
).columns.tolist()

for column in categorical_columns:
    print(f"\n{column}")
    print(
        df.groupby(column, observed=True)[target]
        .agg(["count", "mean"])
        .sort_values("mean", ascending=False)
    )

print("\n========== ANALYSIS COMPLETED ==========")
