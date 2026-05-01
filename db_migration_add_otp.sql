-- Migration: Add OTP columns to staff table
alter table staff add column if not exists otp text;
alter table staff add column if not exists otp_expires_at timestamp with time zone;
