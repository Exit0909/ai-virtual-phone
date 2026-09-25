// components/music/together-modal.tsx — 一起听邀请弹窗（图一还原）与聊天卡片
"use client";

import { useState } from "react";
import type { MusicTrack } from "@/lib/music-storage";

export type TogetherInvitePayload = {
    track: MusicTrack;
    characterId: string;
    characterName: string;
    note?: string;
};

export function TogetherInviteModal({
    characterName,
    track,
    onSend,
    onClose,
}: {
    characterName: string;
    track: MusicTrack | null;
    onSend: (payload: { track: MusicTrack; note: string }) => void;
    onClose: () => void;
}) {
    const [note, setNote] = useState("");

    const currentTrack = track || {
        id: "default-together-song",
        title: "和光溯行",
        artist: "鸣潮先约电台 / lzq",
        coverUrl: "https://p2.music.126.net/6y-5GeEc2AfPhcqNYt0QKA==/109951165434199182.jpg",
    };

    return (
        <div className="together-modal-overlay" onClick={onClose}>
            <div className="together-modal-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="together-modal-handle" />
                
                <div className="together-modal-header">
                    <span className="together-modal-badge">LISTEN TOGETHER</span>
                    <h3 className="together-modal-title">邀请 {characterName} 一起听</h3>
                </div>

                <div className="together-track-card">
                    <div className="together-track-cover-wrap">
                        {currentTrack.coverUrl ? (
                            <img src={currentTrack.coverUrl} alt="" className="together-track-cover" />
                        ) : (
                            <div className="together-track-cover together-track-cover-fallback">
                                🎵
                            </div>
                        )}
                    </div>
                    <div className="together-track-info">
                        <span className="together-track-label">一起听曲目</span>
                        <div className="together-track-title">{currentTrack.title}</div>
                        <div className="together-track-artist">{currentTrack.artist || "未知歌手"}</div>
                    </div>
                    <div className="together-wave-anim">
                        <span className="tw-bar" style={{ animationDelay: "0s" }} />
                        <span className="tw-bar" style={{ animationDelay: "0.2s" }} />
                        <span className="tw-bar" style={{ animationDelay: "0.4s" }} />
                        <span className="tw-bar" style={{ animationDelay: "0.1s" }} />
                        <span className="tw-bar" style={{ animationDelay: "0.3s" }} />
                    </div>
                </div>

                <div className="together-status-pill">
                    <span>等待加入</span>
                </div>

                <div className="together-mini-progress">
                    <div className="together-mini-bar">
                        <div className="together-mini-fill" />
                    </div>
                    <div className="together-mini-labels">
                        <span>0:00</span>
                        <span className="together-mini-center">一起听</span>
                        <span>3:40</span>
                    </div>
                </div>

                <div className="together-note-section">
                    <label className="together-note-label">邀请备注（可选）</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="例如：这首想和你一起听"
                        className="together-note-input"
                        maxLength={40}
                    />
                </div>

                <div className="together-modal-actions">
                    <button type="button" onClick={onClose} className="together-btn together-btn-cancel">
                        取消
                    </button>
                    <button
                        type="button"
                        onClick={() => onSend({ track: currentTrack, note: note.trim() })}
                        className="together-btn together-btn-submit"
                    >
                        发送邀请
                    </button>
                </div>
            </div>
        </div>
    );
}
