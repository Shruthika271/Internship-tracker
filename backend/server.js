import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Tesseract from "tesseract.js";

import { pool } from "./db.js";

import {
    signup,
    login,
    logout,
    me,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile
} from "./auth.js";

import {
    authenticateToken
} from "./middleware/auth.js";


dotenv.config();


const app =
    express();

const PORT =
    process.env.PORT || 5000;

const FRONTEND_ORIGIN =
    process.env.FRONTEND_ORIGIN ||
    "http://localhost:5173";


const __filename =
    fileURLToPath(
        import.meta.url
    );

const __dirname =
    path.dirname(
        __filename
    );


const uploadDirectory =
    path.join(
        __dirname,
        "uploads"
    );


if (
    !fs.existsSync(
        uploadDirectory
    )
) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}


app.use(
    cors({
        origin:
            FRONTEND_ORIGIN,
        credentials: true
    })
);


app.use(
    express.json({
        limit: "2mb"
    })
);


app.use(
    cookieParser()
);


app.use(
    "/uploads",
    express.static(
        uploadDirectory
    )
);


/* ============================================
   HEALTH
============================================ */

app.get(
    "/api/health",
    (req, res) => {
        res.json({
            status: "ok",
            message:
                "Internship Tracker backend is running."
        });
    }
);


/* ============================================
   AUTHENTICATION
============================================ */

app.post(
    "/api/auth/signup",
    signup
);

app.post(
    "/api/auth/login",
    login
);

app.post(
    "/api/auth/verify-email",
    verifyEmail
);

app.post(
    "/api/auth/logout",
    logout
);

app.get(
    "/api/auth/me",
    authenticateToken,
    me
);

app.patch(
    "/api/auth/profile",
    authenticateToken,
    updateProfile
);

app.post(
    "/api/auth/forgot-password",
    forgotPassword
);

app.post(
    "/api/auth/reset-password",
    resetPassword
);

app.post(
    "/api/auth/change-password",
    authenticateToken,
    changePassword
);


/* ============================================
   FILE UPLOAD
============================================ */

const resumeStorage =
    multer.diskStorage({
        destination:
            uploadDirectory,

        filename: (
            req,
            file,
            cb
        ) => {
            cb(
                null,
                `${Date.now()}-${Math.round(
                    Math.random() *
                        1e9
                )}${path.extname(
                    file.originalname
                )}`
            );
        }
    });


const resumeUpload =
    multer({
        storage:
            resumeStorage,

        limits: {
            fileSize:
                10 *
                1024 *
                1024
        },

        fileFilter: (
            req,
            file,
            cb
        ) => {
            const allowed = [
                ".pdf",
                ".doc",
                ".docx"
            ];

            const extension =
                path.extname(
                    file.originalname
                ).toLowerCase();


            if (
                !allowed.includes(
                    extension
                )
            ) {
                return cb(
                    new Error(
                        "Only PDF, DOC and DOCX files are allowed."
                    )
                );
            }


            cb(null, true);
        }
    });


const imageUpload =
    multer({
        storage:
            multer.memoryStorage(),

        limits: {
            fileSize:
                10 *
                1024 *
                1024
        }
    });


/* ============================================
   APPLICATION SELECT
============================================ */

const applicationSelect = `
    SELECT
        a.*,

        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id',
                        t.id,
                        'name',
                        t.name
                    )
                    ORDER BY t.name
                )

                FROM application_tags at
                JOIN tags t
                    ON t.id = at.tag_id

                WHERE
                    at.application_id =
                    a.id
            ),
            '[]'::json
        ) AS tags

    FROM applications a
`;


/* ============================================
   GET APPLICATIONS
============================================ */

app.get(
    "/api/applications",
    authenticateToken,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `${applicationSelect}
                     WHERE a.user_id = $1
                     ORDER BY
                        a.created_at DESC`,
                    [req.user.id]
                );

            res.json(
                result.rows
            );

        } catch (error) {
            console.error(error);

            res.status(500).json({
                error:
                    "Unable to fetch applications."
            });
        }
    }
);


/* ============================================
   CREATE APPLICATION
============================================ */

app.post(
    "/api/applications",
    authenticateToken,
    resumeUpload.single(
        "resume"
    ),
    async (req, res) => {

        const client =
            await pool.connect();

        try {
            const {
                company,
                role,
                location,
                deadline,
                status,
                application_url,
                notes,
                original_posting,
                is_favorite
            } = req.body;


            if (
                !company?.trim() ||
                !role?.trim()
            ) {
                return res.status(400).json({
                    error:
                        "Company and role are required."
                });
            }


            const finalStatus =
                status || "Saved";


            await client.query(
                "BEGIN"
            );


            const result =
                await client.query(
                    `INSERT INTO applications
                    (
                        user_id,
                        company,
                        role,
                        location,
                        deadline,
                        status,
                        application_url,
                        notes,
                        original_posting,
                        resume_original_name,
                        resume_filename,
                        resume_url,
                        is_favorite
                    )
                    VALUES
                    (
                        $1,$2,$3,$4,$5,$6,
                        $7,$8,$9,$10,$11,
                        $12,$13
                    )
                    RETURNING id`,
                    [
                        req.user.id,
                        company.trim(),
                        role.trim(),
                        location?.trim() ||
                            null,
                        deadline ||
                            null,
                        finalStatus,
                        application_url ||
                            null,
                        notes ||
                            null,
                        original_posting ||
                            null,
                        req.file
                            ?.originalname ||
                            null,
                        req.file
                            ?.filename ||
                            null,
                        req.file
                            ? `/uploads/${req.file.filename}`
                            : null,
                        String(
                            is_favorite
                        ) === "true"
                    ]
                );


            await client.query(
                `INSERT INTO
                    application_status_history
                    (
                        application_id,
                        old_status,
                        new_status
                    )
                 VALUES
                    ($1, NULL, $2)`,
                [
                    result.rows[0]
                        .id,
                    finalStatus
                ]
            );


            await client.query(
                "COMMIT"
            );


            const full =
                await pool.query(
                    `${applicationSelect}
                     WHERE
                        a.id = $1
                        AND a.user_id = $2`,
                    [
                        result.rows[0]
                            .id,
                        req.user.id
                    ]
                );


            res.status(201).json(
                full.rows[0]
            );

        } catch (error) {

            await client.query(
                "ROLLBACK"
            );

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to create application."
            });

        } finally {
            client.release();
        }
    }
);


/* ============================================
   UPDATE APPLICATION
============================================ */

app.put(
    "/api/applications/:id",
    authenticateToken,
    resumeUpload.single(
        "resume"
    ),
    async (req, res) => {

        const client =
            await pool.connect();

        try {
            const {
                id
            } = req.params;


            const oldResult =
                await client.query(
                    `SELECT *
                     FROM applications
                     WHERE
                        id = $1
                        AND user_id = $2`,
                    [
                        id,
                        req.user.id
                    ]
                );


            if (
                !oldResult.rows.length
            ) {
                return res.status(404).json({
                    error:
                        "Application not found."
                });
            }


            const current =
                oldResult.rows[0];


            const {
                company,
                role,
                location,
                deadline,
                status,
                application_url,
                notes,
                original_posting,
                is_favorite
            } = req.body;


            const finalStatus =
                status || "Saved";


            const resumeOriginalName =
                req.file
                    ?.originalname ||
                current.resume_original_name;


            const resumeFilename =
                req.file
                    ?.filename ||
                current.resume_filename;


            const resumeUrl =
                req.file
                    ? `/uploads/${req.file.filename}`
                    : current.resume_url;


            await client.query(
                "BEGIN"
            );


            await client.query(
                `UPDATE applications
                 SET
                    company = $1,
                    role = $2,
                    location = $3,
                    deadline = $4,
                    status = $5,
                    application_url = $6,
                    notes = $7,
                    original_posting = $8,
                    resume_original_name = $9,
                    resume_filename = $10,
                    resume_url = $11,
                    is_favorite = $12,
                    updated_at =
                        CURRENT_TIMESTAMP

                 WHERE
                    id = $13
                    AND user_id = $14`,
                [
                    company?.trim(),
                    role?.trim(),
                    location?.trim() ||
                        null,
                    deadline ||
                        null,
                    finalStatus,
                    application_url ||
                        null,
                    notes ||
                        null,
                    original_posting ||
                        null,
                    resumeOriginalName,
                    resumeFilename,
                    resumeUrl,
                    String(
                        is_favorite
                    ) === "true",
                    id,
                    req.user.id
                ]
            );


            if (
                finalStatus !==
                current.status
            ) {
                await client.query(
                    `INSERT INTO
                        application_status_history
                        (
                            application_id,
                            old_status,
                            new_status
                        )
                     VALUES
                        ($1,$2,$3)`,
                    [
                        id,
                        current.status,
                        finalStatus
                    ]
                );
            }


            await client.query(
                "COMMIT"
            );


            if (
                req.file &&
                current.resume_filename
            ) {
                const oldFile =
                    path.join(
                        uploadDirectory,
                        current.resume_filename
                    );


                if (
                    fs.existsSync(
                        oldFile
                    )
                ) {
                    fs.unlinkSync(
                        oldFile
                    );
                }
            }


            const full =
                await pool.query(
                    `${applicationSelect}
                     WHERE
                        a.id = $1
                        AND a.user_id = $2`,
                    [
                        id,
                        req.user.id
                    ]
                );


            res.json(
                full.rows[0]
            );

        } catch (error) {

            await client.query(
                "ROLLBACK"
            );

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to update application."
            });

        } finally {
            client.release();
        }
    }
);


/* ============================================
   DELETE APPLICATION
============================================ */

app.delete(
    "/api/applications/:id",
    authenticateToken,
    async (req, res) => {

        try {
            const result =
                await pool.query(
                    `DELETE FROM applications
                     WHERE
                        id = $1
                        AND user_id = $2
                     RETURNING *`,
                    [
                        req.params.id,
                        req.user.id
                    ]
                );


            if (
                !result.rows.length
            ) {
                return res.status(404).json({
                    error:
                        "Application not found."
                });
            }


            const application =
                result.rows[0];


            if (
                application.resume_filename
            ) {
                const filePath =
                    path.join(
                        uploadDirectory,
                        application.resume_filename
                    );


                if (
                    fs.existsSync(
                        filePath
                    )
                ) {
                    fs.unlinkSync(
                        filePath
                    );
                }
            }


            res.json({
                message:
                    "Application deleted successfully."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to delete application."
            });
        }
    }
);


/* ============================================
   FAVORITES
============================================ */

app.patch(
    "/api/applications/:id/favorite",
    authenticateToken,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `UPDATE applications
                     SET
                        is_favorite =
                            NOT is_favorite,
                        updated_at =
                            CURRENT_TIMESTAMP

                     WHERE
                        id = $1
                        AND user_id = $2

                     RETURNING id`,
                    [
                        req.params.id,
                        req.user.id
                    ]
                );


            if (
                !result.rows.length
            ) {
                return res.status(404).json({
                    error:
                        "Application not found."
                });
            }


            const full =
                await pool.query(
                    `${applicationSelect}
                     WHERE
                        a.id = $1
                        AND a.user_id = $2`,
                    [
                        req.params.id,
                        req.user.id
                    ]
                );


            res.json(
                full.rows[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to update favorite."
            });
        }
    }
);


/* ============================================
   STATUS HISTORY
============================================ */

app.get(
    "/api/applications/:id/history",
    authenticateToken,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `SELECT
                        h.*

                     FROM
                        application_status_history h

                     JOIN applications a
                        ON a.id =
                           h.application_id

                     WHERE
                        h.application_id =
                            $1
                        AND a.user_id =
                            $2

                     ORDER BY
                        h.changed_at DESC`,
                    [
                        req.params.id,
                        req.user.id
                    ]
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to fetch status history."
            });
        }
    }
);


/* ============================================
   TAGS
============================================ */

app.get(
    "/api/tags",
    authenticateToken,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `SELECT *
                     FROM tags
                     WHERE user_id = $1
                     ORDER BY name`,
                    [req.user.id]
                );

            res.json(
                result.rows
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to fetch tags."
            });
        }
    }
);


app.post(
    "/api/tags",
    authenticateToken,
    async (req, res) => {
        try {
            const name =
                String(
                    req.body.name || ""
                ).trim();


            if (!name) {
                return res.status(400).json({
                    error:
                        "Tag name is required."
                });
            }


            const result =
                await pool.query(
                    `INSERT INTO
                        tags
                        (
                            user_id,
                            name
                        )
                     VALUES
                        ($1,$2)

                     ON CONFLICT
                        (user_id,name)
                     DO UPDATE SET
                        name =
                            EXCLUDED.name

                     RETURNING *`,
                    [
                        req.user.id,
                        name
                    ]
                );


            res.status(201).json(
                result.rows[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to create tag."
            });
        }
    }
);


app.post(
    "/api/applications/:id/tags/:tagId",
    authenticateToken,
    async (req, res) => {
        try {

            const application =
                await pool.query(
                    `SELECT id
                     FROM applications
                     WHERE
                        id = $1
                        AND user_id = $2`,
                    [
                        req.params.id,
                        req.user.id
                    ]
                );


            const tag =
                await pool.query(
                    `SELECT id
                     FROM tags
                     WHERE
                        id = $1
                        AND user_id = $2`,
                    [
                        req.params.tagId,
                        req.user.id
                    ]
                );


            if (
                !application.rows.length ||
                !tag.rows.length
            ) {
                return res.status(404).json({
                    error:
                        "Application or tag not found."
                });
            }


            await pool.query(
                `INSERT INTO
                    application_tags
                    (
                        application_id,
                        tag_id
                    )
                 VALUES
                    ($1,$2)
                 ON CONFLICT DO NOTHING`,
                [
                    req.params.id,
                    req.params.tagId
                ]
            );


            res.json({
                message:
                    "Tag attached."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to attach tag."
            });
        }
    }
);


app.delete(
    "/api/applications/:id/tags/:tagId",
    authenticateToken,
    async (req, res) => {
        try {

            await pool.query(
                `DELETE FROM
                    application_tags at
                 USING
                    applications a,
                    tags t

                 WHERE
                    at.application_id =
                        a.id
                    AND at.tag_id =
                        t.id
                    AND a.id = $1
                    AND a.user_id = $2
                    AND t.id = $3
                    AND t.user_id = $2`,
                [
                    req.params.id,
                    req.user.id,
                    req.params.tagId
                ]
            );


            res.json({
                message:
                    "Tag removed."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to remove tag."
            });
        }
    }
);


/* ============================================
   PERSONAL NOTES
============================================ */

app.get(
    "/api/notes",
    authenticateToken,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `SELECT *
                     FROM notes
                     WHERE user_id = $1
                     ORDER BY created_at DESC`,
                    [req.user.id]
                );

            res.json(
                result.rows
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to fetch notes."
            });
        }
    }
);


app.post(
    "/api/notes",
    authenticateToken,
    async (req, res) => {
        try {
            const title =
                String(
                    req.body.title ||
                        "Untitled note"
                ).trim();

            const content =
                String(
                    req.body.content ||
                        ""
                ).trim();


            if (!content) {
                return res.status(400).json({
                    error:
                        "Note content is required."
                });
            }


            const result =
                await pool.query(
                    `INSERT INTO
                        notes
                        (
                            user_id,
                            title,
                            content
                        )
                     VALUES
                        ($1,$2,$3)
                     RETURNING *`,
                    [
                        req.user.id,
                        title,
                        content
                    ]
                );


            res.status(201).json(
                result.rows[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to create note."
            });
        }
    }
);


app.put(
    "/api/notes/:id",
    authenticateToken,
    async (req, res) => {
        try {
            const title =
                String(
                    req.body.title ||
                        "Untitled note"
                ).trim();

            const content =
                String(
                    req.body.content ||
                        ""
                ).trim();


            if (!content) {
                return res.status(400).json({
                    error:
                        "Note content is required."
                });
            }


            const result =
                await pool.query(
                    `UPDATE notes
                     SET
                        title = $1,
                        content = $2,
                        updated_at =
                            CURRENT_TIMESTAMP
                     WHERE
                        id = $3
                        AND user_id = $4
                     RETURNING *`,
                    [
                        title,
                        content,
                        req.params.id,
                        req.user.id
                    ]
                );


            if (
                !result.rows.length
            ) {
                return res.status(404).json({
                    error:
                        "Note not found."
                });
            }


            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to update note."
            });
        }
    }
);


app.delete(
    "/api/notes/:id",
    authenticateToken,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `DELETE FROM notes
                     WHERE
                        id = $1
                        AND user_id = $2
                     RETURNING id`,
                    [
                        req.params.id,
                        req.user.id
                    ]
                );


            if (
                !result.rows.length
            ) {
                return res.status(404).json({
                    error:
                        "Note not found."
                });
            }


            res.json({
                message:
                    "Note deleted."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to delete note."
            });
        }
    }
);


/* ============================================
   PREFERENCES
============================================ */

app.get(
    "/api/preferences",
    authenticateToken,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `SELECT
                        theme,
                        compact_mode
                     FROM user_preferences
                     WHERE user_id = $1`,
                    [req.user.id]
                );


            res.json(
                result.rows[0] || {
                    theme: "dark",
                    compact_mode:
                        false
                }
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to fetch preferences."
            });
        }
    }
);


app.put(
    "/api/preferences",
    authenticateToken,
    async (req, res) => {
        try {
            const theme =
                [
                    "dark",
                    "light",
                    "system"
                ].includes(
                    req.body.theme
                )
                    ? req.body.theme
                    : "dark";


            const compact =
                Boolean(
                    req.body.compact_mode
                );


            const result =
                await pool.query(
                    `INSERT INTO
                        user_preferences
                        (
                            user_id,
                            theme,
                            compact_mode
                        )
                     VALUES
                        ($1,$2,$3)

                     ON CONFLICT
                        (user_id)
                     DO UPDATE SET
                        theme =
                            EXCLUDED.theme,
                        compact_mode =
                            EXCLUDED.compact_mode,
                        updated_at =
                            CURRENT_TIMESTAMP

                     RETURNING
                        theme,
                        compact_mode`,
                    [
                        req.user.id,
                        theme,
                        compact
                    ]
                );


            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to save preferences."
            });
        }
    }
);


/* ============================================
   IMPORT GUEST DATA
============================================ */

app.post(
    "/api/import-guest",
    authenticateToken,
    async (req, res) => {

        const client =
            await pool.connect();

        try {
            const applications =
                Array.isArray(
                    req.body.applications
                )
                    ? req.body.applications
                    : [];


            const notes =
                Array.isArray(
                    req.body.notes
                )
                    ? req.body.notes
                    : [];


            await client.query(
                "BEGIN"
            );


            for (
                const application
                of applications
            ) {
                if (
                    !application.company ||
                    !application.role
                ) {
                    continue;
                }


                const result =
                    await client.query(
                        `INSERT INTO
                            applications
                            (
                                user_id,
                                company,
                                role,
                                location,
                                deadline,
                                status,
                                application_url,
                                notes,
                                original_posting,
                                is_favorite
                            )
                         VALUES
                            (
                                $1,$2,$3,$4,$5,
                                $6,$7,$8,$9,$10
                            )
                         RETURNING id`,
                        [
                            req.user.id,
                            application.company,
                            application.role,
                            application.location ||
                                null,
                            application.deadline ||
                                null,
                            application.status ||
                                "Saved",
                            application.application_url ||
                                null,
                            application.notes ||
                                null,
                            application.original_posting ||
                                null,
                            Boolean(
                                application.is_favorite
                            )
                        ]
                    );


                await client.query(
                    `INSERT INTO
                        application_status_history
                        (
                            application_id,
                            old_status,
                            new_status
                        )
                     VALUES
                        ($1,NULL,$2)`,
                    [
                        result.rows[0]
                            .id,
                        application.status ||
                            "Saved"
                    ]
                );
            }


            for (
                const note
                of notes
            ) {
                const content =
                    String(
                        note.content ??
                            note.text ??
                            ""
                    ).trim();


                if (!content) {
                    continue;
                }


                await client.query(
                    `INSERT INTO
                        notes
                        (
                            user_id,
                            title,
                            content
                        )
                     VALUES
                        ($1,$2,$3)`,
                    [
                        req.user.id,
                        note.title ||
                            "Imported note",
                        content
                    ]
                );
            }


            await client.query(
                "COMMIT"
            );


            res.json({
                message:
                    "Guest data imported successfully."
            });

        } catch (error) {

            await client.query(
                "ROLLBACK"
            );

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to import guest data."
            });

        } finally {
            client.release();
        }
    }
);


/* ============================================
   SMART IMPORT HELPERS
============================================ */

function extractJobText(text) {
    const lines =
        String(text || "")
            .split(/\r?\n/)
            .map(
                (line) =>
                    line.trim()
            )
            .filter(Boolean);


    const roleKeywords = [
        "intern",
        "engineer",
        "developer",
        "software",
        "analyst",
        "research",
        "data scientist",
        "application engineer"
    ];


    const locationPattern =
        /(Bengaluru|Bangalore|Hyderabad|Mumbai|Pune|Chennai|Delhi|Noida|Gurugram|Remote)/i;


    const deadlinePattern =
        /(?:deadline|apply by|applications close|closing date)\s*[:\-]?\s*(.+)/i;


    const role =
        lines.find(
            (line) =>
                roleKeywords.some(
                    (keyword) =>
                        line
                            .toLowerCase()
                            .includes(
                                keyword
                            )
                )
        ) || "";


    const locationLine =
        lines.find(
            (line) =>
                locationPattern.test(
                    line
                )
        );


    const company =
        lines.find(
            (line) =>
                line.length < 100 &&
                !roleKeywords.some(
                    (keyword) =>
                        line
                            .toLowerCase()
                            .includes(
                                keyword
                            )
                )
        ) || "";


    const deadlineLine =
        lines.find(
            (line) =>
                deadlinePattern.test(
                    line
                )
        );


    return {
        company,

        role,

        location:
            locationLine
                ?.match(
                    locationPattern
                )?.[1] || "",

        deadline:
            deadlineLine
                ?.match(
                    deadlinePattern
                )?.[1]
                ?.trim() || "",

        status: "Saved",

        application_url: "",

        notes: "",

        original_posting:
            String(text || "")
    };
}


/* ============================================
   SMART IMPORT — TEXT
============================================ */

app.post(
    "/api/smart-import/text",
    authenticateToken,
    async (req, res) => {
        try {
            if (
                !req.body.text?.trim()
            ) {
                return res.status(400).json({
                    error:
                        "Job posting text is required."
                });
            }


            res.json(
                extractJobText(
                    req.body.text
                )
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to extract job details."
            });
        }
    }
);


/* ============================================
   SMART IMPORT — IMAGE OCR
============================================ */

app.post(
    "/api/smart-import/image",
    authenticateToken,
    imageUpload.single(
        "image"
    ),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error:
                        "Screenshot is required."
                });
            }


            const {
                data: { text }
            } =
                await Tesseract.recognize(
                    req.file.buffer,
                    "eng"
                );


            res.json(
                extractJobText(
                    text
                )
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to read screenshot."
            });
        }
    }
);


/* ============================================
   ERROR HANDLER
============================================ */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {
        console.error(error);

        res.status(400).json({
            error:
                error.message ||
                "Something went wrong."
        });
    }
);


/* ============================================
   START SERVER
============================================ */

app.listen(
    PORT,
    () => {
        console.log(
            `Backend running on http://localhost:${PORT}`
        );
    }
);