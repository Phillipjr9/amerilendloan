CREATE TABLE `verificationDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loanApplicationId` int,
	`documentType` enum('drivers_license_front','drivers_license_back','passport','national_id_front','national_id_back','ssn_card','bank_statement','utility_bill','pay_stub','tax_return','other') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`filePath` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`status` enum('pending','under_review','approved','rejected','expired') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`rejectionReason` text,
	`adminNotes` text,
	`expiryDate` varchar(10),
	`documentNumber` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verificationDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `loanApplications` ADD `disbursementMethod` enum('bank_transfer','check','debit_card','paypal','crypto') NOT NULL;