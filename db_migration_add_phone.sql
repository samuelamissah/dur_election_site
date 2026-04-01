-- Migration: Add phone column to staff table
alter table staff add column if not exists phone text;
