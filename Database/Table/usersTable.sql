CREATE TABLE users(
    id VARCHAR(200) PRIMARY KEY,
    name VARCHAR(200),
    email VARCHAR(200) UNIQUE,
    password VARCHAR(200)
)
