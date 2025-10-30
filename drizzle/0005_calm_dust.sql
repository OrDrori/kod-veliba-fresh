ALTER TABLE `crm_clients` ADD `id_notes` text;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `hourly_rate_separate` int;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `currency` varchar(10) DEFAULT 'ILS';--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `start_date` timestamp;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `chat_link` varchar(500);--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `flag` varchar(50);--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `projects_link` text;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `contract_months` int;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `billing_link` text;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `automate` varchar(100);--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `files` text;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `last_update_date` timestamp;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `last_update_by` varchar(255);--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `change_log` text;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `previous_status` varchar(100);--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `previous_status_date` timestamp;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `billing_notes` text;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `tasks_link` text;--> statement-breakpoint
ALTER TABLE `crm_clients` ADD `projects_link2` text;