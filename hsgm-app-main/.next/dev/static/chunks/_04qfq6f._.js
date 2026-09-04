(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/providers.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$DeviceContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/DeviceContext.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$common$2f$CacheCleaner$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/common/CacheCleaner.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function Providers({ children }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Providers.useEffect": ()=>{
            // 1. 서비스 워커 등록
            if (("TURBOPACK compile-time value", "object") !== "undefined" && "serviceWorker" in navigator) {
                navigator.serviceWorker.register("/sw.js").then({
                    "Providers.useEffect": (registration)=>{
                        console.log("Service Worker registered with scope:", registration.scope);
                    }
                }["Providers.useEffect"]).catch({
                    "Providers.useEffect": (error)=>{
                        console.error("Service Worker registration failed:", error);
                    }
                }["Providers.useEffect"]);
            }
            // 2. PWA 설치 프롬프트 이벤트 가로채기 (선택적 커스텀 설치 버튼용)
            const handleBeforeInstallPrompt = {
                "Providers.useEffect.handleBeforeInstallPrompt": (e)=>{
                    // 브라우저의 기본 설치 배너가 자동으로 뜨는 것을 막고 싶다면 e.preventDefault(); 사용
                    // 지금은 기본 배너를 허용하되, 이벤트만 로깅해둡니다.
                    console.log("PWA beforeinstallprompt 이벤트 발생!");
                    window.deferredPrompt = e;
                }
            }["Providers.useEffect.handleBeforeInstallPrompt"];
            window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            return ({
                "Providers.useEffect": ()=>{
                    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
                }
            })["Providers.useEffect"];
        }
    }["Providers.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true,
        disableTransitionOnChange: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$DeviceContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DeviceProvider"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$common$2f$CacheCleaner$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CacheCleaner"], {}, void 0, false, {
                        fileName: "[project]/app/providers.jsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this),
                    children
                ]
            }, void 0, true, {
                fileName: "[project]/app/providers.jsx",
                lineNumber: 41,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/providers.jsx",
            lineNumber: 40,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/providers.jsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_s(Providers, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/common/CacheCleaner.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CacheCleaner",
    ()=>CacheCleaner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function CacheCleaner() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CacheCleaner.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") !== "undefined" && "serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistrations().then({
                    "CacheCleaner.useEffect": (registrations)=>{
                        for (const registration of registrations){
                            registration.unregister();
                        }
                    }
                }["CacheCleaner.useEffect"]);
                if ("caches" in window) {
                    caches.keys().then({
                        "CacheCleaner.useEffect": (names)=>{
                            for (const name of names){
                                caches.delete(name);
                            }
                        }
                    }["CacheCleaner.useEffect"]);
                }
            }
        }
    }["CacheCleaner.useEffect"], []);
    return null;
}
_s(CacheCleaner, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = CacheCleaner;
var _c;
__turbopack_context__.k.register(_c, "CacheCleaner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/contexts/AuthContext.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/client.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    session: null,
    loading: true,
    isDemoUser: false,
    signInWithEmail: async ()=>{},
    signUpWithEmail: async ()=>{},
    signOut: async ()=>{},
    signInAsDemo: ()=>{}
});
const DEFAULT_DEMO_USER = {
    id: "demo-user-101",
    email: "green_smart@hsgm.energy",
    user_metadata: {
        name: "한성스마트하우스",
        apartment: "한성푸르지오 102동 1404호 (32평)",
        plan: "주택용(저압) 누진 요금제"
    }
};
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(DEFAULT_DEMO_USER);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDemoUser, setIsDemoUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
                // Check if we have a mock user in sessionStorage
                const savedUser = ("TURBOPACK compile-time truthy", 1) ? sessionStorage.getItem("mock_user") : "TURBOPACK unreachable";
                if (savedUser) {
                    try {
                        setUser(JSON.parse(savedUser));
                    } catch (e) {
                        setUser(DEFAULT_DEMO_USER);
                    }
                } else {
                    setUser(DEFAULT_DEMO_USER);
                }
                setLoading(false);
                return;
            }
            const getInitialSession = {
                "AuthProvider.useEffect.getInitialSession": async ()=>{
                    try {
                        const { data: { session } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                        if (session?.user) {
                            setUser(session.user);
                            setSession(session);
                            setIsDemoUser(false);
                        }
                    } catch (err) {
                        console.warn("Supabase session check error:", err);
                    } finally{
                        setLoading(false);
                    }
                }
            }["AuthProvider.useEffect.getInitialSession"];
            getInitialSession();
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "AuthProvider.useEffect": (_event, currentSession)=>{
                    if (currentSession?.user) {
                        setUser(currentSession.user);
                        setSession(currentSession);
                        setIsDemoUser(false);
                    } else if (!isDemoUser) {
                        setUser(null);
                        setSession(null);
                    }
                }
            }["AuthProvider.useEffect"]);
            return ({
                "AuthProvider.useEffect": ()=>subscription?.unsubscribe()
            })["AuthProvider.useEffect"];
        }
    }["AuthProvider.useEffect"], [
        isDemoUser
    ]);
    const signInWithEmail = async (email, password)=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
            const mockUser = {
                id: "demo-user-custom",
                email,
                user_metadata: {
                    name: email.split("@")[0] || "사용자"
                }
            };
            setUser(mockUser);
            if ("TURBOPACK compile-time truthy", 1) sessionStorage.setItem("mock_user", JSON.stringify(mockUser));
            setIsDemoUser(true);
            return {
                success: true
            };
        }
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        setUser(data.user);
        setSession(data.session);
        setIsDemoUser(false);
        return {
            success: true,
            data
        };
    };
    const signUpWithEmail = async (email, password, metadata = {})=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
            const newUser = {
                id: "demo-user-" + Date.now(),
                email,
                user_metadata: {
                    name: metadata.name || "신규 사용자",
                    ...metadata
                }
            };
            setUser(newUser);
            if ("TURBOPACK compile-time truthy", 1) sessionStorage.setItem("mock_user", JSON.stringify(newUser));
            setIsDemoUser(true);
            return {
                success: true
            };
        }
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        if (error) throw error;
        return {
            success: true,
            data
        };
    };
    const signOut = async ()=>{
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"]) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
        } else {
            if ("TURBOPACK compile-time truthy", 1) sessionStorage.removeItem("mock_user");
        }
        setUser(null);
        setSession(null);
        setIsDemoUser(false);
        if ("TURBOPACK compile-time truthy", 1) {
            window.location.href = "/auth/login";
        }
    };
    const signInAsDemo = ()=>{
        setUser(DEFAULT_DEMO_USER);
        if ("TURBOPACK compile-time truthy", 1) sessionStorage.removeItem("mock_user");
        setIsDemoUser(true);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            session,
            loading,
            isDemoUser,
            signInWithEmail,
            signUpWithEmail,
            signOut,
            signInAsDemo
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/AuthContext.jsx",
        lineNumber: 151,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "vujE8Ffh2vOlYtWuxam3WIk10F8=");
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
};
_s1(useAuth, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/contexts/DeviceContext.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeviceProvider",
    ()=>DeviceProvider,
    "useDevices",
    ()=>useDevices
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/deviceService.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const DeviceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function DeviceProvider({ children }) {
    _s();
    const [devices, setDevices] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // 1. 초기 가전 목록 로드
    const fetchDevices = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DeviceProvider.useCallback[fetchDevices]": async ()=>{
            try {
                const data = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deviceService"].getDevices();
                setDevices(data || []);
            } catch (err) {
                console.error("가전 목록 로드 실패:", err);
            } finally{
                setLoading(false);
            }
        }
    }["DeviceProvider.useCallback[fetchDevices]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeviceProvider.useEffect": ()=>{
            fetchDevices();
            // 2. Supabase Realtime 웹소켓 실시간 구독
            const unsubscribe = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deviceService"].subscribeDevices({
                "DeviceProvider.useEffect.unsubscribe": (payload)=>{
                    const { eventType, new: newDevice, old: oldDevice } = payload;
                    setDevices({
                        "DeviceProvider.useEffect.unsubscribe": (prev)=>{
                            if (eventType === "INSERT") {
                                if (prev.some({
                                    "DeviceProvider.useEffect.unsubscribe": (d)=>d.id === newDevice.id
                                }["DeviceProvider.useEffect.unsubscribe"])) return prev;
                                return [
                                    ...prev,
                                    newDevice
                                ];
                            }
                            if (eventType === "UPDATE") {
                                return prev.map({
                                    "DeviceProvider.useEffect.unsubscribe": (d)=>d.id === newDevice.id ? {
                                            ...d,
                                            ...newDevice
                                        } : d
                                }["DeviceProvider.useEffect.unsubscribe"]);
                            }
                            if (eventType === "DELETE") {
                                return prev.filter({
                                    "DeviceProvider.useEffect.unsubscribe": (d)=>d.id !== oldDevice?.id
                                }["DeviceProvider.useEffect.unsubscribe"]);
                            }
                            return prev;
                        }
                    }["DeviceProvider.useEffect.unsubscribe"]);
                }
            }["DeviceProvider.useEffect.unsubscribe"]);
            return ({
                "DeviceProvider.useEffect": ()=>{
                    if (typeof unsubscribe === "function") unsubscribe();
                }
            })["DeviceProvider.useEffect"];
        }
    }["DeviceProvider.useEffect"], [
        fetchDevices
    ]);
    // 3. 전원 온/오프 토글 함수
    const toggleDeviceStatus = async (id)=>{
        const target = devices.find((d)=>d.id === id);
        if (!target) return;
        const nextStatus = !target.status;
        // 낙관적 UI 업데이트
        setDevices((prev)=>prev.map((d)=>d.id === id ? {
                    ...d,
                    status: nextStatus
                } : d));
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deviceService"].updateDeviceStatus(id, nextStatus, target.category);
        } catch (err) {
            console.error("전원 제어 실패:", err);
            fetchDevices();
        }
    };
    // 4. 가전 세부 상태(온도, 모드 등) 수정 함수
    const updateDeviceState = async (id, statePatch)=>{
        setDevices((prev)=>prev.map((d)=>d.id === id ? {
                    ...d,
                    state: {
                        ...d.state || {},
                        ...statePatch
                    }
                } : d));
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deviceService"].updateDeviceState(id, statePatch);
        } catch (err) {
            console.error("상태 제어 실패:", err);
            fetchDevices();
        }
    };
    // 5. 홈 화면 표시(즐겨찾기/별표) 토글 함수
    const togglePinDevice = (id)=>{
        setDevices((prev)=>prev.map((d)=>d.id === id ? {
                    ...d,
                    isPinned: !d.isPinned
                } : d));
    };
    // 6. 가전 추가 (Supabase INSERT 및 목록 반영)
    const addDevice = async (deviceData, userId)=>{
        try {
            const newDevice = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deviceService"].addDevice(deviceData, userId);
            if (newDevice) {
                setDevices((prev)=>{
                    if (prev.some((d)=>d.id === newDevice.id)) return prev;
                    return [
                        ...prev,
                        newDevice
                    ];
                });
            }
            return newDevice;
        } catch (err) {
            console.error("가전 추가 실패:", err);
            throw err;
        }
    };
    // 7. 가전 삭제 (Supabase DELETE)
    const deleteDevice = async (id)=>{
        setDevices((prev)=>prev.filter((d)=>d.id !== id));
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$deviceService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deviceService"].deleteDevice(id);
        } catch (err) {
            console.error("가전 삭제 실패:", err);
            fetchDevices();
            throw err;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DeviceContext.Provider, {
        value: {
            devices,
            loading,
            fetchDevices,
            toggleDeviceStatus,
            updateDeviceState,
            togglePinDevice,
            addDevice,
            deleteDevice
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/DeviceContext.jsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_s(DeviceProvider, "qkSckEq6loD7VngNYPDJAmxlTVM=");
_c = DeviceProvider;
function useDevices() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(DeviceContext);
    if (!context) {
        throw new Error("useDevices must be used within a DeviceProvider");
    }
    return context;
}
_s1(useDevices, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "DeviceProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/supabase/client.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured,
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://tlgxegsnqiiodftxxzpz.supabase.co") || "https://placeholder.supabase.co";
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZ3hlZ3NucWlpb2RmdHh4enB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzOTc5MzAsImV4cCI6MjEwMzk3MzkzMH0.v9m3kmFVVpbxKBO_D7JMrwdxiR6GYtYtiXk7CD55vbU") || "placeholder-anon-key";
const isSupabaseConfigured = Boolean(("TURBOPACK compile-time value", "https://tlgxegsnqiiodftxxzpz.supabase.co") && ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZ3hlZ3NucWlpb2RmdHh4enB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzOTc5MzAsImV4cCI6MjEwMzk3MzkzMH0.v9m3kmFVVpbxKBO_D7JMrwdxiR6GYtYtiXk7CD55vbU") && !("TURBOPACK compile-time value", "https://tlgxegsnqiiodftxxzpz.supabase.co").includes("placeholder"));
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/deviceService.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deviceService",
    ()=>deviceService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/client.js [app-client] (ecmascript)");
;
// UUID 형식 검증 함수
const isValidUUID = (str)=>{
    if (!str || typeof str !== "string") return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};
// DB 데이터(스네이크 케이스)를 프론트엔드 호환 규격(카멜 케이스)으로 자동 변환
const normalizeDevice = (d)=>{
    if (!d) return d;
    return {
        ...d,
        isSmartControl: d.is_smart_control ?? d.isSmartControl ?? true,
        currentPower: d.current_power ?? d.currentPower ?? 0,
        monthlyCost: d.monthly_cost ?? d.monthlyCost ?? 0,
        monthlyUsage: d.monthly_usage_kwh ?? d.monthlyUsage ?? 0,
        energyGrade: d.energy_grade ?? d.energyGrade ?? 1,
        controlType: d.control_type ?? d.controlType ?? "wifi",
        asInfo: d.asInfo || {
            center: d.as_center_name,
            phone: d.as_phone,
            siteUrl: d.as_site_url
        }
    };
};
// IoT 가전 카테고리별 가동 전력
const DEFAULT_POWER_WATTS = {
    air_conditioner: 1600,
    refrigerator: 140,
    washer: 800,
    tv: 120,
    cooker: 1000,
    air_purifier: 45,
    robot_cleaner: 35
};
const deviceService = {
    // 1. 가전 목록 조회 (가져오면서 프론트엔드 변수명으로 자동 정규화)
    async getDevices (userId) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"] && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
            try {
                let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("devices").select("*").order("created_at", {
                    ascending: true
                });
                if (userId && isValidUUID(userId)) {
                    query = query.eq("user_id", userId);
                }
                const { data, error } = await query;
                if (!error && data) {
                    return data.map(normalizeDevice);
                }
                if (error) console.error("Supabase getDevices error:", error.message || error);
            } catch (e) {
                console.error("Database connection error:", e);
            }
        }
        return [];
    },
    // 2. 가전 추가
    async addDevice (deviceData, userId) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"] && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
            const payload = {
                name: deviceData.name,
                brand: deviceData.brand || "기타",
                model: deviceData.model || "MODEL-" + Date.now().toString().slice(-4),
                category: deviceData.category || "air_conditioner",
                icon: deviceData.icon || "Zap",
                status: false,
                current_power: 0,
                energy_grade: deviceData.releaseEnergyGrade || deviceData.energyGrade || 1,
                is_smart_control: true,
                control_type: deviceData.controlType || "wifi",
                specs: deviceData.specs || {},
                as_center_name: deviceData.asInfo?.center || deviceData.as_center_name,
                as_phone: deviceData.asInfo?.phone || deviceData.as_phone,
                as_site_url: deviceData.asInfo?.siteUrl || deviceData.as_site_url,
                state: deviceData.state || {
                    temperature: 24,
                    mode: "cool",
                    fanSpeed: "auto"
                },
                user_id: isValidUUID(userId) ? userId : null
            };
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("devices").insert([
                payload
            ]).select().single();
            if (error) throw error;
            return normalizeDevice(data);
        }
        return {
            id: "dev-" + Date.now(),
            ...deviceData
        };
    },
    // 3. 전원 토글 제어
    async updateDeviceStatus (id, newStatus, category) {
        const activeWatt = DEFAULT_POWER_WATTS[category] || 100;
        const currentPower = newStatus ? activeWatt : category === "tv" ? 1 : 0;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"] && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("devices").update({
                status: newStatus,
                current_power: currentPower
            }).eq("id", id).select().single();
            if (error) console.error("Supabase updateStatus error:", error.message || error);
            return normalizeDevice(data);
        }
    },
    // 4. 세부 상태 제어
    async updateDeviceState (id, newStatePatch) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"] && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
            const { data: current } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("devices").select("state").eq("id", id).single();
            const updatedState = {
                ...current?.state || {},
                ...newStatePatch
            };
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("devices").update({
                state: updatedState
            }).eq("id", id).select().single();
            if (error) console.error("Supabase updateState error:", error.message || error);
            return normalizeDevice(data);
        }
    },
    // 5. 실시간 웹소켓 구독 (실시간 데이터도 정규화 처리)
    subscribeDevices (onUpdate) {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"] || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) return ()=>{};
        const channel = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].channel("realtime-devices-changes").on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "devices"
        }, (payload)=>{
            if (payload.new) {
                payload.new = normalizeDevice(payload.new);
            }
            onUpdate(payload);
        }).subscribe();
        return ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].removeChannel(channel);
        };
    },
    // 6. 가전 삭제
    async deleteDevice (id) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseConfigured"] && __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"]) {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("devices").delete().eq("id", id);
            if (error) console.error("Supabase delete error:", error.message || error);
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_04qfq6f._.js.map