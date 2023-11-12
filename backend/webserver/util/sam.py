from config import Config as AnnotatorConfig

import cv2
import numpy as np

from segment_anything import SamAutomaticMaskGenerator, sam_model_registry, SamPredictor

import logging
logger = logging.getLogger('gunicorn.error')

MODEL_DIR = "/workspace/models"
SAM_MODEL_PATH = AnnotatorConfig.SAM_MODEL_FILE
SAM_MODEL_TYPE = AnnotatorConfig.SAM_MODEL_TYPE

class SAM():
    def __init__(self):
        # sam = sam_model_registry["vit_b"](checkpoint="model/sam_vit_b_01ec64.pth")
        print('zz info:', SAM_MODEL_TYPE, SAM_MODEL_PATH)
        sam = sam_model_registry[SAM_MODEL_TYPE](checkpoint=SAM_MODEL_PATH)
        device=AnnotatorConfig.DEVICE
        sam.to(device=device)
        # mask_generator = SamAutomaticMaskGenerator(sam)
        self.predictor = SamPredictor(sam)

    def setImage(self, image) :
        self.predictor.set_image(image)

    def calcMasks(self, input_points, input_label) :
        self.masks, self.scores, self.logits = self.predictor.predict(
                    point_coords=input_points,
                    point_labels=input_label,
                    multimask_output=True,
        )
    
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

model = SAM()
