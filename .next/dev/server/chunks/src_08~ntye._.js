module.exports = [
"[project]/src/lib/nova.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/src_lib_nova_ts_004pqo-._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/nova.ts [app-route] (ecmascript)");
    });
});
}),
"[project]/src/app/api/tasks/route.ts [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/src/app/api/tasks/route.ts [app-route] (ecmascript)");
    });
});
}),
];