CREATE DATABASE `NodeJSLoginSystem` /*!40100 DEFAULT CHARACTER SET latin1 */;

CREATE TABLE `users` (
  `id` smallint(3) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(64) NOT NULL,
  `password` varchar(256) NOT NULL,
  `name` varchar(32) NOT NULL,
  `role` enum(''admin'',''member'','''','''') NOT NULL DEFAULT ''member'',
  `modified` datetime NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
