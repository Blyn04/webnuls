from analyticsAI.analytics import predict_sales
from flask import jsonify

def predict_sales_http(request):
    try:
        result = predict_sales()
        return jsonify({'prediction': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
