import logging
from flask import Flask, jsonify, Response, request
from flask_cors import CORS, cross_origin
import service
import os
import json

app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG if os.environ.get("ENVIRONMENT") != "DEPLOYMENT" else logging.INFO)

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

# @app.route("/", methods = ['GET'])
# def index():
#     try:
#         response =  {
#             "content": "This is the index json response"
#         }
#         return jsonify(response)
#     except:
#         return Response(ERROR_RESPONSE, status=500, mimetype='application/json')

#Example method for getting data from the server
# @app.route("/api/f1-race-results",methods=['GET'])
# def getData():
#     try:
#         response = service.getSessionData(int(request.args["year"]), request.args["circuit"],request.args["session"])
#         return jsonify(response.to_json(orient = "records"))
#     except:
#         return Response(ERROR_RESPONSE, status=500, mimetype='application/json')

    
@app.route('/api/f1-standings', methods=['GET'])
def getStandings():
    year = request.args.get("year")
    circuit = request.args.get("circuit")
    session = request.args.get("session")

    print("Year:", year, "Circuit:", circuit, "Session:", session)
    
    if not year or not circuit or not session:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        response = service.getStandingsData(int(year), circuit, session)
        return jsonify(response), 200
    except Exception as e:
        logging.error("Error fetching standings data: %s", str(e)) 
        return jsonify({"error": "Internal Server Error"}), 500
    
@app.route("/api/f1-circuits", methods=["GET"])
def get_circuits():
    year = request.args.get("year", type=int)
    if not year:
        return jsonify({"error": "Year is required"}), 400
    
    circuits = service.getCircuitsByYear(year)
    return jsonify({"circuits": circuits})
    

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