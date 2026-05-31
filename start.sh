#!/bin/bash
cd /opt/render/project/src && gunicorn backend.app:app --bind 0.0.0.0:$PORT --log-level debug
