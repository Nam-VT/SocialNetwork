// src/services/websocketService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const VITE_CHAT_SERVICE_URL = import.meta.env.VITE_CHAT_SERVICE_URL;
let stompClient = null;
const subscriptions = new Map();

export const websocketService = {
    connect: (onConnected, onError) => {
        const token = localStorage.getItem('token');
        if (!token || (stompClient && stompClient.connected)) return;

        stompClient = new Client({
            webSocketFactory: () => new SockJS(`${VITE_CHAT_SERVICE_URL}/ws`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: onConnected,
            onStompError: onError,
        });
        stompClient.activate();
    },

    subscribeToNotifications: (userId, onNotificationReceived) => {
        const topic = `/user/${userId}/queue/notifications`;
        if (stompClient && stompClient.connected) {
            const subscription = stompClient.subscribe(topic, (message) => {
                onNotificationReceived(JSON.parse(message.body));
            });
            subscriptions.set(topic, subscription);
            return subscription;
        }
    },

    disconnect: () => {
        if (stompClient) {
            stompClient.deactivate();
            subscriptions.clear();
        }
    }
};