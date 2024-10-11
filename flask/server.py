from crypt import methods

from flask import Flask, jsonify, Response, request
from flask_cors import CORS, cross_origin
import service
import os
import json

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

#Example method for getting data from the server
@app.route("/api/f1-race-results",methods=['GET'])
def getData():
    try:
        response = service.getSessionData(int(request.args["year"]), request.args["circuit"],request.args["session"])
        return jsonify(response.to_json(orient = "records"))
    except:
        return Response(ERROR_RESPONSE, status=500, mimetype='application/json')

@app.route("/api/f1-fastest-lap", methods=['GET'])
def get_fastest_lap():
    try:
        print(1)
        response = service.get_fastest_lap(int(request.args["year"]), request.args["circuit"], request.args["session"], request.args["driver"])
        return jsonify(response.to_json(orient = "records"))
    except:
        return Response(ERROR_RESPONSE, status=500, mimetype='application/json')

if __name__ == '__main__':
    if os.environ.get("ENVIRONMENT") == "DEPLOYMENT":
        app.run(host='0.0.0.0',port=5000)
    else:
        app.run(debug=True)