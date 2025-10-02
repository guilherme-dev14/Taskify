package com.taskifyApplication.service;

import com.taskifyApplication.dto.analytics.*;
import com.taskifyApplication.exception.ForbiddenException;
import com.taskifyApplication.exception.ResourceNotFoundException;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {


    private final TaskRepository taskRepository;


    private final UserService userService;


    private final WorkspaceRepository workspaceRepository;


    public ProductivityMetricsDto getProductivityMetrics(Long workspaceId, Long userId, LocalDate startDate, LocalDate endDate) {

        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            throw new ResourceNotFoundException("User not found");
        }
        Long effectiveUserId = userId != null ? userId : currentUser.getId();

        if (!hasWorkspaceAccess(currentUser, workspaceId)) {
            throw  new ForbiddenException("Access denied");
        }
        if (!effectiveUserId.equals(currentUser.getId())) {
            effectiveUserId = currentUser.getId();
        }
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Task> tasks = getFilteredTasks(workspaceId, effectiveUserId, start, end);

        List<Task> completedTasks = tasks.stream()
                .filter(task -> task.getStatus() != null &&
                        (task.getStatus().getName().equalsIgnoreCase("DONE") || task.getStatus().getName().equalsIgnoreCase("COMPLETED")))
                .toList();

        LocalDate today = LocalDate.now();
        long todayCompleted = completedTasks.stream()
                .filter(task -> task.getCompletedAt() != null &&
                        task.getCompletedAt().toLocalDate().equals(today))
                .count();

        int todayTarget = 5;
        int weeklyStreak = calculateWeeklyStreak(effectiveUserId, workspaceId);
        double focusTime = completedTasks.size() * 2.5;
        double efficiency = tasks.isEmpty() ? 0 : (double) completedTasks.size() / tasks.size() * 100;

        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        long weeklyCompleted = completedTasks.stream()
                .filter(task -> task.getCompletedAt() != null &&
                        !task.getCompletedAt().toLocalDate().isBefore(weekStart))
                .count();
        double weeklyGoalProgress = (weeklyCompleted / 20.0) * 100;

        ProductivityMetricsDto.DailyProgressDto dailyProgress =
                new ProductivityMetricsDto.DailyProgressDto((int)todayCompleted, todayTarget,
                        todayCompleted / (double)todayTarget * 100);

        ProductivityMetricsDto.WeeklyStatsDto weeklyStats =
                new ProductivityMetricsDto.WeeklyStatsDto((int)weeklyCompleted, focusTime,
                        2.5, efficiency);

        return new ProductivityMetricsDto((int)todayCompleted, todayTarget, weeklyStreak,
                focusTime, efficiency, weeklyGoalProgress, dailyProgress, weeklyStats);
    }

    public AnalyticsOverviewDto getAnalyticsOverview(Long workspaceId, LocalDate startDate,
                                                     LocalDate endDate) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            throw new ResourceNotFoundException("User not found");
        }
        if (!hasWorkspaceAccess(currentUser, workspaceId)) {
            throw  new ForbiddenException("Access denied");
        }

        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Task> tasks = getFilteredTasks(workspaceId, currentUser.getId(), start, end);

        List<Task> completedTasks = tasks.stream()
                .filter(task -> task.getStatus() != null &&
                        (task.getStatus().getName().equalsIgnoreCase("DONE") || task.getStatus().getName().equalsIgnoreCase("COMPLETED")))
                .toList();

        int totalTasks = tasks.size();
        int completedTasksCount = completedTasks.size();
        int totalTimeSpent = completedTasksCount * 150;

        double averageCompletionTime = completedTasks.stream()
                .filter(task -> task.getCreatedAt() != null && task.getCompletedAt() != null)
                .mapToLong(task -> ChronoUnit.DAYS.between(
                        task.getCreatedAt().toLocalDate(),
                        task.getCompletedAt().toLocalDate()))
                .average()
                .orElse(0.0);

        double productivityScore = totalTasks > 0 ? (double) completedTasksCount / totalTasks * 100 : 0;
        double teamEfficiency = Math.min(95, productivityScore + 5);

        return new AnalyticsOverviewDto(totalTasks, completedTasksCount, totalTimeSpent,
                averageCompletionTime, productivityScore, teamEfficiency);
    }

    public DistributionDataDto getDistributionData(Long workspaceId, LocalDate startDate,
                                                   LocalDate endDate) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            throw new ResourceNotFoundException("User not found");
        }
        if (!hasWorkspaceAccess(currentUser, workspaceId)) {
            throw  new ForbiddenException("Access denied");
        }
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Task> tasks = getFilteredTasks(workspaceId, currentUser.getId(), start, end);

        Map<String, Long> statusCounts = tasks.stream()
                .filter(task -> task.getStatus() != null && task.getStatus().getName() != null)
                .collect(Collectors.groupingBy(task -> task.getStatus().getName(), Collectors.counting()));

        DistributionDataDto.TaskDistribution tasksByStatus = createTaskDistribution(
                Arrays.asList("TO_DO", "IN_PROGRESS", "DONE", "CANCELLED"),
                Arrays.asList("#6B7280", "#3B82F6", "#10B981", "#EF4444"),
                statusCounts
        );

        Map<String, Long> priorityCounts = tasks.stream()
                .filter(task -> task.getPriority() != null)
                .collect(Collectors.groupingBy(task -> task.getPriority().name(), Collectors.counting()));

        DistributionDataDto.TaskDistribution tasksByPriority = createTaskDistribution(
                Arrays.asList("LOW", "MEDIUM", "HIGH", "URGENT"),
                Arrays.asList("#10B981", "#F59E0B", "#EF4444", "#DC2626"),
                priorityCounts
        );

        return new DistributionDataDto(tasksByStatus, tasksByPriority);
    }

    private List<Task> getFilteredTasks(Long workspaceId, Long userId, LocalDate startDate, LocalDate endDate) {
        OffsetDateTime start = startDate.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime end = endDate.atTime(23, 59, 59).atOffset(OffsetDateTime.now().getOffset());

        if (workspaceId != null && userId != null) {
            return taskRepository.findByWorkspaceIdAndAssignedToIdAndCreatedAtBetween(
                    workspaceId, userId, start, end);
        } else if (workspaceId != null) {
            return taskRepository.findByWorkspaceIdAndCreatedAtBetween(workspaceId, start, end);
        } else if (userId != null) {
            return taskRepository.findByAssignedToIdAndCreatedAtBetween(userId, start, end);
        } else {
            throw new ResourceNotFoundException("Workspace ID ou User ID devem ser especificados");
        }
    }

    private int calculateWeeklyStreak(Long userId, Long workspaceId) {
        return 3 + (int)(Math.random() * 5);
    }

    private DistributionDataDto.TaskDistribution createTaskDistribution(
            List<String> statusList, List<String> colors, Map<String, Long> counts) {

        List<String> labels = new ArrayList<>();
        List<Integer> data = new ArrayList<>();
        List<String> resultColors = new ArrayList<>();

        for (int i = 0; i < statusList.size(); i++) {
            String status = statusList.get(i);
            Long count = counts.getOrDefault(status.replace("_", " "), 0L);
            if (count == 0L) {
                count = counts.getOrDefault(status, 0L);
            }

            if (count > 0) {
                labels.add(status.replace("_", " "));
                data.add(count.intValue());
                resultColors.add(colors.get(i));
            }
        }
           counts.forEach((name, count) -> {
            if (!labels.contains(name.replace("_", " "))) {
                labels.add(name);
                data.add(count.intValue());
                resultColors.add("#808080");
            }
        });

        return new DistributionDataDto.TaskDistribution(labels, data, resultColors);
    }
    private boolean hasWorkspaceAccess(User user, Long workspaceId) {
        if (workspaceId == null) return true;

        return workspaceRepository.accessibleForUser(user, workspaceId);
    }

}