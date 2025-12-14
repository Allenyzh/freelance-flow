-- 000004_add_billing_and_service_type.up.sql
-- Add billing fields to clients and service_type to projects

-- Client billing information
ALTER TABLE clients ADD COLUMN billing_company TEXT;
ALTER TABLE clients ADD COLUMN billing_address TEXT;
ALTER TABLE clients ADD COLUMN billing_city TEXT;
ALTER TABLE clients ADD COLUMN billing_province TEXT;
ALTER TABLE clients ADD COLUMN billing_postal_code TEXT;

-- Project service type
ALTER TABLE projects ADD COLUMN service_type TEXT DEFAULT 'software_development';
