#!/bin/bash

if [ -z "$RAYCAST_EXTENSION_DEST" ]; then
    echo "Error: Environment variable 'RAYCAST_EXTENSION_DEST' is not set."
    exit 1
fi

rsync -a --exclude='.git' --exclude='.tools' --exclude-from=.gitignore ./ $DEST
mv $DEST/README.md $DEST/README-zh.md
mv $DEST/README-en.md $DEST/README.md
