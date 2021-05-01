#!/bin/sh
if [ -e .commit ]
  then
  DIR="$(dirname "$dir")"
  echo "$DIR"
  $DIR/node_modules/.bin/webpack --config $DIR/webpack.config.js
  rm .commit
  git add dist
  git commit --amend -C HEAD --no-verify
fi
exit
