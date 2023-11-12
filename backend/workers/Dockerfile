FROM jsbroks/coco-annotator:python-env

WORKDIR /workspace/

RUN apt-get update && apt-get install -y libsm6 libxrender1 libfontconfig1 libgl1


# Install python package dependices
COPY ./backend/ /workspace/

EXPOSE 5555
CMD celery -A workers worker -l info
