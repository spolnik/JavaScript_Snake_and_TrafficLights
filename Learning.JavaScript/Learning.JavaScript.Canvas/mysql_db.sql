CREATE TABLE scores (
  ID int(11) NOT NULL AUTO_INCREMENT,
  Name varchar(16) COLLATE utf8_polish_ci NOT NULL,
  Score int(11) NOT NULL DEFAULT "0",
  PRIMARY KEY (ID)
) ENGINE=InnoDB