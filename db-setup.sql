CREATE TABLE users (
    userId SERIAL PRIMARY KEY,
    displayname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    pfpfilename TEXT,
    pfpfilepath TEXT,
    pfpmimetype TEXT
)
CREATE TABLE watchlist(
	userId INTEGER REFERENCES users(userId),
	contentname VARCHAR(255),
	contentid INTEGER,
	type TEXT,
	PRIMARY KEY(contentid, userId)
)

CREATE TABLE likes(
	userId INTEGER REFERENCES users(userId),
	contentname VARCHAR(255),
	contentid INTEGER,
	type TEXT,
	liked TEXT,
	PRIMARY KEY(contentid, userId)
)

INSERT INTO watchlist (userId, contentname, contentid, type) VALUES (1, 'Neon Genesis Evangelion', 890, 'Show')


INSERT INTO watchlist (userId, contentname, contentid, type) VALUES (1, 'Batman v Superman: Dawn of Justice', 209112, 'Movie')


