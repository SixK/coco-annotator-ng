from config import Config as AnnotatorConfig

import cv2
import numpy as np

# from sam2 import Sam2AutomaticMaskGenerator, Sam2ImagePredictor
import sam2
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor

import logging
logger = logging.getLogger('gunicorn.error')

MODEL_DIR = "/workspace/models"
SAM2_MODEL_PATH = AnnotatorConfig.SAM2_MODEL_FILE
SAM2_MODEL_CONFIG = AnnotatorConfig.SAM2_MODEL_CONFIG

class SAM2():
    def __init__(self):
        print('zz info:', SAM2_MODEL_CONFIG, SAM2_MODEL_PATH, AnnotatorConfig.DEVICE)
        # sam2 = sam2_model_registry[SAM2_MODEL_TYPE](checkpoint=SAM2_MODEL_PATH)
        self.sam2_model=build_sam2(SAM2_MODEL_CONFIG, ckpt_path=SAM2_MODEL_PATH, device=AnnotatorConfig.DEVICE)

        # mask_generator = SamAutomaticMaskGenerator(sam)
    def setPredictor(self, threshold=0.0, max_hole_area=0.0, max_sprinkle_area=0.0) :
        self.predictor = SAM2ImagePredictor(self.sam2_model, threshold, max_hole_area, max_sprinkle_area)

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

model = SAM2()
