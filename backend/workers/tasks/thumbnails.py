from database import ImageModel
# from celery import shared_task
# get celery variable from our workers __init__.py
from workers import celery

'''
# this make service unstable
@shared_task(
    # name="expensive_api_call",
    name="thumbnail_generate_single_image",
    bind=True,
    acks_late=True,)
def thumbnail_generate_single_image(self, image_id):
'''

@celery.task
def thumbnail_generate_single_image(image_id):
    print("will generate thumbnails in worker")
    image = ImageModel.objects(id=image_id).first()
    image.thumbnail()
    image.flag_thumbnail(flag=False)


__all__ = ["thumbnail_generate_single_image"]
