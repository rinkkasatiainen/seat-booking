
# API doc

This is the api that serves for the "internet". This has a few public endpoints to call.

 - /health/check with GET and POST
   - GET: just returns {status: ok} as response
   - POST: checks connections to websocket and sends message to rabbitmq.

## testing

How to test that this works:

### Manual testing (exploratory)

