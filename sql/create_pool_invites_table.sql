CREATE TABLE IF NOT EXISTS `pool_invites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pool_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `consumed_at` datetime DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `pool_invites_pool_id` (`pool_id`),
  KEY `pool_invites_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
