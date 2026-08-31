-- Fix fatal double-booking bug
-- Run in Supabase SQL Editor

-- 1. Prevent double booking at DB level (concurrent requests)
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_slot
ON bookings (booking_date, booking_time)
WHERE status <> 'cancelled';

-- 2. Ensure reference is unique
CREATE UNIQUE INDEX IF NOT EXISTS bookings_reference_unique
ON bookings (reference);

-- 3. Verify availability tables exist (they do: availability_hours / availability_closures)
-- Do NOT use working_hours / closures (those tables don't exist)
