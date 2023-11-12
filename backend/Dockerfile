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
# FROM pytorch/pytorch:1.11.0-cuda11.3-cudnn8-runtime
FROM pytorch/pytorch:1.13.0-cuda11.6-cudnn8-runtime


# RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys A4B469963BF863CC
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y git pkg-config gcc python3-dev libfreetype6-dev gfortran libgl1 libsm6 libxext6

WORKDIR /workspace/

# Copy backend
COPY ./backend/requirements.txt /workspace/

# Install python package dependices
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install gunicorn[eventlet]==21.2.0

# Install maskrcnn
RUN git clone --single-branch --depth 1 https://github.com/matterport/Mask_RCNN.git /tmp/maskrcnn
#RUN cd /tmp/maskrcnn && pip install -r requirements.txt
RUN cd /tmp/maskrcnn && python3 setup.py install

# Install DEXTR
RUN git clone --single --depth 1 https://github.com/jsbroks/dextr-keras.git /tmp/dextr && \
    cd /tmp/dextr && \
    sed -i "s/np.int/int/g" dextr/model.py && \
    python setup.py install && \
    rm -Rf /tmp/dextr

# Install detectron
# RUN echo "INSTALLING DETECTRON."
# FROM pytorch/pytorch:1.9.0-cuda10.2-cudnn7-runtime
# RUN apt-get update && apt-get install -y gcc libglib2.0-0
# RUN python3 -m pip install detectron2 -f \
#    https://dl.fbaipublicfiles.com/detectron2/wheels/cu102/torch1.9/index.html

RUN apt-get -y -o Dpkg::Options::="--force-confmiss" install --reinstall netbase
