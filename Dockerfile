FROM node:20 as build-stage

WORKDIR /workspace/
COPY ./client /workspace/client

RUN apt update && \
         apt install -y --no-install-recommends libpango1.0-dev libcairo2-dev libpangocairo-1.0-0  && \
         apt clean && rm -rf /var/lib/apt/lists/*

RUN npm install -g vite@latest

COPY ./client/package* /workspace/

ENV NODE_PATH=/workspace/node_modules
RUN npm install && npm cache clean --force

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

ENV FLASK_ENV=production
ENV DEBUG=false

EXPOSE 5000
CMD gunicorn -c webserver/gunicorn_config.py webserver:app --no-sendfile --timeout 180
