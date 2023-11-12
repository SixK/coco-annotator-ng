FROM jsbroks/coco-annotator:python-env

WORKDIR /workspace/

# Install python package dependices
COPY ./backend/ /workspace/
COPY ./.git /workspace/.git

RUN apt-get update && apt-get install -y libsm6 libxrender1 libfontconfig1 libglib2.0-0
# RUN pip install importlib-metadata==4.4.0
# RUN pip install imantics==0.1.12

RUN python set_path.py

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

RUN python -m pip install detectron2 -f \
  https://dl.fbaipublicfiles.com/detectron2/wheels/cu113/torch1.10/index.html

ENV FLASK_ENV=development
ENV DEBUG=true

EXPOSE 5000
CMD gunicorn -c webserver/gunicorn_config.py webserver:app --no-sendfile

