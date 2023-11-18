# Backend environment docker image
# FROM tensorflow/tensorflow:1.14.0-gpu-py3
# Required for RTX30xx
# FROM pytorch/pytorch:1.12.1-cuda11.3-cudnn8-runtime
# Python != 3.7 necessary to avoid bugs with Celery
# Python 	PyTorch
# 3.10.8 	1.13.1
# 3.9.12 	1.13.0
# 3.7.13 	1.12.1
# 3.7.13 	1.12.0
# 3.8.12 	1.11.0
# 3.7.11 	1.9.1
# 3.8.8 	1.8.0
# 3.8.3 	1.7.0
# FROM pytorch/pytorch:1.13.0-cuda11.6-cudnn8-runtime
FROM python:3.11

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
          apt-get install --no-install-recommends  -y git pkg-config gcc python3-dev libfreetype6-dev gfortran libgl1 libsm6 libxext6 

WORKDIR /workspace/

# Copy backend
COPY ./backend/requirements.txt /workspace/

# Install python package dependices
RUN pip install --no-cache-dir --upgrade pip && \
          pip install --no-cache-dir -r requirements.txt && \
          pip install --no-cache-dir gunicorn[eventlet]==21.2.0

RUN apt-get -y -o Dpkg::Options::="--force-confmiss" install --reinstall netbase && \
          apt clean && rm -rf /var/lib/apt/lists/*
