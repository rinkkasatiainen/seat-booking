
# API doc

This is the api that serves for the "internet". This has a few public endpoints to call.

 - /health/check with GET and POST
   - GET: just returns {status: ok} as response
   - POST: checks connections to websocket and rabbitmq. 
     - also checks the health check of the 'bookings' 
     - responds health check to websocket.


## testing

How to test that this works:

Read also `readme.md` files in each `test` folder

### Manual testing (exploratory)

