# FROM pytorch/pytorch:1.13.1-cuda11.6-cudnn8-runtime
FROM pytorch/pytorch:2.3.1-cuda11.8-cudnn8-runtime

ENV MASKRCNN="0"
ENV DEXTR="1"
ENV SAM="1"
ENV DETECTRON2="0"
ENV MASKFORMER="0"

WORKDIR /workspace/

# Install python package dependices
COPY ./backend/ /workspace/
# COPY ./.git /workspace/.git
# COPY ./backend/requirements.txt /workspace/


RUN apt-get update && apt-get install --no-install-recommends  -y libsm6 libxrender1 libfontconfig1 libglib2.0-0 git build-essential libgl1 && \
          apt clean && rm -rf /var/lib/apt/lists/*

# Install python package dependices
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements_ia.txt && \
    pip install --no-cache-dir gunicorn[eventlet]==21.2.0


RUN python set_path.py

# Install maskrcnn
RUN if [ "$MASKRCNN" = "1" ]; then \
        git clone --single-branch --depth 1 https://github.com/matterport/Mask_RCNN.git /tmp/maskrcnn && \
        cd /tmp/maskrcnn && python3 setup.py install; \
    else \
        echo "MaskRcnn is disabled"; \
    fi

# Install DEXTR
RUN if [ "$DEXTR" = "1" ]; then \
       git clone --single --depth 1 https://github.com/SixK/DEXTR-PyTorch-ccannotng.git /tmp/dextr && \
       cd /tmp/dextr && \
       pip install . && \
       rm -Rf /tmp/dextr; \
    fi



# RUN pip install segment-anything
RUN if [ "$SAM" = "1" ]; then \
             git clone https://github.com/SysCV/sam-hq.git && cd sam-hq && pip --no-cache-dir install -e . && \
             pip --no-cache-dir install timm; \
    fi

# RUN python -m pip install detectron2 -f \
#  https://dl.fbaipublicfiles.com/detectron2/wheels/cu113/torch1.10/index.html

RUN if [ "$DETECTRON2" = "1" ]; then \
            python -m pip --no-cache-dir install 'git+https://github.com/facebookresearch/detectron2.git'; \
    fi

RUN if [ "$MASKFORMER" = "1" ]; then \
            git clone --depth=1 https://github.com/facebookresearch/MaskFormer ./MaskFormer; \
          fi
            
ENV FLASK_ENV=development
ENV DEBUG=true

EXPOSE 6000
CMD gunicorn -c ia/gunicorn_config.py ia:app --no-sendfile

