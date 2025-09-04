import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import {
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { Task } from "../../stores/task.store";
import { useTasks } from "../../hooks/useTasks";
import type { ITask } from "../../types/task.types";

interface DependencyNode extends Task {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface DependencyLink {
  source: string | DependencyNode;
  target: string | DependencyNode;
  id: string;
}

interface DependencyGraphProps {
  workspaceId: number;
  selectedTaskId?: number;
  onTaskSelect?: (task: Task) => void;
  onAddDependency?: (taskId: number, dependsOnId: number) => void;
  onRemoveDependency?: (dependencyId: number) => void;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({
  workspaceId,
  selectedTaskId,
  onTaskSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(1);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(
    new Set()
  );

  const { data: tasks, isLoading } = useTasks({ workspaceId });

  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];

    return tasks.filter(
      (task: ITask) =>
        searchTerm === "" ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);

  const { nodes, links } = React.useMemo(() => {
    const nodes: DependencyNode[] = filteredTasks;
    const links: DependencyLink[] = [];

    filteredTasks.forEach((task) => {
      task.dependencies.forEach((dep) => {
        const sourceNode = filteredTasks.find(
          (t) => t.id === dep.dependsOnTask.id
        );
        if (sourceNode) {
          links.push({
            source: sourceNode.id.toString(),
            target: task.id.toString(),
            id: `${sourceNode.id}-${task.id}`,
          });
        }
      });
    });

    return { nodes, links };
  }, [filteredTasks]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create zoom behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        const { transform } = event;
        setZoom(transform.k);
        g.attr("transform", transform);
      });

    svg.call(zoomBehavior);

    const g = svg.append("g");

    // Create force simulation
    const simulation = d3
      .forceSimulation<DependencyNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<DependencyNode, DependencyLink>(links)
          .id((d: any) => d.id.toString())
          .distance(150)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Create arrow marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#6B7280")
      .style("stroke", "none");

    // Create blocked arrow marker
    svg
      .select("defs")
      .append("marker")
      .attr("id", "blocked-arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#EF4444")
      .style("stroke", "none");

    // Create links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#6B7280")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", (d: any) => {
        const sourceTask = nodes.find(
          (n) => n.id.toString() === d.source.id?.toString()
        );
        const targetTask = nodes.find(
          (n) => n.id.toString() === d.target.id?.toString()
        );

        // Check if dependency is blocking
        const isBlocked =
          sourceTask?.status !== "DONE" && targetTask?.status === "IN_PROGRESS";
        return isBlocked ? "5,5" : "none";
      })
      .attr("marker-end", (d: any) => {
        const sourceTask = nodes.find(
          (n) => n.id.toString() === d.source.id?.toString()
        );
        const targetTask = nodes.find(
          (n) => n.id.toString() === d.target.id?.toString()
        );
        const isBlocked =
          sourceTask?.status !== "DONE" && targetTask?.status === "IN_PROGRESS";
        return isBlocked ? "url(#blocked-arrowhead)" : "url(#arrowhead)";
      })
      .style("opacity", 0.8);

    // Node color scale
    const statusColorScale = d3
      .scaleOrdinal<string>()
      .domain(["NEW", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"])
      .range(["#6B7280", "#3B82F6", "#8B5CF6", "#10B981", "#EF4444"]);

    // Create nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Node circles
    node
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d: DependencyNode) => statusColorScale(d.status))
      .attr("stroke", (d: DependencyNode) =>
        d.id === selectedTaskId ? "#3B82F6" : "#fff"
      )
      .attr("stroke-width", (d: DependencyNode) =>
        d.id === selectedTaskId ? 3 : 2
      )
      .style("opacity", (d: DependencyNode) =>
        highlightedNodes.size === 0 || highlightedNodes.has(d.id) ? 1 : 0.3
      );

    // Priority indicators
    node
      .append("circle")
      .attr("r", 6)
      .attr("cx", 15)
      .attr("cy", -15)
      .attr("fill", (d: DependencyNode) => {
        switch (d.priority) {
          case "URGENT":
            return "#DC2626";
          case "HIGH":
            return "#EF4444";
          case "MEDIUM":
            return "#F59E0B";
          default:
            return "#10B981";
        }
      })
      .style("opacity", 0.9);

    // Progress arcs
    node.each(function (d: DependencyNode) {
      const progressArc = d3
        .arc<any>()
        .innerRadius(22)
        .outerRadius(26)
        .startAngle(0)
        .endAngle((d.progress / 100) * 2 * Math.PI);

      d3.select(this)
        .append("path")
        .attr("d", progressArc)
        .attr("fill", statusColorScale(d.status))
        .style("opacity", 0.6);
    });

    // Node labels
    node
      .append("text")
      .attr("dy", 50)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#1F2937")
      .text((d: DependencyNode) =>
        d.title.length > 15 ? d.title.substring(0, 15) + "..." : d.title
      );

    // Blocking indicators
    node
      .filter((d: DependencyNode) => {
        const hasBlockedDependencies = d.dependencies.some((dep) => {
          const depTask = nodes.find((n) => n.id === dep.dependsOnTask.id);
          return depTask && depTask.status !== "DONE";
        });
        return hasBlockedDependencies && d.status === "IN_PROGRESS";
      })
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .style("font-size", "16px")
      .style("fill", "#EF4444")
      .text("⚠️");

    // Node interactions
    node
      .on("click", function (event, d: DependencyNode) {
        event.stopPropagation();
        onTaskSelect?.(d);

        // Highlight connected nodes
        const connected = new Set<number>();
        connected.add(d.id);

        // Add dependencies
        d.dependencies.forEach((dep) => {
          connected.add(dep.dependsOnTask.id);
        });

        // Add dependent tasks
        nodes.forEach((task) => {
          if (task.dependencies.some((dep) => dep.dependsOnTask.id === d.id)) {
            connected.add(task.id);
          }
        });

        setHighlightedNodes(connected);
      })
      .on("mouseover", function (event, d: DependencyNode) {
        // Show tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "dependency-tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "12px")
          .style("border-radius", "8px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", 1000).html(`
            <div class="font-semibold mb-2">${d.title}</div>
            <div>Status: ${d.status}</div>
            <div>Priority: ${d.priority}</div>
            <div>Progress: ${d.progress}%</div>
            <div>Dependencies: ${d.dependencies.length}</div>
            ${
              d.assignedTo
                ? `<div>Assigned: ${
                    d.assignedTo.firstName || d.assignedTo.username
                  }</div>`
                : ""
            }
          `);

        const [mouseX, mouseY] = d3.pointer(event, document.body);
        tooltip
          .style("left", mouseX + 15 + "px")
          .style("top", mouseY - 10 + "px");
      })
      .on("mouseout", function () {
        d3.selectAll(".dependency-tooltip").remove();
      });

    // Drag behavior
    const drag = d3
      .drag<any, DependencyNode>()
      .on("start", function (event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", function (event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", function (event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: DependencyNode) => `translate(${d.x},${d.y})`);
    });

    // Clear highlights on background click
    svg.on("click", function () {
      setHighlightedNodes(new Set());
    });
  }, [nodes, links, selectedTaskId, highlightedNodes, onTaskSelect]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.67);
    }
  };

  const handleZoomFit = () => {
    if (svgRef.current && containerRef.current) {
      const svg = d3.select(svgRef.current);
      const bounds = svg.node()!.getBBox();
      const parent = containerRef.current;
      const fullWidth = parent.clientWidth;
      const fullHeight = parent.clientHeight;

      const width = bounds.width;
      const height = bounds.height;
      const midX = bounds.x + width / 2;
      const midY = bounds.y + height / 2;

      const scale = Math.min(fullWidth / width, fullHeight / height) * 0.8;
      const translate = [
        fullWidth / 2 - scale * midX,
        fullHeight / 2 - scale * midY,
      ];

      svg
        .transition()
        .duration(750)
        .call(
          d3.zoom<SVGSVGElement, unknown>().transform as any,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Task Dependencies Graph
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualize task relationships and identify blockers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors"
              title="Zoom Out"
            >
              <ArrowsPointingInIcon className="w-4 h-4" />
            </button>

            <div className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 border-x border-gray-300 dark:border-gray-600">
              {Math.round(zoom * 100)}%
            </div>

            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Zoom In"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>

            <button
              onClick={handleZoomFit}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors"
              title="Fit to Screen"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-6 text-xs">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Status:
          </span>
          {[
            { status: "NEW", color: "#6B7280", label: "To Do" },
            { status: "IN_PROGRESS", color: "#3B82F6", label: "In Progress" },
            { status: "REVIEW", color: "#8B5CF6", label: "Review" },
            { status: "DONE", color: "#10B981", label: "Done" },
          ].map(({ status, color, label }) => (
            <div key={status} className="flex items-center space-x-1">
              <div
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-0.5 bg-gray-400"></div>
            <svg className="w-2 h-2" viewBox="0 0 10 10">
              <path d="M 0,-2 L 4,0 L 0,2" fill="#6B7280" />
            </svg>
          </div>
          <span className="text-gray-600 dark:text-gray-400">Dependency</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div
              className="w-4 h-0.5 bg-red-500 opacity-60"
              style={{ strokeDasharray: "2,2" }}
            ></div>
            <svg className="w-2 h-2" viewBox="0 0 10 10">
              <path d="M 0,-2 L 4,0 L 0,2" fill="#EF4444" />
            </svg>
          </div>
          <span className="text-gray-600 dark:text-gray-400">Blocking</span>
        </div>
      </div>

      {/* Graph Container */}
      <div
        ref={containerRef}
        className="relative bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ height: "500px" }}
      >
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No tasks found</p>
              <p className="mt-2">
                Create some tasks to see the dependency graph
              </p>
            </div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full" />
        )}

        {/* Clear Highlights Button */}
        {highlightedNodes.size > 0 && (
          <motion.button
            onClick={() => setHighlightedNodes(new Set())}
            className="absolute top-4 right-4 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            Clear Highlight
          </motion.button>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {nodes.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Tasks
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {links.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Dependencies
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {
              nodes.filter(
                (task) =>
                  task.dependencies.some((dep) => {
                    const depTask = nodes.find(
                      (n) => n.id === dep.dependsOnTask.id
                    );
                    return depTask && depTask.status !== "DONE";
                  }) && task.status === "IN_PROGRESS"
              ).length
            }
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Blocked Tasks
          </div>
        </div>
      </div>
    </div>
  );
};

export default DependencyGraph;
