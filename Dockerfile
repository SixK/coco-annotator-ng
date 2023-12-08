FROM node:18 as build-stage

WORKDIR /workspace/
COPY ./client /workspace/client

RUN apt update && \
         apt install -y --no-install-recommends libpango1.0-dev libcairo2-dev libpangocairo-1.0-0  && \
         apt clean && rm -rf /var/lib/apt/lists/*

RUN npm install -g vite@latest
# RUN npm install -g SixK/paper.js#develop
# RUN npm install -g @vue/cli@5.0.8
# RUN npm install -g @vue/cli-service@5.0.8
# RUN npm install --location=global @vue/cli@4.5.19
# RUN npm install --location=global @vue/cli-service@4.5.19

COPY ./client/package* /workspace/

ENV NODE_PATH=/workspace/node_modules
RUN npm install && npm cache clean --force

# COPY ./client/patch_strict/paper-full.min.js  /workspace/node_modules/paper/dist/paper-full.min.js
# COPY ./client/patch_strict/paper-full.js  /workspace/node_modules/paper/dist/paper-full.js
# COPY ./client/patch_strict/paper-full.min.js  /workspace/client/node_modules/paper/dist/paper-full.min.js
# COPY ./client/patch_strict/paper-full.js  /workspace/client/node_modules/paper/dist/paper-full.js

WORKDIR /workspace/client
RUN npm --depth 20 update caniuse-lite browserslist
COPY ./client/patch_strict/paper-full.min.js  /workspace/node_modules/paper/dist/paper-full.min.js
COPY ./client/patch_strict/paper-full.js  /workspace/node_modules/paper/dist/paper-full.js
COPY ./client/patch_strict/paper-full.min.js  /workspace/client/node_modules/paper/dist/paper-full.min.js
COPY ./client/patch_strict/paper-full.js  /workspace/client/node_modules/paper/dist/paper-full.js
RUN npm run build && npm cache clean --force

FROM jsbroks/coco-annotator:python-env

WORKDIR /workspace/
COPY ./backend/ /workspace/
#COPY ./.git /workspace/.git
RUN python set_path.py

COPY --from=build-stage /workspace/client/dist /workspace/dist

RUN apt update && \
          apt install -y --no-install-recommends libsm6 libxext6 libxrender1 libgl1 libglib2.0-0 && \
          apt clean && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r ./requirements.txt

# RUN git clone https://github.com/SysCV/sam-hq.git && cd sam-hq && pip install -e .
# RUN pip install timm

# RUN git clone --depth=1 https://github.com/iamlab-cmu/DEXTR-KerasTensorflow.git /tmp/dextr2 && \
#            cd /tmp/dextr2 && \
#            sed -i "s/from networks/from dextr/g" networks/classifiers.py && \
#            sed -i "s/from keras.backend import tf/import tensorflow/g" networks/classifiers.py && \
#            sed -i "s/from keras.layers.merge import Concatenate, Add/from keras.layers import concatenate, add/g" networks/classifiers.py && \
#             cp networks/classifiers.py /opt/conda/lib/python3.9/site-packages/dextr-0.0.1-py3.9.egg/dextr/ && \
#             rm -Rf /tmp/dextr2

ENV FLASK_ENV=production
ENV DEBUG=false

EXPOSE 5000
CMD gunicorn -c webserver/gunicorn_config.py webserver:app --no-sendfile --timeout 180
