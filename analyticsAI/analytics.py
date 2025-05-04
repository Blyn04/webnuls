import sys
import json
import numpy as np
from sklearn.linear_model import LinearRegression

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        payload = json.loads(input_data)
        sales_data = payload.get("salesData", [])

        if not sales_data:
            print("Error: No sales data provided", file=sys.stderr)
            sys.exit(1)

        # Prepare training data
        X = np.arange(len(sales_data)).reshape(-1, 1)
        y = np.array(sales_data)

        model = LinearRegression()
        model.fit(X, y)

        # Predict the next month's sales
        next_month = np.array([[len(sales_data)]])
        prediction = model.predict(next_month)

        print(f"{prediction[0]:.2f}")  # Output for stdout

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
