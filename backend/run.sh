#!/bin/bash

source .env.api

docker stop maplio-server
docker rm maplio-server
docker build --no-cache --network=host -t maplio-api .

docker run -d \
  --name maplio-server \
  --network=host \
  --restart always \
  -e API_KEY=$X_API_KEY \
  maplio-api
