# The Project

The project consists of two separate parts: a frontend part written in javascript and react, and a backend part written in python and flask.

## Requirements for running Project

If you want to run the projects separately you need:
- NodeJS installed on your device for the frontend part \
(check by using command ```node -v```)
- Python installed on your device for the backend part \
(check by using command ```python --version```)

If you want to run the projects at the same time or use the dockerfiles then, you have to have docker (on Windows docker desktop) installed on your device. 

## Starting the Project

### Starting the frontend and backend separately

For starting the **frontend** you need to navigate to the */react* folder. \
In the folder you give the following command: ```npm start``` \
This command starts the application in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

For starting the **backend** you need to navigate to the */flask* folder. \
In the folder you give the following command: ```python server.py``` \
This command starts the python script to fire up the backend and data source.
Open [http://127.0.0.1:5000](http://127.0.0.1:5000) to view it in your browser. (127.0.0.1 and localhost are the same)

### Starting the frontend and backend at the same time with docker

Start the Docker engine. \
Naigate to the folder where the **docker-compose.yaml** file is located. \
Give the following command: ```docker-compose up --build``` \
The containers will be created and the total application (frontend + backend) will be running on [http://localhost:80](http://localhost:80)

The reverse proxy is ensured by nginx, so when you want to see the backend endpoints you do not have to specify the port, just write http://localhost/api/*endpoint-name* or you can also see it at http://localhost:5000 while the docker containers are running.

