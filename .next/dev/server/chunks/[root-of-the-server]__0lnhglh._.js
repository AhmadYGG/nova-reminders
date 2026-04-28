module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'error',
        'warn'
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[project]/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COOKIE_OPTIONS",
    ()=>COOKIE_OPTIONS,
    "generateToken",
    ()=>generateToken,
    "getUserFromRequest",
    ()=>getUserFromRequest,
    "hashPassword",
    ()=>hashPassword,
    "verifyPassword",
    ()=>verifyPassword,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
;
const JWT_SECRET = process.env.JWT_SECRET || 'nova-reminders-secret-key-2024';
const SALT_ROUNDS = 12;
async function hashPassword(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, SALT_ROUNDS);
}
async function verifyPassword(password, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
function generateToken(userId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign({
        userId
    }, JWT_SECRET, {
        expiresIn: '7d'
    });
}
function verifyToken(token) {
    try {
        const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
        return decoded;
    } catch  {
        return null;
    }
}
async function getUserFromRequest(request) {
    try {
        // Try to get token from cookies
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) return null;
        const cookies = cookieHeader.split(';').reduce((acc, cookie)=>{
            const [key, ...value] = cookie.trim().split('=');
            acc[key] = value.join('=');
            return acc;
        }, {});
        const token = cookies['nova_token'];
        if (!token) return null;
        const decoded = verifyToken(token);
        if (!decoded) return null;
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
            where: {
                id: decoded.userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    } catch  {
        return null;
    }
}
const COOKIE_OPTIONS = {
    name: 'nova_token',
    httpOnly: true,
    secure: ("TURBOPACK compile-time value", "development") === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
};
}),
"[project]/src/lib/nova.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Nova Persona Library
 * Generates Nova-style reminder messages in Indonesian
 */ __turbopack_context__.s([
    "formatTimeUntil",
    ()=>formatTimeUntil,
    "generateCompletionMessage",
    ()=>generateCompletionMessage,
    "generateDeadlineMessage",
    ()=>generateDeadlineMessage,
    "generateOverdueMessage",
    ()=>generateOverdueMessage,
    "generateReminderMessage",
    ()=>generateReminderMessage,
    "generateTaskCreatedMessage",
    ()=>generateTaskCreatedMessage
]);
function formatTimeUntil(date) {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const isPast = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);
    const minutes = Math.floor(absDiffMs / (1000 * 60));
    const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    if (isPast) {
        if (minutes < 1) return 'baru saja';
        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        return `${days} hari yang lalu`;
    }
    if (minutes < 1) return 'sekarang';
    if (minutes < 60) return `${minutes} menit lagi`;
    if (hours < 24) return `${hours} jam lagi`;
    // For days, add time of day context
    if (days === 1) {
        const hour = date.getHours();
        if (hour < 11) return 'besok pagi';
        if (hour < 15) return 'besok siang';
        if (hour < 18) return 'besok sore';
        return 'besok malam';
    }
    if (days < 7) return `${days} hari lagi`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return 'minggu depan';
    return `${weeks} minggu lagi`;
}
function generateReminderMessage(taskTitle, timeUntilDue) {
    return `Hey! 👋 Kamu punya tugas '${taskTitle}' yang ${timeUntilDue}. Aku udah siapkan semuanya, tinggal kamu yang action!`;
}
function generateDeadlineMessage(taskTitle, timeLeft) {
    return `Nova di sini~ Jangan sampai kelewatan ya, '${taskTitle}' deadline-nya ${timeLeft}!`;
}
function generateTaskCreatedMessage(taskTitle, reminderTime) {
    const reminderSuffix = reminderTime ? ` dan aku bakal ingetin kamu ${reminderTime}` : '';
    return `Psst! Baru aja kamu tambahin reminder '${taskTitle}'${reminderSuffix}. Aku bakal ingetin kamu tepat waktu! 💪`;
}
function generateOverdueMessage(taskTitle) {
    return `⚠️ Hey! Tugas '${taskTitle}' udah lewat deadline nih. Yuk buruan kerjain!`;
}
function generateCompletionMessage(taskTitle) {
    return `Keren! 🎉 Kamu udah selesaikan '${taskTitle}'. Keep it up!`;
}
}),
"[project]/src/app/api/notifications/pending/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$nova$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/nova.ts [app-route] (ecmascript)");
;
;
;
;
async function GET(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserFromRequest"])(request);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Tidak terautentikasi'
            }, {
                status: 401
            });
        }
        const now = new Date();
        const newNotifications = [];
        // Find tasks where reminderTime <= now AND isNotificationEnabled AND !notificationSent
        const dueReminders = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].task.findMany({
            where: {
                userId: user.id,
                reminderTime: {
                    lte: now
                },
                isNotificationEnabled: true,
                notificationSent: false,
                deletedAt: null,
                status: 'pending'
            }
        });
        // Process each due reminder
        for (const task of dueReminders){
            const timeUntilDue = task.dueDate ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$nova$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatTimeUntil"])(new Date(task.dueDate)) : 'sekarang';
            let message;
            if (task.dueDate && new Date(task.dueDate) <= now) {
                // Task is overdue
                message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$nova$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateOverdueMessage"])(task.title);
            } else if (task.dueDate) {
                // Task has a deadline coming up
                message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$nova$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDeadlineMessage"])(task.title, timeUntilDue);
            } else {
                // Just a reminder
                message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$nova$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateReminderMessage"])(task.title, timeUntilDue);
            }
            const notification = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.create({
                data: {
                    userId: user.id,
                    taskId: task.id,
                    message
                }
            });
            // Mark notificationSent as true
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].task.update({
                where: {
                    id: task.id
                },
                data: {
                    notificationSent: true
                }
            });
            newNotifications.push(notification);
        }
        // Check for overdue tasks (dueDate < now, status = pending, not deleted)
        const overdueTasks = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].task.findMany({
            where: {
                userId: user.id,
                dueDate: {
                    lt: now
                },
                status: 'pending',
                deletedAt: null
            }
        });
        // For overdue tasks, check if we've already sent an overdue notification today
        for (const task of overdueTasks){
            // Check if there's already an overdue notification for this task today
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const existingNotification = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.findFirst({
                where: {
                    userId: user.id,
                    taskId: task.id,
                    message: {
                        contains: 'lewat deadline'
                    },
                    createdAt: {
                        gte: todayStart
                    }
                }
            });
            if (!existingNotification) {
                const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$nova$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateOverdueMessage"])(task.title);
                const notification = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].notification.create({
                    data: {
                        userId: user.id,
                        taskId: task.id,
                        message
                    }
                });
                newNotifications.push(notification);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            notifications: newNotifications
        }, {
            status: 200
        });
    } catch (error) {
        console.error('Pending notifications error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Terjadi kesalahan server'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0lnhglh._.js.map