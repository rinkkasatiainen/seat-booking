# Pin below 18. Postgres 18 moved PGDATA off /var/lib/postgresql/data, which is
# the path this compose file mounts. The bundled conf files are a full server
# dump and are not applied: copying them into PGDATA makes initdb refuse to run.
FROM postgres:16

COPY 01-init.sql /docker-entrypoint-initdb.d/