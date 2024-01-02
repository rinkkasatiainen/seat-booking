# Component tests

## Purpose

This is a set of tests that spin up the server and tests the server in isolation. 

## Things to consider (some might say 'improve')

For now, this requires the service to have a connection to RabbitMQ. Consider implementing a FakeRabbitMQ - 
or do 'TDD without mocks' to make this truly a component test.