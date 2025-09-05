package com.taskifyApplication.service;

import com.taskifyApplication.dto.analytics.*;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.UserRepository;
import com.taskifyApplication.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    public ProductivityMetricsDto getProductivityMetrics(Long workspaceId, Long userId, 
                                                        LocalDate startDate, LocalDate endDate, String period) {
        
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        // Get tasks based on filters
        List<Task> tasks = getFilteredTasks(workspaceId, userId, start, end);
        List<Task> completedTasks = tasks.stream()
                .filter(task -> task.getStatus() != null && 
                       (task.getStatus().name().equals("DONE") || task.getStatus().name().equals("COMPLETED")))
                .collect(Collectors.toList());

        // Calculate today's metrics
        LocalDate today = LocalDate.now();
        long todayCompleted = completedTasks.stream()
                .filter(task -> task.getCompletedAt() != null && 
                       task.getCompletedAt().toLocalDate().equals(today))
                .count();

        int todayTarget = 5; // Default target, could be configurable per user
        
        // Calculate weekly streak
        int weeklyStreak = calculateWeeklyStreak(userId, workspaceId);
        
        // Calculate focus time (mock data for now)
        double focusTime = completedTasks.size() * 2.5; // Average 2.5 hours per completed task
        
        // Calculate efficiency
        double efficiency = tasks.isEmpty() ? 0 : (double) completedTasks.size() / tasks.size() * 100;
        
        // Calculate weekly goal progress
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        long weeklyCompleted = completedTasks.stream()
                .filter(task -> task.getCompletedAt() != null && 
                       !task.getCompletedAt().toLocalDate().isBefore(weekStart))
                .count();
        double weeklyGoalProgress = (weeklyCompleted / 20.0) * 100; // 20 tasks per week target

        // Create DTOs
        ProductivityMetricsDto.DailyProgressDto dailyProgress = 
                new ProductivityMetricsDto.DailyProgressDto((int)todayCompleted, todayTarget, 
                        todayTarget > 0 ? (todayCompleted / (double)todayTarget) * 100 : 0);

        ProductivityMetricsDto.WeeklyStatsDto weeklyStats = 
                new ProductivityMetricsDto.WeeklyStatsDto((int)weeklyCompleted, focusTime, 
                        2.5, efficiency);

        return new ProductivityMetricsDto((int)todayCompleted, todayTarget, weeklyStreak, 
                focusTime, efficiency, weeklyGoalProgress, dailyProgress, weeklyStats);
    }

    public AnalyticsOverviewDto getAnalyticsOverview(Long workspaceId, Long userId, LocalDate startDate, 
                                                    LocalDate endDate, String period) {
        
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Task> tasks = getFilteredTasks(workspaceId, userId, start, end);
        List<Task> completedTasks = tasks.stream()
                .filter(task -> task.getStatus() != null && 
                       (task.getStatus().name().equals("DONE") || task.getStatus().name().equals("COMPLETED")))
                .collect(Collectors.toList());

        int totalTasks = tasks.size();
        int completedTasksCount = completedTasks.size();
        
        // Mock time spent calculation (in minutes)
        int totalTimeSpent = completedTasksCount * 150; // 2.5 hours per task average
        
        // Calculate average completion time
        double averageCompletionTime = completedTasks.stream()
                .filter(task -> task.getCreatedAt() != null && task.getCompletedAt() != null)
                .mapToLong(task -> ChronoUnit.DAYS.between(
                        task.getCreatedAt().toLocalDate(), 
                        task.getCompletedAt().toLocalDate()))
                .average()
                .orElse(0.0);

        double productivityScore = totalTasks > 0 ? (double) completedTasksCount / totalTasks * 100 : 0;
        double teamEfficiency = Math.min(95, productivityScore + 5); // Mock team efficiency

        return new AnalyticsOverviewDto(totalTasks, completedTasksCount, totalTimeSpent, 
                averageCompletionTime, productivityScore, teamEfficiency);
    }

    public AnalyticsTrendsDto getAnalyticsTrends(Long workspaceId, Long userId, 
                                                LocalDate startDate, LocalDate endDate, String period) {
        
        // Generate trend data based on period
        List<String> labels = generatePeriodLabels(period);
        List<Integer> taskCompletion = generateTrendData(labels.size(), 60, 95);
        List<Integer> timeSpent = generateTrendData(labels.size(), 100, 200);
        List<Integer> productivity = generateTrendData(labels.size(), 70, 98);

        return new AnalyticsTrendsDto(taskCompletion, timeSpent, productivity, labels);
    }

    public DistributionDataDto getDistributionData(Long workspaceId, Long userId, LocalDate startDate, 
                                                  LocalDate endDate, String period) {
        
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<Task> tasks = getFilteredTasks(workspaceId, userId, start, end);

        // Tasks by status
        Map<String, Long> statusCounts = tasks.stream()
                .collect(Collectors.groupingBy(task -> task.getStatus().name(), Collectors.counting()));
        
        DistributionDataDto.TaskDistribution tasksByStatus = createTaskDistribution(
                Arrays.asList("TO_DO", "IN_PROGRESS", "DONE", "CANCELLED"),
                Arrays.asList("#6B7280", "#3B82F6", "#10B981", "#EF4444"),
                statusCounts
        );

        // Tasks by priority
        Map<String, Long> priorityCounts = tasks.stream()
                .collect(Collectors.groupingBy(task -> task.getPriority().name(), Collectors.counting()));
        
        DistributionDataDto.TaskDistribution tasksByPriority = createTaskDistribution(
                Arrays.asList("LOW", "MEDIUM", "HIGH", "URGENT"),
                Arrays.asList("#10B981", "#F59E0B", "#EF4444", "#DC2626"),
                priorityCounts
        );

        return new DistributionDataDto(tasksByStatus, tasksByPriority);
    }

    public TeamAnalyticsDto getTeamAnalytics(Long workspaceId, Long userId, LocalDate startDate, 
                                           LocalDate endDate, String period) {

        List<TeamAnalyticsDto.TeamMemberAnalytics> members = Arrays.asList(
                new TeamAnalyticsDto.TeamMemberAnalytics(1L, "John Doe", null, 42, 280, 94, 3, 2.5),
                new TeamAnalyticsDto.TeamMemberAnalytics(2L, "Jane Smith", null, 38, 265, 91, 4, 2.8),
                new TeamAnalyticsDto.TeamMemberAnalytics(3L, "Mike Johnson", null, 35, 245, 89, 2, 2.2)
        );

        TeamAnalyticsDto.TeamStats teamStats = new TeamAnalyticsDto.TeamStats(5, 3, 91.3, 115, 790);

        return new TeamAnalyticsDto(members, teamStats);
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
            // Quando não especificar workspace nem usuário, devemos usar apenas dados do usuário atual
            // Este caso não deveria acontecer com as validações do controller, mas por segurança:
            throw new IllegalArgumentException("Workspace ID ou User ID devem ser especificados");
        }
    }

    private int calculateWeeklyStreak(Long userId, Long workspaceId) {
        // Mock calculation - in real implementation, track consecutive productive weeks
        return 3 + (int)(Math.random() * 5);
    }

    private List<String> generatePeriodLabels(String period) {
        switch (period.toLowerCase()) {
            case "week":
                return Arrays.asList("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
            case "quarter":
                return Arrays.asList("Q1", "Q2", "Q3", "Q4");
            case "year":
                return Arrays.asList("2020", "2021", "2022", "2023", "2024");
            default: // month
                return Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
        }
    }

    private List<Integer> generateTrendData(int size, int min, int max) {
        List<Integer> data = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            data.add(min + (int)(Math.random() * (max - min)));
        }
        return data;
    }

    private DistributionDataDto.TaskDistribution createTaskDistribution(
            List<String> statusList, List<String> colors, Map<String, Long> counts) {
        
        List<String> labels = new ArrayList<>();
        List<Integer> data = new ArrayList<>();
        List<String> resultColors = new ArrayList<>();

        for (int i = 0; i < statusList.size(); i++) {
            String status = statusList.get(i);
            Long count = counts.getOrDefault(status, 0L);
            if (count > 0) {
                labels.add(status.replace("_", " "));
                data.add(count.intValue());
                resultColors.add(colors.get(i));
            }
        }

        return new DistributionDataDto.TaskDistribution(labels, data, resultColors);
    }
}