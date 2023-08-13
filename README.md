# An app for learning purposes.

This is an app for learning purposes. 


# Running on docker

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