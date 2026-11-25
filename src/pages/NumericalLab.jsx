
import React, { useState } from "react";

function NumericalLab() {
  const [method, setMethod] = useState("bisection");
  const [a, setA] = useState("1");
  const [b, setB] = useState("2");
  const [tolerance, setTolerance] = useState("0.0001");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Example Function: f(x) = x^3 - x - 2
  const f = (x) => x ** 3 - x - 2;

  const bisection = (left, right, tol) => {
    if (f(left) * f(right) >= 0) {
      throw new Error("The interval must contain a sign change.");
    }

    const rows = [];
    let mid;
    let iteration = 0;

    while (iteration < 1000) {
      mid = (left + right) / 2;

      rows.push({
        iteration: iteration + 1,
        a: left,
        b: right,
        midpoint: mid,
        fx: f(mid),
      });

      if (
        Math.abs(f(mid)) <= tol ||
        Math.abs(right - left) / 2 <= tol
      ) {
        break;
      }

      if (f(left) * f(mid) < 0) {
        right = mid;
      } else {
        left = mid;
      }

      iteration++;
    }

    return {
      root: mid,
      iterations: rows.length,
      rows,
    };
  };

  const secant = (x0, x1, tol) => {
    const rows = [];

    for (let i = 0; i < 1000; i++) {
      const denominator = f(x1) - f(x0);

      if (Math.abs(denominator) < 1e-14) {
        throw new Error("Division by zero in Secant method.");
      }

      const x2 =
        x1 - (f(x1) * (x1 - x0)) / denominator;

      rows.push({
        iteration: i + 1,
        x0,
        x1,
        x2,
        fx: f(x2),
      });

      if (Math.abs(x2 - x1) <= tol) {
        return {
          root: x2,
          iterations: rows.length,
          rows,
        };
      }

      x0 = x1;
      x1 = x2;
    }

    throw new Error("Method did not converge.");
  };

  const calculate = () => {
    setError("");
    setResult(null);

    try {
      const first = Number(a);
      const second = Number(b);
      const tol = Number(tolerance);

      if (
        a.trim() === "" ||
        b.trim() === "" ||
        tolerance.trim() === "" ||
        !Number.isFinite(first) ||
        !Number.isFinite(second) ||
        !Number.isFinite(tol) ||
        tol <= 0
      ) {
        throw new Error("Please enter valid numerical values.");
      }

      if (first === second) {
        throw new Error("The two initial values must be different.");
      }

      const output =
        method === "bisection"
          ? bisection(first, second, tol)
          : secant(first, second, tol);

      setResult(output);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="numerical-page" dir="ltr" lang="en">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="numerical-badge">
            NUMERICAL ANALYSIS
          </span>

          <h1>Numerical Methods Lab</h1>

          <p>
            Solve nonlinear equations using numerical methods.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="numerical-card">

        <div className="calculator-heading">
          <div>
            <span className="calculator-label">
              ROOT SOLVER
            </span>

            <h2>Root Finding Calculator</h2>

            <p>
              Example function:
              <span className="math-function">
                {" "}f(x) = x³ - x - 2
              </span>
            </p>
          </div>

          <div className="calculator-icon">
            ∑
          </div>
        </div>

        {/* Method Selection */}
        <div className="form-group">
          <label htmlFor="method">
            Select Numerical Method
          </label>

          <select
            id="method"
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setResult(null);
              setError("");
            }}
            lang="en"
            dir="ltr"
          >
            <option value="bisection">Bisection Method</option>
            <option value="secant">Secant Method</option>
          </select>
        </div>

        {/* Initial Values */}
        <div className="numerical-inputs">

          <div className="form-group">
            <label htmlFor="value-a">
              {method === "bisection"
                ? "Lower Bound (a)"
                : "Initial Value (x0)"}
            </label>

            <input
              id="value-a"
              type="number"
              lang="en"
              dir="ltr"
              step="any"
              placeholder="Enter first value"
              value={a}
              onChange={(e) => setA(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="value-b">
              {method === "bisection"
                ? "Upper Bound (b)"
                : "Initial Value (x1)"}
            </label>

            <input
              id="value-b"
              type="number"
              lang="en"
              dir="ltr"
              step="any"
              placeholder="Enter second value"
              value={b}
              onChange={(e) => setB(e.target.value)}
            />
          </div>

        </div>

        {/* Tolerance */}
        <div className="form-group">
          <label htmlFor="tolerance">
            Tolerance (ε)
          </label>

          <input
            id="tolerance"
            type="number"
            lang="en"
            dir="ltr"
            step="any"
            placeholder="Example: 0.0001"
            value={tolerance}
            onChange={(e) => setTolerance(e.target.value)}
          />
        </div>

        {/* Calculate Button */}
        <button
          className="calculate-btn"
          onClick={calculate}
          type="button"
        >
          Calculate Root
          <span>→</span>
        </button>

        {/* Error */}
        {error && (
          <div className="error-message" role="alert">
            <span>⚠</span>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="numerical-result">

            <div className="result-heading">
              <span className="result-label">
                CALCULATION COMPLETE
              </span>

              <h3>Calculation Result</h3>
            </div>

            <div className="result-highlight">
              <span>Approximate Root</span>

              <h2>{result.root.toFixed(8)}</h2>

              <small>f(root) ≈ {f(result.root).toExponential(4)}</small>
            </div>

            <div className="result-stats">

              <div className="stat-box">
                <span>Iterations</span>
                <strong>{result.iterations}</strong>
              </div>

              <div className="stat-box">
                <span>Method</span>
                <strong>
                  {method === "bisection" ? "Bisection" : "Secant"}
                </strong>
              </div>

              <div className="stat-box">
                <span>Tolerance</span>
                <strong>{tolDisplay(tolerance)}</strong>
              </div>

            </div>

            {/* Iteration Table */}
            <div className="table-section">

              <div className="table-heading">
                <h3>Iteration Details</h3>
                <span>{result.iterations} Steps</span>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Iteration</th>

                      {method === "bisection" ? (
                        <>
                          <th>a</th>
                          <th>b</th>
                          <th>Midpoint</th>
                        </>
                      ) : (
                        <>
                          <th>x0</th>
                          <th>x1</th>
                          <th>x2</th>
                        </>
                      )}

                      <th>f(x)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.iteration}>
                        <td>{row.iteration}</td>

                        {method === "bisection" ? (
                          <>
                            <td>{row.a.toFixed(6)}</td>
                            <td>{row.b.toFixed(6)}</td>
                            <td>{row.midpoint.toFixed(6)}</td>
                          </>
                        ) : (
                          <>
                            <td>{row.x0.toFixed(6)}</td>
                            <td>{row.x1.toFixed(6)}</td>
                            <td>{row.x2.toFixed(6)}</td>
                          </>
                        )}

                        <td>{row.fx.toExponential(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function tolDisplay(value) {
  return Number(value).toString();
}

export default NumericalLab;
