import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import { pool } from "./db.js";


function normalizeEmail(email) {
    return String(email || "")
        .trim()
        .toLowerCase();
}


function generateOTP() {
    return crypto
        .randomInt(
            100000,
            1000000
        )
        .toString();
}


function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}


function cookieOptions() {
    const production =
        process.env.NODE_ENV ===
        "production";

    return {
        httpOnly: true,

        secure: production,

        sameSite: production
            ? "none"
            : "lax",

        maxAge:
            7 *
            24 *
            60 *
            60 *
            1000
    };
}


const transporter =
    nodemailer.createTransport({
        host:
            process.env.EMAIL_HOST,

        port:
            Number(
                process.env.EMAIL_PORT ||
                    587
            ),

        secure:
            Number(
                process.env.EMAIL_PORT
            ) === 465,

        auth: {
            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_PASSWORD
        }
    });


async function sendOTPEmail(
    email,
    otp,
    subject,
    heading
) {
    await transporter.sendMail({
        from:
            process.env.EMAIL_FROM,

        to: email,

        subject,

        text:
            `${heading}\n\n` +
            `Your verification code is: ${otp}\n\n` +
            `This code expires in 10 minutes.\n\n` +
            `If you did not request this, you can safely ignore this email.\n\n` +
            `Internship & Placement Tracker`
    });
}


/* ============================================
   SIGNUP
============================================ */

export async function signup(
    req,
    res
) {
    try {
        const {
            name,
            email,
            password,
            confirmPassword
        } = req.body;


        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                error:
                    "All fields are required."
            });
        }


        if (
            password !==
            confirmPassword
        ) {
            return res.status(400).json({
                error:
                    "Passwords do not match."
            });
        }


        if (
            password.length < 8
        ) {
            return res.status(400).json({
                error:
                    "Password must be at least 8 characters."
            });
        }


        const normalizedEmail =
            normalizeEmail(email);


        const existing =
            await pool.query(
                `SELECT id, email_verified
                 FROM users
                 WHERE email = $1`,
                [normalizedEmail]
            );


        if (
            existing.rows[0]
                ?.email_verified
        ) {
            return res.status(409).json({
                error:
                    "An account with this email already exists."
            });
        }


        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        let user;


        if (existing.rows.length) {

            const result =
                await pool.query(
                    `UPDATE users
                     SET
                        name = $1,
                        password_hash = $2,
                        email_verified = FALSE,
                        updated_at = CURRENT_TIMESTAMP
                     WHERE email = $3
                     RETURNING
                        id,
                        name,
                        email,
                        email_verified`,
                    [
                        name.trim(),
                        passwordHash,
                        normalizedEmail
                    ]
                );


            user =
                result.rows[0];


            await pool.query(
                `UPDATE email_verification_otps
                 SET used = TRUE
                 WHERE user_id = $1`,
                [user.id]
            );

        } else {

            const result =
                await pool.query(
                    `INSERT INTO users
                        (
                            name,
                            email,
                            password_hash
                        )
                     VALUES
                        ($1, $2, $3)
                     RETURNING
                        id,
                        name,
                        email,
                        email_verified`,
                    [
                        name.trim(),
                        normalizedEmail,
                        passwordHash
                    ]
                );


            user =
                result.rows[0];
        }


        const otp =
            generateOTP();


        const otpHash =
            await bcrypt.hash(
                otp,
                10
            );


        await pool.query(
            `INSERT INTO
                email_verification_otps
                (
                    user_id,
                    otp_hash,
                    expires_at
                )
             VALUES
                (
                    $1,
                    $2,
                    CURRENT_TIMESTAMP +
                    INTERVAL '10 minutes'
                )`,
            [
                user.id,
                otpHash
            ]
        );


        await sendOTPEmail(
            user.email,
            otp,
            "Verify your Internship Tracker account",
            "Verify your email address"
        );


        res.status(201).json({
            message:
                "Account created. Verification code sent.",

            userId:
                user.id,

            email:
                user.email,

            requiresVerification:
                true
        });

    } catch (error) {

        console.error(
            "Signup error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to create account."
        });
    }
}


/* ============================================
   VERIFY EMAIL
============================================ */

export async function verifyEmail(
    req,
    res
) {
    try {
        const {
            userId,
            otp
        } = req.body;


        if (!userId || !otp) {
            return res.status(400).json({
                error:
                    "User ID and OTP are required."
            });
        }


        const result =
            await pool.query(
                `SELECT *
                 FROM email_verification_otps
                 WHERE user_id = $1
                   AND used = FALSE
                   AND expires_at >
                       CURRENT_TIMESTAMP
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [userId]
            );


        if (!result.rows.length) {
            return res.status(400).json({
                error:
                    "OTP is invalid or expired."
            });
        }


        const verification =
            result.rows[0];


        const valid =
            await bcrypt.compare(
                String(otp),
                verification.otp_hash
            );


        if (!valid) {
            return res.status(400).json({
                error:
                    "Invalid OTP."
            });
        }


        await pool.query(
            `UPDATE users
             SET
                email_verified = TRUE,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [userId]
        );


        await pool.query(
            `UPDATE
                email_verification_otps
             SET used = TRUE
             WHERE id = $1`,
            [verification.id]
        );


        res.json({
            message:
                "Email verified successfully."
        });

    } catch (error) {

        console.error(
            "Verification error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to verify email."
        });
    }
}


/* ============================================
   LOGIN
============================================ */

export async function login(
    req,
    res
) {
    try {
        const {
            email,
            password
        } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                error:
                    "Email and password are required."
            });
        }


        const result =
            await pool.query(
                `SELECT
                    id,
                    name,
                    email,
                    password_hash,
                    email_verified
                 FROM users
                 WHERE email = $1`,
                [
                    normalizeEmail(email)
                ]
            );


        if (
            !result.rows.length
        ) {
            return res.status(401).json({
                error:
                    "Invalid email or password."
            });
        }


        const user =
            result.rows[0];


        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordMatches) {
            return res.status(401).json({
                error:
                    "Invalid email or password."
            });
        }


        if (!user.email_verified) {
            return res.status(403).json({
                error:
                    "Please verify your email first."
            });
        }


        const token =
            createToken(user);


        res.cookie(
            "token",
            token,
            cookieOptions()
        );


        res.json({
            message:
                "Login successful.",

            user: {
                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email,

                email_verified:
                    user.email_verified
            }
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to log in."
        });
    }
}


/* ============================================
   LOGOUT
============================================ */

export function logout(
    req,
    res
) {
    res.clearCookie(
        "token",
        cookieOptions()
    );

    res.json({
        message:
            "Logged out successfully."
    });
}


/* ============================================
   CURRENT USER
============================================ */

export async function me(
    req,
    res
) {
    try {
        const result =
            await pool.query(
                `SELECT
                    id,
                    name,
                    email,
                    email_verified,
                    created_at
                 FROM users
                 WHERE id = $1`,
                [req.user.id]
            );


        if (!result.rows.length) {
            return res.status(404).json({
                error:
                    "User not found."
            });
        }


        res.json({
            user:
                result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Unable to retrieve account."
        });
    }
}


/* ============================================
   UPDATE PROFILE
============================================ */

export async function updateProfile(
    req,
    res
) {
    try {
        const name =
            String(
                req.body.name || ""
            ).trim();


        if (!name) {
            return res.status(400).json({
                error:
                    "Name is required."
            });
        }


        const result =
            await pool.query(
                `UPDATE users
                 SET
                    name = $1,
                    updated_at =
                        CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING
                    id,
                    name,
                    email,
                    email_verified,
                    created_at`,
                [
                    name,
                    req.user.id
                ]
            );


        if (!result.rows.length) {
            return res.status(404).json({
                error:
                    "User not found."
            });
        }


        res.json({
            user:
                result.rows[0]
        });

    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to update profile."
        });
    }
}


/* ============================================
   FORGOT PASSWORD
============================================ */

export async function forgotPassword(
    req,
    res
) {
    try {
        const email =
            normalizeEmail(
                req.body.email
            );


        if (!email) {
            return res.status(400).json({
                error:
                    "Email address is required."
            });
        }


        const result =
            await pool.query(
                `SELECT id, email
                 FROM users
                 WHERE email = $1`,
                [email]
            );


        const message =
            "If an account exists for this email, a reset code has been sent.";


        if (!result.rows.length) {
            return res.json({
                message
            });
        }


        const user =
            result.rows[0];


        const otp =
            generateOTP();


        const otpHash =
            await bcrypt.hash(
                otp,
                10
            );


        await pool.query(
            `UPDATE password_reset_otps
             SET used = TRUE
             WHERE user_id = $1`,
            [user.id]
        );


        await pool.query(
            `INSERT INTO
                password_reset_otps
                (
                    user_id,
                    otp_hash,
                    expires_at
                )
             VALUES
                (
                    $1,
                    $2,
                    CURRENT_TIMESTAMP +
                    INTERVAL '10 minutes'
                )`,
            [
                user.id,
                otpHash
            ]
        );


        await sendOTPEmail(
            user.email,
            otp,
            "Reset your Internship Tracker password",
            "Password reset code"
        );


        res.json({
            message
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to process password reset."
        });
    }
}


/* ============================================
   RESET PASSWORD
============================================ */

export async function resetPassword(
    req,
    res
) {
    try {
        const {
            email,
            otp,
            newPassword
        } = req.body;


        if (
            !email ||
            !otp ||
            !newPassword
        ) {
            return res.status(400).json({
                error:
                    "Email, OTP and new password are required."
            });
        }


        if (
            newPassword.length < 8
        ) {
            return res.status(400).json({
                error:
                    "Password must be at least 8 characters."
            });
        }


        const userResult =
            await pool.query(
                `SELECT id
                 FROM users
                 WHERE email = $1`,
                [
                    normalizeEmail(
                        email
                    )
                ]
            );


        if (
            !userResult.rows.length
        ) {
            return res.status(400).json({
                error:
                    "Invalid or expired reset code."
            });
        }


        const user =
            userResult.rows[0];


        const otpResult =
            await pool.query(
                `SELECT *
                 FROM password_reset_otps
                 WHERE user_id = $1
                   AND used = FALSE
                   AND expires_at >
                       CURRENT_TIMESTAMP
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [user.id]
            );


        if (
            !otpResult.rows.length
        ) {
            return res.status(400).json({
                error:
                    "Invalid or expired reset code."
            });
        }


        const reset =
            otpResult.rows[0];


        const valid =
            await bcrypt.compare(
                String(otp),
                reset.otp_hash
            );


        if (!valid) {
            return res.status(400).json({
                error:
                    "Invalid reset code."
            });
        }


        const passwordHash =
            await bcrypt.hash(
                newPassword,
                12
            );


        await pool.query(
            `UPDATE users
             SET
                password_hash = $1,
                updated_at =
                    CURRENT_TIMESTAMP
             WHERE id = $2`,
            [
                passwordHash,
                user.id
            ]
        );


        await pool.query(
            `UPDATE password_reset_otps
             SET used = TRUE
             WHERE id = $1`,
            [reset.id]
        );


        res.json({
            message:
                "Password reset successfully."
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to reset password."
        });
    }
}


/* ============================================
   CHANGE PASSWORD
============================================ */

export async function changePassword(
    req,
    res
) {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;


        if (
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                error:
                    "Current and new passwords are required."
            });
        }


        if (
            newPassword.length < 8
        ) {
            return res.status(400).json({
                error:
                    "New password must be at least 8 characters."
            });
        }


        const result =
            await pool.query(
                `SELECT password_hash
                 FROM users
                 WHERE id = $1`,
                [req.user.id]
            );


        if (!result.rows.length) {
            return res.status(404).json({
                error:
                    "User not found."
            });
        }


        const valid =
            await bcrypt.compare(
                currentPassword,
                result.rows[0]
                    .password_hash
            );


        if (!valid) {
            return res.status(400).json({
                error:
                    "Current password is incorrect."
            });
        }


        const newHash =
            await bcrypt.hash(
                newPassword,
                12
            );


        await pool.query(
            `UPDATE users
             SET
                password_hash = $1,
                updated_at =
                    CURRENT_TIMESTAMP
             WHERE id = $2`,
            [
                newHash,
                req.user.id
            ]
        );


        res.json({
            message:
                "Password changed successfully."
        });

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to change password."
        });
    }
}