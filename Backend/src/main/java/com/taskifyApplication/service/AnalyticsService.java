package com.taskifyApplication.service;

import com.taskifyApplication.dto.analytics.*;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.repository.TaskRepository;
import com.taskifyApplication.repository.UserRepository;
import com.taskifyApplication.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

        List<Task> tasks = getFilteredTasks(workspaceId, userId, start, end);

        // CORREÇÃO: Adicionado filtro para tarefas com status não nulo e com nomes de conclusão.
        List<Task> completedTasks = tasks.stream()
                .filter(task -> task.getStatus() != null &&
                        (task.getStatus().getName().equalsIgnoreCase("DONE") || task.getStatus().getName().equalsIgnoreCase("COMPLETED")))
                .collect(Collectors.toList());

        LocalDate today = LocalDate.now();
        long todayCompleted = completedTasks.stream()
                .filter(task -> task.getCompletedAt() != null &&
                        task.getCompletedAt().toLocalDate().equals(today))
                .count();

        int todayTarget = 5;
        int weeklyStreak = calculateWeeklyStreak(userId, workspaceId);
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

        // CORREÇÃO: Adicionado filtro para tarefas com status não nulo e com nomes de conclusão.
        List<Task> completedTasks = tasks.stream()
                .filter(task -> task.getStatus() != null &&
                        (task.getStatus().getName().equalsIgnoreCase("DONE") || task.getStatus().getName().equalsIgnoreCase("COMPLETED")))
                .collect(Collectors.toList());

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

    public AnalyticsTrendsDto getAnalyticsTrends(Long workspaceId, Long userId,
                                                 LocalDate startDate, LocalDate endDate, String period) {

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

        // CORREÇÃO: Adicionado filtro para ignorar tarefas com status nulo antes de agrupar.
        Map<String, Long> statusCounts = tasks.stream()
                .filter(task -> task.getStatus() != null && task.getStatus().getName() != null)
                .collect(Collectors.groupingBy(task -> task.getStatus().getName(), Collectors.counting()));

        DistributionDataDto.TaskDistribution tasksByStatus = createTaskDistribution(
                Arrays.asList("TO_DO", "IN_PROGRESS", "DONE", "CANCELLED"), // Estes labels são para referência de cor
                Arrays.asList("#6B7280", "#3B82F6", "#10B981", "#EF4444"),
                statusCounts
        );

        // CORREÇÃO: Adicionado filtro para ignorar tarefas com prioridade nula.
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
            throw new IllegalArgumentException("Workspace ID ou User ID devem ser especificados");
        }
    }

    private int calculateWeeklyStreak(Long userId, Long workspaceId) {
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
            default:
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
            // CORREÇÃO: O mapa `counts` agora tem nomes completos, não enums.
            Long count = counts.getOrDefault(status.replace("_", " "), 0L);
            if (count == 0L) { // Tenta também com o nome do enum para compatibilidade
                count = counts.getOrDefault(status, 0L);
            }

            if (count > 0) {
                labels.add(status.replace("_", " "));
                data.add(count.intValue());
                resultColors.add(colors.get(i));
            }
        }

        // Adiciona outros status que possam existir e não estão na lista padrão
        counts.forEach((name, count) -> {
            if (!labels.contains(name.replace("_", " "))) {
                labels.add(name);
                data.add(count.intValue());
                resultColors.add("#808080"); // Cor padrão para status desconhecidos
            }
        });

        return new DistributionDataDto.TaskDistribution(labels, data, resultColors);
    }
}