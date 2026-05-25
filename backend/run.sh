#!/bin/bash

source .env.api

docker stop maplio-server
docker rm maplio-server
docker build --no-cache -t maplio-api .

docker run -d \
  --name maplio-server \
  -p 3000:3000 \
  --restart always \
  -e API_KEY=$X_API_KEY \
  maplio-api
