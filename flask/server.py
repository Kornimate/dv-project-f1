from flask import Flask, jsonify, Response, request
from flask_cors import CORS, cross_origin
import service
import os
import json
import logging

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

@app.route("/", methods = ['GET'])
def index():
    try:
        response =  {
            "content": "This is the index json response"
        }
        return jsonify(response)
    except:
        return Response(ERROR_RESPONSE, status=500, mimetype='application/json')

@app.route('/api/f1-standings', methods=['GET'])
def getStandings():
    year = request.args.get("year")
    race = request.args.get("race")
    session = request.args.get("session")

    print("Year:", year, "Race:", race, "Session:", session)
    
    if not year or not race or not session:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        response = service.getStandingsData(int(year), int(race), session)
        return jsonify(response), 200
    except Exception as e:
        logging.error("Error fetching standings data: %s", str(e)) 
        return jsonify({"error": "Internal Server Error"}), 500
    
@app.route("/api/tire-strategy", methods=['GET'])
def get_tire_strategy():
    """
    API endpoint to fetch tire strategy data for a given year, circuit, and session.
    Parameters: year, circuit, session (query parameters)
    """
    try:
        year = int(request.args.get("year"))
        circuit = int(request.args.get("race"))
        session = request.args.get("session")
        
        if not year or not circuit or not session:
            return jsonify({"error": "Missing required parameters"}), 400
        
        tire_strategy = service.getTireStrategyData2(year, circuit, session)
        return jsonify({"success": True, "tire_strategy": tire_strategy})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/calendar-year-races", methods=['GET'])
def getRaces():
    try:
        response = service.getRacesForYear(int(request.args.get("year")))
        return jsonify(response)
    except:
        return Response(ERROR_RESPONSE, status=500, mimetype="application/json")

@app.route("/api/pilots-for-race", methods=['GET'])
def getDrivers():
    try:
        response = service.getDriversForRace(int(request.args.get("year")), int(request.args.get("race")))
        return jsonify(response)
    except:
        return Response(ERROR_RESPONSE, status=500, mimetype="application/json")

@app.route("/api/pilots-times-for-race", methods=['GET'])
def getTimes():
    try:
        response = service.getRaceLapTimesForDrivers(int(request.args.get("year")), int(request.args.get("race")), request.args.get("racer1"), request.args.get("racer2"))
        return jsonify(response)
    except:
        return Response(ERROR_RESPONSE, status=500, mimetype="application/json")

if __name__ == '__main__':
    if os.environ.get("ENVIRONMENT") == "DEPLOYMENT":
        app.run(host='0.0.0.0',port=5000)
    else:
        app.run(debug=True)