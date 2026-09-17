// lib/offline-prompt-builder.ts
// 线下聊天历史构造：把「线下轮次」（ChatOfflineTurn）转成与线上同构的 ChatMessage[]。
// assistant 消息内容用 <content> + 摘要 XML 包裹，与真实线下生成（generateOfflineChatCompletion
// / generateGroupOfflineChatCompletion）完全一致。
// chat-room（真实发送）与提示词查看器（预览）共用本模块，保证「预览 = 即将发出的提示词」。

import type { ChatSession, ChatMessage } from "./chat-storage";
import type { ChatOfflineTurn } from "./chat-offline-storage";

export function formatOfflineTurnXml(turn: ChatOfflineTurn): string {
    if (turn.rawText?.trim()) return turn.rawText.trim();
    const summaryTag = turn.summaryTag?.trim() || "summary";
    // rawText 缺失（旧数据）时重建完整 XML：思维链（thinkingText）存在则按原标签拼回，
    // 保证历史上下文里保留这一轮的思考内容
    const thinkingTag = turn.thinkingTag?.trim() || "thinking";
    const thinkingBlock = turn.thinkingText?.trim()
        ? `<${thinkingTag}>\n${turn.thinkingText.trim()}\n</${thinkingTag}>`
        : "";
    return [
        thinkingBlock,
        "<content>",
        turn.assistantContent,
        "</content>",
        `<${summaryTag}>`,
        turn.summary,
        `</${summaryTag}>`,
    ].filter(Boolean).join("\n");
}

export function buildOfflinePromptHistory(
    session: ChatSession,
    turns: ChatOfflineTurn[],
    pendingUserContent: string,
): ChatMessage[] {
    const history: ChatMessage[] = [];
    for (const turn of turns) {
        const assistantAt = turn.createdAt;
        const userAtMs = new Date(turn.createdAt).getTime() - 1;
        const userAt = Number.isFinite(userAtMs) ? new Date(userAtMs).toISOString() : turn.createdAt;
        if (turn.userContent.trim()) {
            history.push({
                id: `${turn.id}_user`,
                sessionId: session.id,
                role: "user",
                content: turn.userContent,
                status: "sent",
                createdAt: userAt,
            });
        }
        history.push({
            id: `${turn.id}_assistant`,
            sessionId: session.id,
            role: "assistant",
            content: formatOfflineTurnXml(turn),
            status: "sent",
            createdAt: assistantAt,
            ...(session.isGroup ? { senderName: session.groupName || "群聊线下" } : {}),
        });
    }
    const offlineBranchInstruction = "\n\n【线下剧情分支规范】仅在线下剧情中生效：请在正文与摘要输出后，附带 6 个承接当前情境的后续剧情分支选项，采用 details 折叠，选项纯文本严格用 <branch> 标签包裹，格式如下：\n<details>\n<summary>剧情走向（6 条）</summary>\n- <branch>走向描述 1</branch>\n- <branch>走向描述 2</branch>\n- <branch>走向描述 3</branch>\n- <branch>走向描述 4</branch>\n- <branch>走向描述 5</branch>\n- <branch>走向描述 6</branch>\n</details>";

    if (pendingUserContent.trim()) {
        history.push({
            id: `offline_pending_${Date.now()}`,
            sessionId: session.id,
            role: "user",
            content: pendingUserContent.trim() + offlineBranchInstruction,
            status: "sent",
            createdAt: new Date().toISOString(),
        });
    }
    return history;
}
