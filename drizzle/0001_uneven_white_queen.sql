PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_works` (
	`id` text PRIMARY KEY NOT NULL,
	`penNameId` text NOT NULL,
	`title` text,
	`content` text,
	`summary` text,
	`reveal_date` integer,
	`publication_date` integer,
	`last_edited_date` integer NOT NULL,
	`creation_date` integer NOT NULL,
	FOREIGN KEY (`penNameId`) REFERENCES `pen_names`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_works`("id", "penNameId", "title", "content", "summary", "reveal_date", "publication_date", "last_edited_date", "creation_date") SELECT "id", "penNameId", "title", "content", "summary", "reveal_date", "publication_date", "last_edited_date", "creation_date" FROM `works`;--> statement-breakpoint
DROP TABLE `works`;--> statement-breakpoint
ALTER TABLE `__new_works` RENAME TO `works`;--> statement-breakpoint
PRAGMA foreign_keys=ON;