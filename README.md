# COCO Annotator next generation

This version of COCO Annotator is a strait port from JsBroks COCO Annotator official version to vue3.2+

Before going further, if you already use JsBroks COCO Annotator and want to switch to this version, you will have to change  user password encryption methode in mongo database (Werkzeug 3 break change).  
For this, you will have to install an old and compatible Werkzeug python library and use the change_password_hash_type.py python script:

	pip install werkzeug==2.0.3
	pip install pymongo
	python change_password_hash_type.py

By default change_password_hash_type.py only change password hash type for the admin user.  
Edit this file and run it again to migrate others users accounts.  
You will have to know all users password to migrate all passwords.  
You can then use any recent werkzeug version.  

## Features  
**Now we can talk about what this version will provide:**  
- vue 3.2+ style code  
- upgraded python libraries versions  
- upgraded javascript packages  
- use Bootstrap5  
- use pinia instead of vuex  
- use vite instead of vue-cli  
- added segment anything tool (SAM-HQ) to help to segment objects (1 click to segment an object)  
- activate GPU (seem's this was not really activated even when using docker-compose.gpu.yml)  
- fixed some bugs and javascript errors  
- can use detectron2 models to help segment objects  
- moved IA to a dedicated container to make coco-annotator lighter when not using them
- maybe more ...  

**what features you will loose or bugs are introduced:**  
- watchdog to detect new images has been disabled (this was freezing the application. This feature may be reactivated later)  
- pinch zoom has been removed (need to find a library to replace and use a tablet to test it)  
- objects id are not the new ones when switching to next or previous images (need to click on an object to get ids updated)  
- exported json annotations files seem's ok but are actually not fully tested  
- hope to not have more bugs and features removed...  

## Build docker images  
There is actually no pre-built docker images.   
You will have to build docker images by yourself.   
Note that docker images are actually using around 15Gb disk space.   Make sure to have at least 30Gb disk space to build all images.  
You can probably have images around 2/3 Gb disk space if removing IA features and tweaking Dockerfiles. (but it may not be that eazy to do)

### Building docker images:  
Production images with no IA support:

	docker-compose -f ./docker-compose.build.yml build
	docker-compose -f ./docker-compose.yml up

Dev images with IA support:

	docker-compose -f ./docker-compose.dev.yml build
	docker-compose -f ./docker-compose.dev.yml up

Production images with IA support:

	bash ./build_gpu.sh  
	docker-compose -f /docker-compose.gpu.yml up  


---

<p align="center"><img src="https://i.imgur.com/AA7IdbQ.png"></p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="https://github.com/jsbroks/coco-annotator/wiki">Wiki</a> •
  <a href="https://github.com/jsbroks/coco-annotator/wiki/Getting-Started">Getting Started</a> •
  <a href="https://github.com/jsbroks/coco-annotator/issues">Issues</a> •
  <a href="#license">License</a>
</p>

---

<p align="center">
  <a href="/jsbroks/coco-annotator/stargazers">
    <img src="https://img.shields.io/github/stars/jsbroks/coco-annotator.svg">
  </a>
  <a href="/jsbroks/coco-annotator/issues">
    <img src="https://img.shields.io/github/issues/jsbroks/coco-annotator.svg">
  </a>
  <a href="https://tldrlegal.com/license/mit-license">
    <img src="https://img.shields.io/github/license/mashape/apistatus.svg">
  </a>
  <a href="https://lgtm.com/projects/g/jsbroks/coco-annotator/context:javascript">
    <img src="https://img.shields.io/lgtm/grade/javascript/g/jsbroks/coco-annotator.svg?label=code%20quality">
  </a>
  <a href="https://annotator.justinbrooks.ca/">
    <img src="https://img.shields.io/badge/demo-online-green.svg">
  </a>
  <a href="https://travis-ci.org/jsbroks/coco-annotator">
    <img src="https://travis-ci.org/jsbroks/coco-annotator.svg?branch=master">
  </a>
  <a href="https://hub.docker.com/r/jsbroks/coco-annotator">
    <img src="https://img.shields.io/docker/pulls/jsbroks/coco-annotator.svg">
  </a>
</p>

COCO Annotator is a web-based image annotation tool designed for versatility and efficiently label images to create training data for image localization and object detection. It provides many distinct features including the ability to label an image segment (or part of a segment), track object instances, labeling objects with disconnected visible parts, efficiently storing and export annotations in the well-known [COCO format](http://cocodataset.org/#format-data). The annotation process is delivered through an intuitive and customizable interface and provides many tools for creating accurate datasets.


<br />

<p align="center">Join our growing <a href="https://discord.gg/4zP5Qkj">discord community</a> of ML practitioner</p>
<p align="center">
  <a href="https://discord.gg/4zP5Qkj">
    <img src="https://discord.com/assets/e4923594e694a21542a489471ecffa50.svg" width="120">
  </a>
</p>

<br />

<p align="center"><a href="http://www.youtube.com/watch?feature=player_embedded&v=OMJRcjnMMok" target="_blank"><img src="https://img.youtube.com/vi/OMJRcjnMMok/maxresdefault.jpg" 
alt="Image annotations using COCO Annotator" width="600" /></a></p>
<p align="center"><i>Checkout the video for a basic guide on installing and using COCO Annotator.</i></p>

<br />

<p align="center"><img width="600" src="https://i.imgur.com/m4RmjCp.gif"></p>
<p align="center"><i>Note: This video is from v0.1.0 and many new features have been added.</i></p>


<br>

<p align="center">If you enjoy my work please consider supporting me</p>
<p align="center">
  <a href="https://www.patreon.com/jsbroks">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="120">
  </a>
</p>
<br>

# Features

Several annotation tools are currently available, with most applications as a desktop installation. Once installed, users can manually define regions in an image and creating a textual description. Generally, objects can be marked by a bounding box, either directly, through a masking tool, or by marking points to define the containing area. _COCO Annotator_ allows users to annotate images using free-form curves or polygons and provides many additional features were other annotations tool fall short.

- Directly export to COCO format
- Segmentation of objects
- Ability to add key points
- Useful API endpoints to analyze data
- Import datasets already annotated in COCO format
- Annotate disconnect objects as a single instance
- Labeling image segments with any number of labels simultaneously
- Allow custom metadata for each instance or object
- Advanced selection tools such as, [DEXTR](https://github.com/jsbroks/dextr-keras), [MaskRCNN](https://github.com/matterport/Mask_RCNN) and Magic Wand
- Annotate images with semi-trained models
- Generate datasets using google images
- User authentication system
- Auto Annotate using MaskRCNN, MaskFormer (thank's to [rune-l](https://github.com/rune-l/coco-annotator) work)
 or Detectron2 models
- Auto Annotate using SAM (Facebook Segment Anything)

For examples and more information check out the [wiki](https://github.com/jsbroks/coco-annotator/wiki).

# Vue3 porting attempt

- [x] Make source code work with Vue3 in Vue2 compatibility mode
- [x] Modify to Vuex4 style files using Vuex store
- [x] convert mixins to composable API and components 
- [ ] Fix eslint errors 
- [x] Remove JQuery library
- [ ] find a library to replace vue-touch for pinching
- [x] Make source code work without Vue2 compatibility mode
- [ ] Understand Keypoints and make them fully work
- [x] Restore all shortcuts
- [x] Fix undefined Category error when clicking on some annotations
- [x] Fix recursive warnings and make prod version work
- [ ] understand why categories and annotations are not updated in some objects till we click on a category or an annotation after going to next or previous image. annotations id are not the right ones in this case.

At this state, source code tested only using docker-compose.dev.yml.
Lot of eslint errors appears, but application is functionnal

# Using SAM (Segment Anything) - Deprecated to SAM-HQ
This coco annotator version is a vue3 port from original jsbrok coco-annotator based on vue2.
This version still has some bugs mainly introduced by vue3 new behaviour or vue3 conversion, so use it at your own risks.
Most of libraries has been updated to more recent versions.

To use SAM you will need a Cuda capable graphic card (or modify sources to use CPU. Untested). 
First rebuild a new base image using the following command from build_gpu.sh:  
>    docker build -f ./backend/Dockerfile . -t jsbroks/coco-annotator:python-env

Download SAM model :
>    cd models;bash sam_model.sh

Then rebuild/build coco-annotator images using docker-compose.dev.yml or docker-compose.gpu.yml files :  
>    docker-compose -f ./docker-compose.dev.yml build

You can then run coco-annotator:  
>    docker-compose -f ./docker-compose.dev.yml up

Now select or create a new annotation.  
Select the new SAM button in the left pannel (under DEXTR button).  
Click on the object you want to create mask.  
A new mask should be created.  

# Using SAM-HQ (Segment Anything in High Quality)
SAM-HQ is a drop in place of SAM with more precision:
https://github.com/SysCV/sam-hq

Simply download SAM-HQ model:
>    cd models;bash sam_hq_model.sh

Rebuild docker images :
>    docker-compose -f ./docker-compose.dev.yml build

You can then run coco-annotator:
>    docker-compose -f ./docker-compose.dev.yml up

SAM-HQ is now default, but you still can use original SAM modifying backend/webserver/Dockerfile  
to comment line with sam-hq and uncomment line before installing segment-anything.
`
# RUN pip install segment-anything
RUN git clone https://github.com/SysCV/sam-hq.git && cd sam-hq && pip install -e .
`

And modify docker-compose.dev.yml:

`
      - SAM_MODEL_FILE=/models/sam_vit_b_01ec64.pth
      # - SAM_MODEL_FILE=/models/sam_hq_vit_b.pth
`

Download SAM model (if not already done) rebuild docker images and restart coco-annotator using docker-compose. 


# Demo

| Login Information      |
| ---------------------- |
| **Username:** admin    |
| **Password:** password |

https://annotator.justinbrooks.ca/

# Backers

If you enjoy the development of coco-annotator or are looking for an enterprise annotation tool, consider checking out DataTorch.

<p align="center">
  <a href="https://datatorch.io">
    <img src="https://i.imgur.com/sOQ1s5F.png" width="250" />
  </a>
  <p align="center">
    https://datatorch.io · <a href="mailto:support@datatorch.io">support@datatorch.io</a> · <i>Next generation of coco-annotator</i>
   </p>
</p>

# Built With

Thanks to all these wonderful libaries/frameworks:

### Backend

- [Flask](http://flask.pocoo.org/) - Python web microframework
- [MongoDB](https://www.mongodb.com/) - Cross-platform document-oriented database
- [MongoEngine](http://mongoengine.org/) - Python object data mapper for MongoDB

### Frontend

- [Vue](https://vuejs.org/) - JavaScript framework for building user interfaces
- [Axios](https://github.com/axios/axios) - Promise based HTTP client
- [PaperJS](http://paperjs.org/) - HTML canvas vector graphics library
- [Bootstrap](https://getbootstrap.com/) - Frontend component library

# License

[MIT](https://tldrlegal.com/license/mit-license)

# Citation

```
  @MISC{cocoannotator,
    author = {Justin Brooks},
    title = {{COCO Annotator}},
    howpublished = "\url{https://github.com/jsbroks/coco-annotator/}",
    year = {2019},
  }
```
