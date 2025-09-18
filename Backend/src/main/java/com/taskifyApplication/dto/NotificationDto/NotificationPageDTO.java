package com.taskifyApplication.dto.NotificationDto;

import com.taskifyApplication.model.Notification;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Setter
public class NotificationPageDTO {

    private List<Notification> content;
    private long totalElements;
    private long unreadCount;
    private int page;
    private int totalPages;
    private int size;
    private boolean first;
    private boolean last;
    private boolean empty;

    public NotificationPageDTO(Page<Notification> notificationPage, Long unreadCount) {
        this.content = notificationPage.getContent();
        this.totalElements = notificationPage.getTotalElements();
        this.unreadCount = unreadCount;
        this.page = notificationPage.getNumber();
        this.totalPages = notificationPage.getTotalPages();
        this.size = notificationPage.getSize();
        this.first = notificationPage.isFirst();
        this.last = notificationPage.isLast();
        this.empty = notificationPage.isEmpty();
    }
}