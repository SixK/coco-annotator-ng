FROM node:22

RUN apt update && apt install -y libpango1.0-dev libcairo2-dev libpangocairo-1.0-0 && \
          apt clean && rm -rf /var/lib/apt/lists/*

RUN npm install -g --quiet \
    vite@latest 

WORKDIR /workspace/

COPY ./client/package.json /workspace/package.json
RUN npm install --legacy-peer-deps
ENV NODE_PATH=/workspace/node_modules

WORKDIR /workspace/client/

EXPOSE 8080
CMD npm run dev -- --host --mode dev
