CREATE TABLE `place_types` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text NOT NULL,
	`key` text,
	`is_system` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `place_types_key_unique` ON `place_types` (`key`);--> statement-breakpoint
CREATE TABLE `places` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`name` text NOT NULL,
	`type_id` text NOT NULL,
	`parent_id` text,
	`latitude` real,
	`longitude` real,
	`gedcom_id` integer,
	FOREIGN KEY (`type_id`) REFERENCES `place_types`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`parent_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `places_gedcom_id_unique` ON `places` (`gedcom_id`);