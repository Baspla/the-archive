CREATE TABLE `collection_works` (
	`collectionId` text NOT NULL,
	`workId` text NOT NULL,
	`addedByPenNameId` text NOT NULL,
	`added_date` integer NOT NULL,
	PRIMARY KEY(`collectionId`, `workId`),
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`addedByPenNameId`) REFERENCES `pen_names`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`public_submissions_allowed` integer NOT NULL,
	`deadline_date` integer,
	`creation_date` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `featured_collections` (
	`id` text PRIMARY KEY NOT NULL,
	`collectionId` text NOT NULL,
	`feature_start_date` integer NOT NULL,
	`feature_end_date` integer,
	`creation_date` integer NOT NULL,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `featured_works` (
	`id` text PRIMARY KEY NOT NULL,
	`workId` text NOT NULL,
	`feature_start_date` integer NOT NULL,
	`feature_end_date` integer,
	`creation_date` integer NOT NULL,
	FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pen_names` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`reveal_date` integer,
	`creation_date` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_pen_name` ON `pen_names` (`name`);--> statement-breakpoint
CREATE TABLE `user_work_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`workId` text NOT NULL,
	`content` text NOT NULL,
	`creation_date` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_work_likes` (
	`userId` text NOT NULL,
	`workId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` text PRIMARY KEY NOT NULL,
	`penNameId` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`summary` text,
	`reveal_date` integer,
	`publication_date` integer,
	`last_edited_date` integer NOT NULL,
	`creation_date` integer NOT NULL,
	FOREIGN KEY (`penNameId`) REFERENCES `pen_names`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `users` ADD `role` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `streak_length`;