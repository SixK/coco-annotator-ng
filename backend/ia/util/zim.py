from config import Config as AnnotatorConfig

import cv2
import numpy as np
import torch

from zim_anything import ZimAutomaticMaskGenerator, zim_model_registry, ZimPredictor

import logging
logger = logging.getLogger('gunicorn.error')

MODEL_DIR = "/workspace/models"
ZIM_MODEL_PATH = AnnotatorConfig.ZIM_MODEL_FILE
ZIM_MODEL_TYPE = AnnotatorConfig.ZIM_MODEL_TYPE

class ZIM():
    def __init__(self):
        device=AnnotatorConfig.DEVICE
        logger.info(f'zz info: {ZIM_MODEL_TYPE}, {ZIM_MODEL_PATH}, {device}')
        zim_model = zim_model_registry[ZIM_MODEL_TYPE](checkpoint=ZIM_MODEL_PATH)
        
        if torch.cuda.is_available():
            zim_model.cuda()
        # mask_generator = SamAutomaticMaskGenerator(sam)
        self.predictor = ZimPredictor(zim_model)

    def setImage(self, image) :
        self.predictor.set_image(np.array(image, copy=True))

    def calcMasks(self, input_points, input_label) :
        self.masks, self.scores, self.logits = self.predictor.predict(
                    point_coords=input_points,
                    point_labels=input_label,
                    multimask_output=True,
        )
        # self.masks = np.squeeze(self.masks, axis=0)
        self.masks = np.uint8(self.masks * 255)

    def getSegmentation(self) :
        annotations=[]
        id=0
        for mask in self.masks:
            contours, _ = cv2.findContours(mask.astype('uint8'), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            # Convert the contour to the format required for segmentation in COCO format
            segmentation = []
            for contour in contours:
                contour = contour.flatten().tolist()
                contour_pairs = [(contour[i], contour[i+1]) for i in range(0, len(contour), 2)]
                segmentation.append([int(coord) for pair in contour_pairs for coord in pair])
        return segmentation

model = ZIM()
