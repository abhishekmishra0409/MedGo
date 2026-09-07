import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
    wsMessageReceived,
    wsConversationsUpdated,
    wsMessagesRead,
    wsTypingIndicator,
} from "../features/Messages/MessageSlice.js";
import { base_url } from "../utils/api.js";

const buildWsUrl = (tokenKey) => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return null;

    const httpUrl = new URL(base_url);
    const wsProtocol = httpUrl.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${httpUrl.host}?token=${encodeURIComponent(token)}`;
};

// Scoped to the Messages page's mount lifecycle rather than an app-level
// singleton: no other page currently consumes live message events, so
// connecting only while Messages is open avoids an always-on socket for
// users who never visit it.
export default function useMessagingSocket(userType) {
    const dispatch = useDispatch();
    const wsRef = useRef(null);

    useEffect(() => {
        const tokenKey = userType === "doctor" ? "doctorToken" : "userToken";
        let cancelled = false;
        let reconnectTimer = null;
        let reconnectAttempt = 0;

        const connect = () => {
            const url = buildWsUrl(tokenKey);
            if (!url || cancelled) return;

            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                reconnectAttempt = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const { event: type, data } = JSON.parse(event.data);
                    switch (type) {
                        case "NEW_MESSAGE":
                            dispatch(wsMessageReceived(data));
                            break;
                        case "UPDATE_CONVERSATIONS":
                            dispatch(wsConversationsUpdated(data));
                            break;
                        case "MESSAGES_READ":
                            dispatch(wsMessagesRead(data));
                            break;
                        case "TYPING_INDICATOR":
                            dispatch(wsTypingIndicator(data));
                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    console.error("Failed to parse WS message:", error);
                }
            };

            ws.onclose = (event) => {
                wsRef.current = null;
                // 1008 = server-rejected token; retrying won't help until re-auth.
                if (cancelled || event.code === 1008) return;

                const delay = Math.min(30000, 1000 * 2 ** reconnectAttempt);
                reconnectAttempt += 1;
                reconnectTimer = setTimeout(connect, delay);
            };

            ws.onerror = () => {
                ws.close();
            };
        };

        connect();

        return () => {
            cancelled = true;
            if (reconnectTimer) clearTimeout(reconnectTimer);
            wsRef.current?.close();
            wsRef.current = null;
        };
    }, [dispatch, userType]);

    const sendTyping = (conversationId, isTyping) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                action: "TYPING_STATUS",
                payload: { conversationId, isTyping },
            }));
        }
    };

    return { sendTyping };
}
