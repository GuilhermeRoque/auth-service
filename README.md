# Auth-Service
Serves users CRUD operations as also generates JWT for authentication.

API documentation at root path '/'

Runs the app locally (its needed to set the env variables as also install mongodb):

    npm start

Runs the app in docker containers exposing local port 3000 (docker-compose v3 is used):
   
    docker-compose run --build 