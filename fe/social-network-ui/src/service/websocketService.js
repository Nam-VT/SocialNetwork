// src/services/websocketService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const VITE_CHAT_SERVICE_URL = import.meta.env.VITE_CHAT_SERVICE_URL;
let stompClient = null;
const subscriptions = new Map();
const pendingSubscriptions = []; // Queue for subscriptions when not connected
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_BASE_DELAY = 1000; // 1 second

export const websocketService = {
    connect: (token, onConnected, onError) => {
        // Prevent concurrent connection attempts
        if (stompClient && (stompClient.connected || stompClient.active)) {
            console.log("WebSocket is already connected or connecting. Skipping new connection.");
            return;
        }

        if (!token) {
            console.error("WebSocket connection aborted: No token provided");
            return;
        }

        console.log("Connecting to WebSocket at:", `${VITE_CHAT_SERVICE_URL}/ws-chat`);
        console.log("Using Token:", token.substring(0, 10) + "...");

        stompClient = new Client({
            webSocketFactory: () => new SockJS(`${VITE_CHAT_SERVICE_URL}/ws-chat`),
            connectHeaders: { Authorization: `Bearer ${token}` },

            // Heartbeat configuration - detect stale connections
            heartbeatIncoming: 10000, // Expect heartbeat from server every 10s
            heartbeatOutgoing: 10000, // Send heartbeat to server every 10s

            // Reconnection configuration
            reconnectDelay: () => {
                const delay = Math.min(
                    RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts),
                    30000 // Max 30 seconds
                );
                reconnectAttempts++;
                console.log(`WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
                return delay;
            },

            onConnect: (frame) => {
                console.log("WebSocket Connected Success:", frame);
                reconnectAttempts = 0; // Reset on successful connection

                // Process pending subscriptions
                while (pendingSubscriptions.length > 0) {
                    const pending = pendingSubscriptions.shift();
                    console.log("Processing pending subscription:", pending.topic);
                    pending.subscribe();
                }

                if (onConnected) onConnected(frame);
            },

            onStompError: (error) => {
                console.error("WebSocket STOMP Error:", error);
                if (onError) onError(error);
            },

            onWebSocketError: (event) => {
                console.error("WebSocket Connection Error:", event);
            },

            onWebSocketClose: (event) => {
                console.log("WebSocket connection closed:", event);
                // STOMP.js will handle reconnection automatically with reconnectDelay
            },

            onDisconnect: () => {
                console.log("WebSocket disconnected");
            }
        });

        stompClient.activate();
    },

    isConnected: () => {
        return stompClient && stompClient.connected;
    },

    subscribeToNotifications: (userId, onNotificationReceived) => {
        const topic = `/topic/notifications/${userId}`;

        const doSubscribe = () => {
            if (stompClient && stompClient.connected) {
                const subscription = stompClient.subscribe(topic, (message) => {
                    onNotificationReceived(JSON.parse(message.body));
                });
                subscriptions.set(topic, subscription);
                return subscription;
            }
            return null;
        };

        if (stompClient && stompClient.connected) {
            return doSubscribe();
        } else {
            console.log("WebSocket not connected, queueing notification subscription");
            pendingSubscriptions.push({ topic, subscribe: doSubscribe });
        }
    },

    subscribeToChatRoom: (chatRoomId, onMessageReceived) => {
        const topic = `/topic/chats/${chatRoomId}`;

        // Check if already subscribed to this topic
        if (subscriptions.has(topic)) {
            console.log("Already subscribed to chat room:", topic);
            return subscriptions.get(topic);
        }

        const doSubscribe = () => {
            // Double-check to avoid race conditions
            if (subscriptions.has(topic)) {
                console.log("Already subscribed (from pending):", topic);
                return subscriptions.get(topic);
            }

            if (stompClient && stompClient.connected) {
                console.log("Subscribing to chat room:", topic);
                const subscription = stompClient.subscribe(topic, (message) => {
                    onMessageReceived(JSON.parse(message.body));
                });
                subscriptions.set(topic, subscription);
                return subscription;
            }
            return null;
        };

        if (stompClient && stompClient.connected) {
            return doSubscribe();
        } else {
            // Check if already in pending queue
            const alreadyPending = pendingSubscriptions.some(p => p.topic === topic);
            if (!alreadyPending) {
                console.log("WebSocket not connected, queueing chat room subscription for:", chatRoomId);
                pendingSubscriptions.push({ topic, subscribe: doSubscribe });
            }
            return null;
        }
    },

    unsubscribeFromChatRoom: (chatRoomId) => {
        const topic = `/topic/chats/${chatRoomId}`;
        const subscription = subscriptions.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            subscriptions.delete(topic);
            console.log("Unsubscribed from chat room:", topic);
        }

        // Also remove from pending if not yet subscribed
        const pendingIndex = pendingSubscriptions.findIndex(p => p.topic === topic);
        if (pendingIndex !== -1) {
            pendingSubscriptions.splice(pendingIndex, 1);
        }
    },

    sendMessage: (chatRoomId, messageContent) => {
        if (stompClient && stompClient.connected) {
            console.log("Sending message to room", chatRoomId, messageContent);
            stompClient.publish({
                destination: `/app/chat/${chatRoomId}`,
                body: JSON.stringify(messageContent)
            });
        } else {
            console.error("Cannot send message: STOMP client not connected. Attempting reconnect...");
            // Optionally trigger reconnection
            if (stompClient && !stompClient.active) {
                stompClient.activate();
            }
        }
    },

    disconnect: () => {
        if (stompClient) {
            console.log("Disconnecting WebSocket...");
            stompClient.deactivate();
            subscriptions.clear();
            pendingSubscriptions.length = 0;
            reconnectAttempts = 0;
        }
    }
};