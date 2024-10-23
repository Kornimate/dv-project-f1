FROM python:3.12-alpine

WORKDIR /app

ENV ENVIRONMENT=DEPLOYMENT

COPY requirements.txt /app

COPY server.py /app

COPY service.py /app

RUN apk add --no-cache gfortran gcc musl-dev python3-dev libffi-dev build-base openblas-dev

RUN pip3 install -r requirements.txt

EXPOSE 4000

CMD ["python","server.py"]