-- ============================================
-- INTERNSHIP & PLACEMENT TRACKER DATABASE
-- FINAL SCHEMA
-- ============================================


-- ============================================
-- USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(120) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);


-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,

    user_id INTEGER,

    company VARCHAR(150) NOT NULL,

    role VARCHAR(200) NOT NULL,

    location VARCHAR(150),

    deadline DATE,

    status VARCHAR(20) NOT NULL
        CHECK (
            status IN (
                'Saved',
                'Applied',
                'OA',
                'Interview',
                'Offer',
                'Rejected'
            )
        ),

    application_url TEXT,

    notes TEXT,

    original_posting TEXT,

    resume_original_name TEXT,

    resume_filename TEXT,

    resume_url TEXT,

    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_application_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_applications_user_id
ON applications(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
ON applications(status);

CREATE INDEX IF NOT EXISTS idx_applications_deadline
ON applications(deadline);


-- ============================================
-- APPLICATION STATUS HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS application_status_history (
    id SERIAL PRIMARY KEY,

    application_id INTEGER NOT NULL,

    old_status VARCHAR(20),

    new_status VARCHAR(20) NOT NULL,

    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_status_application
        FOREIGN KEY (application_id)
        REFERENCES applications(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_status_history_application
ON application_status_history(application_id);


-- ============================================
-- PERSONAL NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_note_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_notes_user_id
ON notes(user_id);


-- ============================================
-- TAGS
-- ============================================

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    name VARCHAR(50) NOT NULL,

    CONSTRAINT fk_tag_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_tag
        UNIQUE (user_id, name)
);


CREATE INDEX IF NOT EXISTS idx_tags_user_id
ON tags(user_id);


-- ============================================
-- APPLICATION ↔ TAGS
-- ============================================

CREATE TABLE IF NOT EXISTS application_tags (
    application_id INTEGER NOT NULL,

    tag_id INTEGER NOT NULL,

    PRIMARY KEY (
        application_id,
        tag_id
    ),

    CONSTRAINT fk_application_tag_application
        FOREIGN KEY (application_id)
        REFERENCES applications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_application_tag_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);


-- ============================================
-- USER PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    theme VARCHAR(20) NOT NULL DEFAULT 'system'
        CHECK (
            theme IN (
                'light',
                'dark',
                'system'
            )
        ),

    compact_mode BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_preferences_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================
-- EMAIL VERIFICATION OTP
-- ============================================

CREATE TABLE IF NOT EXISTS email_verification_otps (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    otp_hash TEXT NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    used BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_verification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_verification_user
ON email_verification_otps(user_id);


-- ============================================
-- PASSWORD RESET OTP
-- ============================================

CREATE TABLE IF NOT EXISTS password_reset_otps (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    otp_hash TEXT NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    used BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_reset_user
ON password_reset_otps(user_id);