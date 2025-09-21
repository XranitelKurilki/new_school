"use client";
import { useEffect } from "react";

export default function PWARegister() {
    useEffect(() => {
        if (typeof window === "undefined") return;
        if ("serviceWorker" in navigator) {
            const url = "/sw.js";
            navigator.serviceWorker.register(url).catch(() => { });
        }
    }, []);
    return null;
}


