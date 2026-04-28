module.exports = [
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
];

//# sourceMappingURL=src_lib_nova_ts_004pqo-._.js.map