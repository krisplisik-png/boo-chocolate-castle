CREATE TABLE `completions` (
	`number` integer PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`created` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `completions_run_id_unique` ON `completions` (`run_id`);--> statement-breakpoint
CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`created` text
);
