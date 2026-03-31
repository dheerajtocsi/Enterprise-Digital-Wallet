--liquibase formatted sql
--changeset enterprise:V007-v2 labels:fix
--comment: Comprehensive type repair for PostgreSQL compatibility (Booleans, Integers, BigInts)

-- 1. Fix User Table
ALTER TABLE WALLET_USERS 
    ALTER COLUMN IS_ACTIVE TYPE BOOLEAN USING IS_ACTIVE::boolean,
    ALTER COLUMN IS_EMAIL_VERIFIED TYPE BOOLEAN USING IS_EMAIL_VERIFIED::boolean,
    ALTER COLUMN FAILED_LOGIN_ATTEMPTS TYPE INTEGER USING FAILED_LOGIN_ATTEMPTS::integer;

-- 2. Fix Wallet Table
ALTER TABLE WALLETS
    ALTER COLUMN VERSION TYPE BIGINT USING VERSION::bigint;

-- 3. Fix Refresh Tokens
ALTER TABLE REFRESH_TOKENS 
    ALTER COLUMN IS_REVOKED TYPE BOOLEAN USING IS_REVOKED::boolean;
