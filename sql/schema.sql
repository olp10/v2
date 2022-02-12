DROP TABLE IF EXISTS skraningar;
DROP TABLE IF EXISTS vidburdir;

CREATE TABLE IF NOT EXISTS vidburdir (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  slug VARCHAR(64) NOT NULL,
  description TEXT,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skraningar (
  id INT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  comment TEXT,
  event INT NOT NULL,
  created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(event) REFERENCES vidburdir(id)
);

