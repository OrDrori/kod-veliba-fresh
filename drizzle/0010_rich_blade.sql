ALTER TABLE `billing_charges` MODIFY COLUMN `client_id` int;--> statement-breakpoint
ALTER TABLE `client_tasks` MODIFY COLUMN `client_id` int;--> statement-breakpoint
ALTER TABLE `client_tasks` MODIFY COLUMN `task_type` enum('development','design','support','meeting','other');--> statement-breakpoint
ALTER TABLE `design_tasks` MODIFY COLUMN `design_type` enum('logo','banner','ui','mockup','other');--> statement-breakpoint
ALTER TABLE `website_projects` MODIFY COLUMN `project_type` enum('wordpress','custom','ecommerce','landing','other');