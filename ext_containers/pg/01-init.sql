CREATE USER apiUser WITH PASSWORD 'password!';
CREATE USER user1 WITH PASSWORD 'pass1';
CREATE DATABASE api_dev;
CREATE DATABASE bookings;
GRANT ALL PRIVILEGES ON DATABASE api_dev TO apiUser;
GRANT ALL PRIVILEGES ON DATABASE bookings TO user1;
-- ALTER USER postgres with PASSWORD password!;
-- ALTER USER user1 with PASSWORD password!;
-- ALTER USER apiUser with PASSWORD password!;
