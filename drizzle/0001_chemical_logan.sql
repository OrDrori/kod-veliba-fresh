CREATE TABLE `billing_charges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`task_id` int,
	`charge_type` enum('retainer','hourly','bank','project','one_time') NOT NULL,
	`amount` int NOT NULL,
	`hours` int,
	`description` text,
	`status` enum('pending','invoiced','paid','cancelled') NOT NULL DEFAULT 'pending',
	`invoice_number` varchar(100),
	`invoice_date` timestamp,
	`due_date` timestamp,
	`paid_date` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billing_charges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`task_name` varchar(500) NOT NULL,
	`task_type` enum('development','design','support','meeting','other') NOT NULL,
	`status` enum('todo','in_progress','review','done','blocked') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`estimated_hours` int,
	`actual_hours` int,
	`assigned_to` varchar(255),
	`due_date` timestamp,
	`completed_date` timestamp,
	`billable` enum('yes','no','included') NOT NULL DEFAULT 'yes',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`company` varchar(255),
	`position` varchar(255),
	`client_id` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_name` varchar(255) NOT NULL,
	`contact_person` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`business_type` enum('retainer','hourly','bank','project','one_time') NOT NULL,
	`status` enum('active','inactive','potential') NOT NULL DEFAULT 'active',
	`monthly_retainer` int,
	`hourly_rate` int,
	`bank_hours` int,
	`used_hours` int DEFAULT 0,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `design_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int,
	`task_name` varchar(500) NOT NULL,
	`design_type` enum('logo','banner','ui','mockup','other') NOT NULL,
	`status` enum('todo','in_progress','review','approved','done') NOT NULL DEFAULT 'todo',
	`assigned_to` varchar(255),
	`due_date` timestamp,
	`file_url` varchar(500),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `design_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lead_name` varchar(255) NOT NULL,
	`contact_person` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`source` varchar(100),
	`status` enum('new','contacted','qualified','proposal','negotiation','won','lost') NOT NULL DEFAULT 'new',
	`estimated_value` int,
	`notes` text,
	`converted_to_client_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks_new` (
	`id` int AUTO_INCREMENT NOT NULL,
	`task_name` varchar(500) NOT NULL,
	`status` enum('new','assigned','in_progress','done') NOT NULL DEFAULT 'new',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`assigned_to` varchar(255),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_new_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `website_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int,
	`project_name` varchar(255) NOT NULL,
	`project_type` enum('wordpress','custom','ecommerce','landing','other') NOT NULL,
	`status` enum('planning','design','development','testing','live','maintenance') NOT NULL DEFAULT 'planning',
	`url` varchar(500),
	`launch_date` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `website_projects_id` PRIMARY KEY(`id`)
);
