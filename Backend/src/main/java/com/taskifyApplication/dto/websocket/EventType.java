package com.taskifyApplication.dto.websocket;

public enum EventType {
    TASK_CREATED,
    TASK_UPDATED,
    TASK_DELETED,

    USER_JOINED,
    USER_LEFT,

    CURSOR_POSITION_UPDATE,
    USER_TYPING_UPDATE
}
