-- Run this in your Supabase SQL Editor

-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    gstin TEXT,
    phone TEXT,
    email TEXT,
    jurisdiction_city TEXT,
    logo_url TEXT,
    signature_url TEXT,
    default_lr_format TEXT DEFAULT 'standard',
    default_invoice_format TEXT DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Company Users Mapping (Roles)
CREATE TABLE IF NOT EXISTS public.company_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'Admin', -- Admin, Manager, Staff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One user belongs to one company for now
);

-- Enable RLS for Core Tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Company RLS: Users can only view/edit their own company
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "Users can view their own company" ON public.companies
FOR SELECT USING (id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
CREATE POLICY "Users can update their own company" ON public.companies
FOR UPDATE USING (id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
CREATE POLICY "Users can create companies" ON public.companies
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Company Users RLS
DROP POLICY IF EXISTS "Users can view users in their company" ON public.company_users;
CREATE POLICY "Users can view users in their company" ON public.company_users
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert mapping for themselves" ON public.company_users;
CREATE POLICY "Users can insert mapping for themselves" ON public.company_users
FOR INSERT WITH CHECK (user_id = auth.uid());


-- 3. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    address TEXT,
    gstin TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Strict company isolation for customers" ON public.customers;
CREATE POLICY "Strict company isolation for customers" ON public.customers
FOR ALL USING (company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));


-- 4. Create Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    vehicle_number TEXT NOT NULL,
    vehicle_type TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    owner_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Strict company isolation for vehicles" ON public.vehicles;
CREATE POLICY "Strict company isolation for vehicles" ON public.vehicles
FOR ALL USING (company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));


-- 5. Modify Lorry Receipts Table
-- We will migrate user_id to company_id if needed, but for now we define the new schema
ALTER TABLE public.lorry_receipts 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Booked',
ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

ALTER TABLE public.lorry_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Strict company isolation for lorry_receipts" ON public.lorry_receipts;
CREATE POLICY "Strict company isolation for lorry_receipts" ON public.lorry_receipts
FOR ALL USING (company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));


-- 6. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_address TEXT,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'Pending',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    lr_id UUID REFERENCES public.lorry_receipts(id) ON DELETE SET NULL,
    format TEXT DEFAULT 'standard',
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Strict company isolation for invoices" ON public.invoices;
CREATE POLICY "Strict company isolation for invoices" ON public.invoices
FOR ALL USING (company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));

-- 7. Document Auto-Numbering Functions
CREATE OR REPLACE FUNCTION public.generate_document_number(p_company_id UUID, p_doc_type TEXT)
RETURNS TEXT AS $$
DECLARE
    next_num INT;
    prefix TEXT;
    year_prefix TEXT;
    result TEXT;
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    IF p_doc_type = 'LR' THEN
        prefix := 'LR-' || year_prefix || '-';
        SELECT COALESCE(MAX(CAST(NULLIF(REGEXP_REPLACE(lr_number, '\D', '', 'g'), '') AS INT)), 0) + 1
        INTO next_num
        FROM public.lorry_receipts
        WHERE company_id = p_company_id AND lr_number LIKE prefix || '%';
        
    ELSIF p_doc_type = 'INV' THEN
        prefix := 'INV-' || year_prefix || '-';
        SELECT COALESCE(MAX(CAST(NULLIF(REGEXP_REPLACE(invoice_number, '\D', '', 'g'), '') AS INT)), 0) + 1
        INTO next_num
        FROM public.invoices
        WHERE company_id = p_company_id AND invoice_number LIKE prefix || '%';
    END IF;

    result := prefix || LPAD(next_num::TEXT, 5, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Lorry Receipts
CREATE OR REPLACE FUNCTION public.set_lr_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lr_number IS NULL OR NEW.lr_number = '' OR NEW.lr_number LIKE 'LR-00%' THEN
        NEW.lr_number := public.generate_document_number(NEW.company_id, 'LR');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_lr_number ON public.lorry_receipts;
CREATE TRIGGER trigger_set_lr_number
BEFORE INSERT ON public.lorry_receipts
FOR EACH ROW EXECUTE FUNCTION public.set_lr_number();

-- Trigger for Invoices
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' OR NEW.invoice_number LIKE 'INV-00%' THEN
        NEW.invoice_number := public.generate_document_number(NEW.company_id, 'INV');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invoice_number ON public.invoices;
CREATE TRIGGER trigger_set_invoice_number
BEFORE INSERT ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();

-- 8. Storage Buckets and Policies
-- NOTE: Supabase Storage requires creation of buckets manually or via API, but we define policies here.
-- Assuming bucket 'documents' exists:
-- INSERT INTO storage.buckets (id, name) VALUES ('documents', 'documents');
DROP POLICY IF EXISTS "Company isolation for storage" ON storage.objects;
CREATE POLICY "Company isolation for storage" ON storage.objects
FOR ALL USING (
    bucket_id = 'documents' AND 
    (auth.uid() IN (SELECT user_id FROM public.company_users))
);
