export { default } from "next-auth/middleware";

export const config = {
    // Явно защищаем нужные маршруты, чтобы 404 работал корректно на остальных
    matcher: [
        "/",
        "/classes/:path*",
        "/calendar",
        "/orders",
        "/reception",
        "/profile",
    ],
};


