-- ============================================================================
-- SAMPLE DATA FOR CHARTS
-- ============================================================================
-- This script inserts sample transaction data to populate the dashboard charts
-- Run this in your Supabase SQL editor

-- ============================================================================
-- 1. SALES CHART DATA - This Week (Sun-Sat)
-- ============================================================================
-- Creates sales data for the week with peak on Thursday (₱30,450)

WITH this_week AS (
  -- Get current week (Sun-Sat)
  SELECT 
    (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::int)::date as week_start
)
INSERT INTO transactions (
  client_id,
  client_name,
  total_amount,
  discount_total,
  net_amount,
  amount_paid,
  status,
  created_by,
  created_at
)
SELECT 
  NULL,
  'Walk-in Client ' || ROW_NUMBER() OVER (ORDER BY day_offset),
  CASE 
    WHEN day_offset = 0 THEN 5000      -- Sunday
    WHEN day_offset = 1 THEN 8000      -- Monday
    WHEN day_offset = 2 THEN 3500      -- Tuesday
    WHEN day_offset = 3 THEN 4200      -- Wednesday
    WHEN day_offset = 4 THEN 30450     -- Thursday (peak)
    WHEN day_offset = 5 THEN 2300      -- Friday
    WHEN day_offset = 6 THEN 1800      -- Saturday
  END as total_amount,
  0 as discount_total,
  CASE 
    WHEN day_offset = 0 THEN 5000
    WHEN day_offset = 1 THEN 8000
    WHEN day_offset = 2 THEN 3500
    WHEN day_offset = 3 THEN 4200
    WHEN day_offset = 4 THEN 30450
    WHEN day_offset = 5 THEN 2300
    WHEN day_offset = 6 THEN 1800
  END as net_amount,
  CASE 
    WHEN day_offset = 0 THEN 5000
    WHEN day_offset = 1 THEN 8000
    WHEN day_offset = 2 THEN 3500
    WHEN day_offset = 3 THEN 4200
    WHEN day_offset = 4 THEN 30450
    WHEN day_offset = 5 THEN 2300
    WHEN day_offset = 6 THEN 1800
  END as amount_paid,
  'Completed' as status,
  (SELECT id FROM profiles LIMIT 1), -- Current user
  ((SELECT week_start FROM this_week) + INTERVAL '1 day' * day_offset)::timestamptz as created_at
FROM (
  SELECT GENERATE_SERIES(0, 6) as day_offset
) days;

-- ============================================================================
-- 2. TRANSACTIONS CHART DATA - Jan to Dec (Monthly)
-- ============================================================================
-- Creates transaction count data for each month with peak in May (8 transactions)

INSERT INTO transactions (
  client_id,
  client_name,
  total_amount,
  discount_total,
  net_amount,
  amount_paid,
  status,
  created_by,
  created_at
)
SELECT 
  NULL,
  'Client ' || month_num || ' - ' || transaction_num,
  (500 + RANDOM() * 9500)::numeric(10,2) as total_amount,
  0 as discount_total,
  (500 + RANDOM() * 9500)::numeric(10,2) as net_amount,
  (500 + RANDOM() * 9500)::numeric(10,2) as amount_paid,
  'Completed' as status,
  (SELECT id FROM profiles LIMIT 1),
  (DATE_TRUNC('month', DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 month' * (month_num - 1)) 
   + (RANDOM() * 27)::int * INTERVAL '1 day'
   + (RANDOM() * 24)::int * INTERVAL '1 hour')::timestamptz
FROM (
  SELECT 
    month_num,
    CASE 
      WHEN month_num = 5 THEN 8    -- May: 8 transactions (peak)
      WHEN month_num IN (3, 4, 6, 7) THEN 4  -- Moderate months
      ELSE 2                        -- Low traffic months
    END as max_transactions
  FROM (
    SELECT GENERATE_SERIES(1, 12) as month_num
  ) months
) month_counts
CROSS JOIN LATERAL (
  SELECT GENERATE_SERIES(1, month_counts.max_transactions) as transaction_num
) trans;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the data was inserted correctly

-- Check this week's sales by day
SELECT 
  TO_CHAR(created_at, 'Day') as day_of_week,
  SUM(net_amount)::numeric(10,2) as daily_sales
FROM transactions
WHERE created_at >= (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::int)
  AND created_at < (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::int + INTERVAL '7 days')
  AND status = 'Completed'
GROUP BY TO_CHAR(created_at, 'Day'), EXTRACT(DOW FROM created_at)
ORDER BY EXTRACT(DOW FROM created_at);

-- Check monthly transactions
SELECT 
  TO_CHAR(created_at, 'Mon') as month,
  COUNT(*) as transaction_count
FROM transactions
WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND status = 'Completed'
GROUP BY EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
ORDER BY EXTRACT(MONTH FROM created_at);
