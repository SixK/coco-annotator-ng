# FROM jsbroks/coco-annotator:python-env
FROM pytorch/pytorch:1.13.0-cuda11.6-cudnn8-runtime


WORKDIR /workspace/

# Install python package dependices
COPY ./backend/ /workspace/
# COPY ./.git /workspace/.git
# COPY ./backend/requirements.txt /workspace/


RUN apt-get update && apt-get install -y libsm6 libxrender1 libfontconfig1 libglib2.0-0 git build-essential libgl1
# RUN pip install importlib-metadata==4.4.0
# RUN pip install imantics==0.1.12

# Install python package dependices
RUN pip install --upgrade pip && \
    pip install -r requirements_ia.txt && \
    pip install gunicorn[eventlet]==21.2.0


RUN python set_path.py

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


RUN git clone --depth=1 https://github.com/iamlab-cmu/DEXTR-KerasTensorflow.git /tmp/dextr2 && \
           cd /tmp/dextr2 && \
           sed -i "s/from networks/from dextr/g" networks/classifiers.py && \
           sed -i "s/from keras.backend import tf/import tensorflow/g" networks/classifiers.py && \
           sed -i "s/from keras.layers.merge import Concatenate, Add/from keras.layers import concatenate, add/g" networks/classifiers.py && \
            cp networks/classifiers.py /opt/conda/lib/python3.9/site-packages/dextr-0.0.1-py3.9.egg/dextr/ && \            
            rm -Rf /tmp/dextr2

# RUN pip install segment-anything
RUN git clone https://github.com/SysCV/sam-hq.git && cd sam-hq && pip install -e .
RUN  pip install timm

# RUN python -m pip install detectron2 -f \
#  https://dl.fbaipublicfiles.com/detectron2/wheels/cu113/torch1.10/index.html

RUN python -m pip install 'git+https://github.com/facebookresearch/detectron2.git'

RUN git clone --depth=1 https://github.com/facebookresearch/MaskFormer ./MaskFormer

ENV FLASK_ENV=development
ENV DEBUG=true

EXPOSE 6000
CMD gunicorn -c ia/gunicorn_config.py ia:app --no-sendfile

