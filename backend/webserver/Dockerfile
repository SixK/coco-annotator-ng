FROM jsbroks/coco-annotator:python-env

WORKDIR /workspace/

# Install python package dependices
COPY ./backend/ /workspace/
COPY ./.git /workspace/.git

RUN apt-get update && apt-get install --no-install-recommends -y libsm6 libxrender1 libfontconfig1 libglib2.0-0 && \
          apt clean && rm -rf /var/lib/apt/lists/*

RUN python set_path.py

ENV FLASK_ENV=development
ENV DEBUG=true

EXPOSE 5000
CMD gunicorn -c webserver/gunicorn_config.py webserver:app --no-sendfile

