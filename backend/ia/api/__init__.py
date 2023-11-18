from flask import Blueprint
import restx_monkey as monkey
monkey.patch_restx()
from flask_restx import Api

from .models import api as ns_models

from config import Config

# Create /api/ space
blueprint = Blueprint('api', __name__, url_prefix='/api')

api = Api(
    blueprint,
    title=Config.NAME,
    version=Config.VERSION,
)

# Remove default namespace
api.namespaces.pop(0)

# Setup API namespaces
api.add_namespace(ns_models)

