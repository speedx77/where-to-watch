CREATE TABLE users (
    userId SERIAL PRIMARY KEY,
    displayname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    pfpfilename TEXT,
    pfpfilepath TEXT,
    pfpmimetype TEXT
)