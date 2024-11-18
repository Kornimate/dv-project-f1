FROM python:3.12-alpine

WORKDIR /app

ENV ENVIRONMENT=DEPLOYMENT

COPY requirements.txt /app

COPY server.py /app

COPY service.py /app

RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["python","server.py"]