import eventlet
eventlet.monkey_patch(thread=False)

import sys

from config import Config

from flask import Flask
from flask_cors import CORS
# from werkzeug.contrib.fixers import ProxyFix
from werkzeug.middleware.proxy_fix import ProxyFix


from .api import blueprint as api

import threading
import requests
import logging
import time
import os

def create_app():

    # Dunno why observer.start() does not return 
    # We disable it and see later if this is fixable
    # if Config.FILE_WATCHER:
    #   run_watcher()

    flask = Flask(__name__,
                  static_url_path='',
                  static_folder='../dist')

    flask.config.from_object(Config)


    CORS(flask)

    flask.wsgi_app = ProxyFix(flask.wsgi_app)
    flask.register_blueprint(api)

    return flask


app = create_app()

logger = logging.getLogger('gunicorn.error')
app.logger.handlers = logger.handlers
app.logger.setLevel(logger.level)
    

if Config.INITIALIZE_FROM_FILE:
    create_from_json(Config.INITIALIZE_FROM_FILE)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    
    if app.debug:
        return requests.get('http://frontend:8080/{}'.format(path)).text

    return app.send_static_file('index.html')
