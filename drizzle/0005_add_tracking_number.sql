-- Add tracking number column to loan applications
ALTER TABLE `loanApplications` ADD `trackingNumber` varchar(20) NOT NULL UNIQUE;

-- Generate tracking numbers for existing applications
-- This will create tracking numbers in the format AL-YYYYMMDD-XXXXX for existing records
-- Note: Run this only once during migration
