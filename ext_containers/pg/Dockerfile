FROM postgres:latest

ADD pg_hba.conf /var/lib/postgresql/data/

ADD postgresql.conf /var/lib/postgresql/data/

COPY 01-init.sql /docker-entrypoint-initdb.d/