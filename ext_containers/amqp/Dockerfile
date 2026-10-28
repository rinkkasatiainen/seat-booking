FROM rabbitmq:4.4-management

COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf
COPY definitions.json /etc/rabbitmq/definitions.json
COPY start.sh /usr/local/bin/start-with-definitions.sh
RUN chmod +x /usr/local/bin/start-with-definitions.sh
ENTRYPOINT ["/usr/local/bin/start-with-definitions.sh"]
