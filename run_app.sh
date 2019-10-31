#!/bin/bash
source ~/Documents/coding/cs50w/projects/project_2/flack/flack_env/bin/activate
export FLASK_APP=application.py
export FLASK_DEBUG=0
flask run
