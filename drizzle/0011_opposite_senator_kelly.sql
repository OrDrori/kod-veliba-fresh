ALTER TABLE `crm_clients` ADD `monday_id` varchar(50);--> statement-breakpoint
ALTER TABLE `crm_clients` ADD CONSTRAINT `crm_clients_monday_id_unique` UNIQUE(`monday_id`);