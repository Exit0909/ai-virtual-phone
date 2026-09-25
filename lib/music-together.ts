// lib/music-together.ts — 一起听（Link FM）全局状态、角色管理与事件联动
"use client";

import { kvGet, kvSet, registerKvMigration } from "./kv-db";

export type TogetherSession = {
    active: boolean;
    characterId: string;
    characterName: string;
    characterAvatar?: string;
    userAvatar?: string;
    userName?: string;
    songTitle?: string;
    songArtist?: string;
    songCover?: string;
    note?: string;
    joinedAt?: number;
    reactionText?: string;
};

const TOGETHER_STORAGE_KEY = "ai_phone_music_together_session_v1";
registerKvMigration(TOGETHER_STORAGE_KEY);

export const TOGETHER_STATE_CHANGE_EVENT = "ai-phone-music-together-changed";

export function loadTogetherSession(): TogetherSession | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = kvGet(TOGETHER_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as TogetherSession;
    } catch {
        return null;
    }
}

export function saveTogetherSession(session: TogetherSession | null): void {
    if (typeof window === "undefined") return;
    try {
        if (!session) {
            kvSet(TOGETHER_STORAGE_KEY, "");
        } else {
            kvSet(TOGETHER_STORAGE_KEY, JSON.stringify(session));
        }
        window.dispatchEvent(new CustomEvent(TOGETHER_STATE_CHANGE_EVENT, { detail: session }));
    } catch {
        // ignore
    }
}

export function stopTogetherSession(): void {
    saveTogetherSession(null);
}
