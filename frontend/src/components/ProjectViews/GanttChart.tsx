import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Task } from '../../stores/task.store';
import { useTasks } from '../../hooks/useTasks';

interface GanttChartProps {
  workspaceId: number;
  onTaskClick?: (task: Task) => void;
}

interface GanttTask extends Task {
  startDate: Date;
  endDate: Date;
  dependencies: Task[];
}

const GanttChart: React.FC<GanttChartProps> = ({ workspaceId, onTaskClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data: tasks, isLoading } = useTasks({ workspaceId });

  const ganttData = useMemo(() => {
    if (!tasks) return [];

    return tasks.map((task): GanttTask => {
      const startDate = new Date(task.createdAt);
      const endDate = task.dueDate ? new Date(task.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      return {
        ...task,
        startDate,
        endDate,
        dependencies: task.dependencies.map(dep => 
          tasks.find(t => t.id === dep.dependsOnTask.id)
        ).filter(Boolean) as Task[],
      };
    });
  }, [tasks]);

  useEffect(() => {
    if (!ganttData.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 50, right: 50, bottom: 50, left: 200 };
    const width = 1200 - margin.left - margin.right;
    const height = Math.max(400, ganttData.length * 40) - margin.top - margin.bottom;

    // Set SVG dimensions
    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
                 .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(ganttData.flatMap(d => [d.startDate, d.endDate])) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(ganttData.map(d => d.title))
      .range([0, height])
      .padding(0.1);

    // Color scales
    const statusColorScale = d3.scaleOrdinal<string>()
      .domain(['NEW', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'])
      .range(['#6B7280', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444']);

    const priorityColorScale = d3.scaleOrdinal<string>()
      .domain(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
      .range(['#10B981', '#F59E0B', '#EF4444', '#DC2626']);

    // Create grid lines
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%m/%d') as any);

    const yAxis = d3.axisLeft(yScale)
      .tickSize(0);

    // Add grid
    g.append('g')
     .attr('class', 'grid')
     .attr('transform', `translate(0, ${height})`)
     .call(d3.axisBottom(xScale)
       .tickSize(-height)
       .tickFormat('' as any))
     .selectAll('line')
     .style('stroke', '#e5e7eb')
     .style('stroke-width', 1)
     .style('opacity', 0.5);

    // Add axes
    g.append('g')
     .attr('transform', `translate(0, ${height})`)
     .call(xAxis)
     .selectAll('text')
     .style('font-size', '12px')
     .style('fill', '#6B7280');

    g.append('g')
     .call(yAxis)
     .selectAll('text')
     .style('font-size', '12px')
     .style('fill', '#6B7280')
     .style('cursor', 'pointer');

    // Task bars
    const taskGroups = g.selectAll('.task-group')
      .data(ganttData)
      .enter()
      .append('g')
      .attr('class', 'task-group')
      .attr('transform', d => `translate(0, ${yScale(d.title)})`);

    // Main task bars
    taskGroups.append('rect')
      .attr('class', 'task-bar')
      .attr('x', d => xScale(d.startDate))
      .attr('width', d => Math.max(4, xScale(d.endDate) - xScale(d.startDate)))
      .attr('height', yScale.bandwidth() - 4)
      .attr('y', 2)
      .attr('rx', 4)
      .style('fill', d => statusColorScale(d.status))
      .style('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        onTaskClick?.(d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 1);
        
        // Tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'gantt-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', 1000)
          .html(`
            <strong>${d.title}</strong><br>
            Status: ${d.status}<br>
            Priority: ${d.priority}<br>
            Progress: ${d.progress}%<br>
            Duration: ${Math.ceil((d.endDate.getTime() - d.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
          `);

        const [mouseX, mouseY] = d3.pointer(event, document.body);
        tooltip.style('left', (mouseX + 10) + 'px')
               .style('top', (mouseY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this).style('opacity', 0.8);
        d3.selectAll('.gantt-tooltip').remove();
      });

    // Progress bars
    taskGroups.append('rect')
      .attr('class', 'progress-bar')
      .attr('x', d => xScale(d.startDate))
      .attr('width', d => {
        const totalWidth = Math.max(4, xScale(d.endDate) - xScale(d.startDate));
        return totalWidth * (d.progress / 100);
      })
      .attr('height', yScale.bandwidth() - 4)
      .attr('y', 2)
      .attr('rx', 4)
      .style('fill', d => d3.color(statusColorScale(d.status))?.darker(0.3) || '#000')
      .style('opacity', 0.9);

    // Priority indicators
    taskGroups.append('rect')
      .attr('class', 'priority-indicator')
      .attr('x', d => xScale(d.startDate) - 6)
      .attr('width', 4)
      .attr('height', yScale.bandwidth() - 4)
      .attr('y', 2)
      .attr('rx', 2)
      .style('fill', d => priorityColorScale(d.priority));

    // Task labels with icons
    taskGroups.append('text')
      .attr('class', 'task-label')
      .attr('x', d => Math.max(8, xScale(d.startDate) + 8))
      .attr('y', yScale.bandwidth() / 2 + 4)
      .text(d => {
        const maxWidth = Math.max(4, xScale(d.endDate) - xScale(d.startDate));
        if (maxWidth < 100) return ''; // Hide text if bar is too small
        return d.title.length > 20 ? d.title.substring(0, 20) + '...' : d.title;
      })
      .style('font-size', '11px')
      .style('fill', 'white')
      .style('font-weight', '500')
      .style('pointer-events', 'none');

    // Dependencies (arrows)
    const dependencies = ganttData.filter(task => task.dependencies.length > 0);
    
    dependencies.forEach(task => {
      task.dependencies.forEach(dep => {
        const depTask = ganttData.find(t => t.id === dep.id);
        if (!depTask) return;

        const startY = yScale(depTask.title)! + yScale.bandwidth() / 2;
        const endY = yScale(task.title)! + yScale.bandwidth() / 2;
        const startX = xScale(depTask.endDate);
        const endX = xScale(task.startDate);

        // Dependency line
        g.append('path')
         .attr('d', `M ${startX} ${startY} L ${endX - 20} ${startY} L ${endX - 20} ${endY} L ${endX - 8} ${endY}`)
         .style('stroke', '#6B7280')
         .style('stroke-width', 2)
         .style('fill', 'none')
         .style('stroke-dasharray', '4,4')
         .style('opacity', 0.7);

        // Arrow head
        g.append('polygon')
         .attr('points', `${endX - 8},${endY - 4} ${endX - 8},${endY + 4} ${endX},${endY}`)
         .style('fill', '#6B7280')
         .style('opacity', 0.7);
      });
    });

    // Today line
    const today = new Date();
    if (today >= xScale.domain()[0] && today <= xScale.domain()[1]) {
      g.append('line')
       .attr('x1', xScale(today))
       .attr('x2', xScale(today))
       .attr('y1', 0)
       .attr('y2', height)
       .style('stroke', '#EF4444')
       .style('stroke-width', 2)
       .style('opacity', 0.8)
       .style('stroke-dasharray', '3,3');

      g.append('text')
       .attr('x', xScale(today) + 5)
       .attr('y', -10)
       .text('Today')
       .style('font-size', '12px')
       .style('fill', '#EF4444')
       .style('font-weight', '600');
    }

  }, [ganttData, onTaskClick]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Gantt Chart
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize task timelines, dependencies, and project progress
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          {[
            { status: 'NEW', color: '#6B7280', label: 'To Do' },
            { status: 'IN_PROGRESS', color: '#3B82F6', label: 'In Progress' },
            { status: 'REVIEW', color: '#8B5CF6', label: 'Review' },
            { status: 'DONE', color: '#10B981', label: 'Done' },
          ].map(({ status, color, label }) => (
            <div key={status} className="flex items-center space-x-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</span>
          {[
            { priority: 'LOW', color: '#10B981', label: 'Low' },
            { priority: 'MEDIUM', color: '#F59E0B', label: 'Medium' },
            { priority: 'HIGH', color: '#EF4444', label: 'High' },
            { priority: 'URGENT', color: '#DC2626', label: 'Urgent' },
          ].map(({ priority, color, label }) => (
            <div key={priority} className="flex items-center space-x-1">
              <div
                className="w-1 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 overflow-auto">
        {ganttData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium">No tasks to display</p>
              <p className="mt-2">Create some tasks to see your project timeline</p>
            </div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full" />
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Zoom to Fit
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
            Export PNG
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>View:</span>
          <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800">
            <option>Days</option>
            <option>Weeks</option>
            <option>Months</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default GanttChart;