from flask import Flask, jsonify, Response, request
from flask_cors import CORS, cross_origin
import service
import os

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/", methods = ['GET'])
def index():
    try:
        response =  {
            "content": "This is the index json response"
        }
        return jsonify(response)
    except:
        return Response("Error while getting data from server", status=500, mimetype='application/json')

@app.route("/api/f1-race-results",methods=['GET'])
def getData():
    
    try:
        response = service.getSessionData(int(request.args["year"]), request.args["circuit"],request.args["session"])
        return jsonify(response.to_json(orient = "records"))
    except:
        return Response("Error while getting data from server", status=500, mimetype='application/json')

if __name__ == '__main__':
    if os.environ.get("ENVIRONMENT") == "DEPLOYMENT":
        app.run(host='0.0.0.0',port=5000)
    else:
        app.run(debug=True)