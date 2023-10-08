# An app for learning purposes.

This is an app for learning purposes. 


# Running on docker

 - [ ] run `docker compose up`
 - [x] Does also do **hot reload** on Docker - if you have a watch on `tsc` so that `./dist` is built constantly 
 - [x] to build newest version of the NodeJS apps, run `docker compose build` to build new images

# Running on Localhost

To setup api to run on localhost:

 - [ ] define variables.env - see example 'variables.env.example'
 - [ ] configure /etc/host to have PG_HOST to point to 127.0.0.1
   ```
   $ cat /etc/host
   [...]
   127.0.0.1 postgres
   ```
 - [ ] run `yarn start:dev`