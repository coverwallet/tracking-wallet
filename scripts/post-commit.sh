#!/bin/sh
if [ -e .commit ]
  then
  rm .commit
  git add dist
  git commit --amend -C HEAD --no-verify
fi
exit
