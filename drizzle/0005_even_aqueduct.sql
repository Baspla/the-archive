PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contests` (
	`id` text PRIMARY KEY NOT NULL,
	`creatorUserId` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`prompt` text NOT NULL,
	`rules` text NOT NULL,
	`creation_date` integer NOT NULL,
	`publication_date` integer,
	`last_edited_date` integer,
	`prompt_reveal_date` integer,
	`submission_start_date` integer,
	`submission_end_date` integer,
	FOREIGN KEY (`creatorUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_contests`("id", "creatorUserId", "title", "description", "prompt", "rules", "creation_date", "publication_date", "last_edited_date", "prompt_reveal_date", "submission_start_date", "submission_end_date") SELECT "id", "creatorUserId", "title", "description", "prompt", "rules", "creation_date", "publication_date", "last_edited_date", "prompt_reveal_date", "submission_start_date", "submission_end_date" FROM `contests`;--> statement-breakpoint
DROP TABLE `contests`;--> statement-breakpoint
ALTER TABLE `__new_contests` RENAME TO `contests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;