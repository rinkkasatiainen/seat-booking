# An app for learning purposes.

This is an app for learning purposes. 


# Running on docker

 - [ ] run `docker compose up`
 - [ ] does build the image in 'production environment' - does not hot reload
 - [ ] check rabbitmq dependencies

## Setting up rabbitMQ.

This is a service that requires 2 exchanges, and 2 queues. Running this example project requires these rabbitmq configs to be done

### RabbitMQ exchanges:

 - [ ] health-check   - for requesting health-check from respective apps - use routing key to define container
   - [ ] 'responses' for returning responses. 
   - [ ] 'api' for api
   - [ ] 'booking' for the backend service

### RabbitMQ queues

Make rabbitMQ queues for 

 - [ ] health-check-responses  - health check responses on this queue
 - [ ] health-check-api   - querying health check for api
 - [ ] health-check-booking   - querying health check for bookings


## Running with hot reaload

to run with hot reload, use the dev version of the docker file `docker compose -f docker-compose-dev.yaml up --detach`

you might need to rebuild the dev image - `docker compose -f docker-compose-dev.yaml build --no-cache`
- [ ] run `docker compose -f docker-compose-dev.yaml up -d` to run locally.
- [ ] to do **hot reload** - have a `yarn build:w` running for constant `tsc` reload -> docker uses the `/dist` folder for code

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