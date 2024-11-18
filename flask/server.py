from flask import Flask, jsonify, Response, request
from flask_cors import CORS, cross_origin
import service
import os
import json
import fastf1
from service import getSessionData


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

ERROR_RESPONSE = json.dumps({
    'success':False,
    'message':"Error while getting data from server"
})

# Template for writing api endpoints
# @app.route("/api/<your-endpoint-name", methods=['GET']) #must start with /api/ in the route!
# def <endpoint-name>():
#     try:
#         data = <service-method-call>
#         return jsonify(data)
#     except:
#         return Response(ERROR_RESPONSE, status=500, mimetype='application/json')


# @app.route("/api/tire-strategy", methods=['GET'])
# def tire_strategy():
#     try:
#         # Extract parameters from the request
#         year = int(request.args.get("year"))
#         circuit = request.args.get("circuit")
#         session_type = request.args.get("session")

#         # Fetch session data using the getSessionData method from service.py
#         data = getSessionData(year, circuit, session_type)

#         # Return the response as JSON
#         if data:
#             return jsonify({"success": True, "dataset": data})
#         else:
#             return jsonify({"success": False, "message": "Error while getting data from server"}), 500

#     except Exception as e:
#         # Log the error and return a user-friendly error message
#         print(f"Error in tire_strategy endpoint: {e}")
#         return jsonify({"success": False, "message": "Error while getting data from server"}), 500

                
@app.route("/", methods = ['GET'])
def index():
    try:
        response =  {
            "content": "This is the index json response"
        }
        return jsonify(response)
    except:
        return Response(ERROR_RESPONSE, status=500, mimetype='application/json')

#Example method for getting data from the server
@app.route("/api/f1-race-results",methods=['GET'])
def getData():
    try:
        response = service.getSessionData(int(request.args["year"]), request.args["circuit"],request.args["session"])
        return jsonify(response.to_json(orient = "records"))
    except:
        return Response(ERROR_RESPONSE, status=500, mimetype='application/json')


@app.route("/api/tire-strategy", methods=['GET'])
def get_tire_strategy():
    """
    API endpoint to fetch tire strategy data for a given year, circuit, and session.
    Parameters: year, circuit, session (query parameters)
    """
    try:
        year = int(request.args.get("year"))
        circuit = request.args.get("circuit")
        session = request.args.get("session")
        
        if not year or not circuit or not session:
            return jsonify({"error": "Missing required parameters"}), 400
        
        tire_strategy = service.getTireStrategyData(year, circuit, session)
        return jsonify({"success": True, "tire_strategy": tire_strategy})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    if os.environ.get("ENVIRONMENT") == "DEPLOYMENT":
        app.run(host='0.0.0.0',port=5000)
    else:
        app.run(debug=True)