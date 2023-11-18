FROM jsbroks/coco-annotator:python-env

WORKDIR /workspace/

RUN apt-get update && apt-get install --no-install-recommends -y libsm6 libxrender1 libfontconfig1 libgl1 && \
          apt clean && rm -rf /var/lib/apt/lists/*


# Install python package dependices
COPY ./backend/ /workspace/

EXPOSE 5555
CMD celery -A workers worker -l info
