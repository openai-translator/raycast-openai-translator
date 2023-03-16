#! /bin/sh
ASSETS_PATH=$HOME/.config/raycast/extensions/openai-translator/assets
mkdir -p $ASSETS_PATH

alias python='/usr/bin/env python3'
alias pip=$ASSETS_PATH/venv/bin/pip

python -m venv --clear $ASSETS_PATH/venv
pip install pyobjc-framework-vision
pip install opencv-python
