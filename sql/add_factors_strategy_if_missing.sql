-- Run only if pools.factors_strategy is missing (column exists on most installs).
ALTER TABLE pools ADD COLUMN factors_strategy INT(5) NOT NULL DEFAULT 0;
