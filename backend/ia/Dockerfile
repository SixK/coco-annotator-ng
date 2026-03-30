# FROM pytorch/pytorch:1.13.1-cuda11.6-cudnn8-runtime
# if you don't need Zim, prefer runtime image that is lighter
# else devel is necessary
# FROM pytorch/pytorch:2.3.1-cuda11.8-cudnn8-runtime
# FROM pytorch/pytorch:2.9.1-cuda12.6-cudnn9-devel # dontwork
FROM pytorch/pytorch:2.11.0-cuda12.6-cudnn9-devel 
# FROM pytorch/pytorch:2.4.1-cuda12.4-cudnn9-devel 

ENV PIP_BREAK_SYSTEM_PACKAGES=1

# For SAM2 build
# Add your GPU Architecture if missing
# ENV TORCH_CUDA_ARCH_LIST="3.7;3.5+PTX;5.3;5.0;5.2+PTX;6.0;6.1;7.0+PTX;7.2;7.5+PTX"
# ENV TORCH_CUDA_ARCH_LIST="6.0;6.1;7.0;7.2;7.5;8.0;8.6;8.7;8.9;9.0;10.0;10.3;11.0;12.0;12.1;12.1+PTX"
ENV TORCH_CUDA_ARCH_LIST="6.0;6.1;7.0;7.2;7.5;8.0;8.6;8.7;8.9;9.0"

ENV MASKRCNN="0"
ENV DEXTR="1"
ENV SAM="1"
ENV SAM2="1"
ENV ZIM="1"
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
    pip install --no-cache-dir gunicorn[eventlet]==23.0.0


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
       pip --no-cache-dir  install . && \
       rm -Rf /tmp/dextr; \
    fi

# RUN pip install sam2  // segment anything 2
RUN if [ "$SAM2" = "1" ]; then \
             git clone --single --depth 1 https://github.com/facebookresearch/sam2.git /tmp/sam2 && \
             cd /tmp/sam2 && \
             # python setup.py egg_info && \
             # python setup.py build_ext --inplace && \
             python -m build --no-isolation && \
             pip --no-cache-dir  install `sed '/^\[dev\]/,/^\[/d' SAM_2.egg-info/requires.txt|sed '/^\[interactive-demo\]/,/^\[/d'|sed '/^\[notebooks\]/,/^\[/d'` && \
             pip --no-cache-dir install --no-deps . && \
             rm -Rf /tmp/sam2; \
    fi

# RUN pip install segment-anything
RUN if [ "$SAM" = "1" ]; then \
             git clone https://github.com/SysCV/sam-hq.git /tmp/sam-hq \
             && cd /tmp/sam-hq \
             && pip --no-cache-dir install timm \
             && pip --no-cache-dir install --no-deps .[all]  \
             && rm -Rf /tmp/sam-hq; \
    fi

# RUN pip install zim_anything
RUN if [ "$ZIM" = "1" ]; then \
             apt update && apt install libcudnn9-cuda-12 && \
             pip --no-cache-dir install zim_anything easydict; \
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

