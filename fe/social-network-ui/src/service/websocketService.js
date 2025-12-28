// src/services/websocketService.js

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const VITE_CHAT_SERVICE_URL = import.meta.env.VITE_CHAT_SERVICE_URL;
let stompClient = null;
const subscriptions = new Map();

const connect = (onConnectedCallback, onErrorCallback) => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("No token found for WebSocket connection.");
        if (onErrorCallback) onErrorCallback("Authentication token is missing.");
        return;
    }
    
    if (stompClient && stompClient.connected) {
        if (onConnectedCallback) onConnectedCallback();
        return;
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS(`${VITE_CHAT_SERVICE_URL}/ws`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: onConnectedCallback,
        onStompError: onErrorCallback,
    });

    stompClient.activate();
};

const disconnect = () => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
        subscriptions.clear();
        console.log("WebSocket Disconnected");
    }
};

const subscribeToChatRoom = (chatRoomId, onMessageReceived) => {
    if (stompClient && stompClient.connected && !subscriptions.has(chatRoomId)) {
        const subscription = stompClient.subscribe(`/topic/chats/${chatRoomId}`, (message) => {
            onMessageReceived(JSON.parse(message.body));
        });
        subscriptions.set(chatRoomId, subscription);
    }
};

const unsubscribeFromChatRoom = (chatRoomId) => {
    if (subscriptions.has(chatRoomId)) {
        subscriptions.get(chatRoomId).unsubscribe();
        subscriptions.delete(chatRoomId);
    }
};

const sendMessage = (chatRoomId, messageRequest) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: `/chat/${chatRoomId}`,
            body: JSON.stringify(messageRequest),
        });
    }
};

const subscribeToNotifications = (userId, onNotificationReceived) => {
    const topic = `/user/${userId}/queue/notifications`;
    if (stompClient && stompClient.connected && !subscriptions.has(topic)) {
        const subscription = stompClient.subscribe(topic, (message) => {
            onNotificationReceived(JSON.parse(message.body));
        });
        subscriptions.set(topic, subscription);
        return subscription;
    }
};

const unsubscribeFromNotifications = (userId) => {
    const topic = `/user/${userId}/queue/notifications`;
    if (subscriptions.has(topic)) {
        subscriptions.get(topic).unsubscribe();
        subscriptions.delete(topic);
    }
};

export const websocketService = {
    connect,
    disconnect,
    subscribeToChatRoom,
    unsubscribeFromChatRoom,
    sendMessage,
    subscribeToNotifications,
    unsubscribeFromNotifications,
};