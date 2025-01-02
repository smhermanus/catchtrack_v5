import { Chart } from 'chart.js/auto';
import * as d3 from 'd3';
import { SankeyLink, sankeyLinkHorizontal, sankey } from 'd3-sankey';
import { HierarchyNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { DefaultArcObject } from 'd3-shape';
import { DateTime } from 'luxon';

type ChartType =
  | 'timeSeries'
  | 'heatmap'
  | 'sankey'
  | 'treemap'
  | 'sunburst'
  | 'networkGraph'
  | 'streamgraph'
  | 'radar'
  | 'bubble'
  | 'parallel';

interface VisualizationOptions {
  container: HTMLElement;
  data: any;
  type: ChartType;
  config?: Record<string, any>;
}

interface TimeSeriesData {
  timestamp: string | Date;
  value: number;
}

interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

interface TreemapData {
  value: number;
  color: string;
  children?: TreemapData[];
}

interface TreemapNode extends d3.HierarchyRectangularNode<TreemapData> {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export class AnalyticsVisualizer {
  private static readonly chartTypes: Record<ChartType, (options: VisualizationOptions) => void> = {
    timeSeries: createTimeSeriesChart,
    heatmap: createHeatmap,
    sankey: createSankeyDiagram,
    treemap: createTreemap,
    sunburst: createSunburstDiagram,
    networkGraph: createNetworkGraph,
    streamgraph: createStreamGraph,
    radar: createRadarChart,
    bubble: createBubbleChart,
    parallel: createParallelCoordinates,
  } as const;

  public static create(options: VisualizationOptions): void {
    const visualizer = this.chartTypes[options.type];
    if (!visualizer) {
      throw new Error(`Unsupported visualization type: ${options.type}`);
    }

    visualizer(options);
  }
}

function createTimeSeriesChart({ container, data, config }: VisualizationOptions): void {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;

  const timeSeriesData = data as TimeSeriesData[];

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const dates = timeSeriesData.map((d) => new Date(d.timestamp));
  const x = d3
    .scaleTime()
    .domain(d3.extent(dates) as [Date, Date])
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(timeSeriesData, (d) => d.value) || 0])
    .range([height, 0]);

  const line = d3
    .line<TimeSeriesData>()
    .x((d) => x(new Date(d.timestamp)))
    .y((d) => y(d.value));

  svg
    .append('path')
    .datum(timeSeriesData)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr('d', line);

  svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));

  svg.append('g').call(d3.axisLeft(y));
}

function createHeatmap({ container, data, config }: VisualizationOptions): void {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;

  const heatmapData = data as HeatmapData[];

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([0, d3.max(heatmapData, (d) => d.value) || 0]);

  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(heatmapData.map((d) => d.x));

  const y = d3
    .scaleBand()
    .range([height, 0])
    .domain(heatmapData.map((d) => d.y));

  svg
    .selectAll('rect')
    .data(heatmapData)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.x) || 0)
    .attr('y', (d) => y(d.y) || 0)
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .style('fill', (d) => colorScale(d.value));
}

interface SankeyNode {
  node: number;
  name: string;
  color: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink<SankeyNode, SankeyNode>[];
}

function createSankeyDiagram({ container, data, config }: VisualizationOptions): void {
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;

  const sankeyData = data as SankeyData;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const sankeyGenerator = sankey<SankeyNode, SankeyLink<SankeyNode, SankeyNode>>()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([
      [0, 0],
      [width, height],
    ]);

  const { nodes, links } = sankeyGenerator(sankeyData);

  svg
    .append('g')
    .selectAll('rect')
    .data(nodes)
    .enter()
    .append('rect')
    .attr('x', (d) => d.x0 || 0)
    .attr('y', (d) => d.y0 || 0)
    .attr('height', (d) => (d.y1 || 0) - (d.y0 || 0))
    .attr('width', (d) => (d.x1 || 0) - (d.x0 || 0))
    .style('fill', (d) => d.color);

  svg
    .append('g')
    .selectAll('path')
    .data(links)
    .enter()
    .append('path')
    .attr('d', sankeyLinkHorizontal())
    .style('stroke-width', (d) => Math.max(1, d.width || 0));
}

function createTreemap({ container, data, config }: VisualizationOptions): void {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);

  const root = d3
    .hierarchy<TreemapData>(data)
    .sum((d) => d.value)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const treemapLayout = d3.treemap<TreemapData>().size([width, height]).padding(1);

  const rootWithLayout = treemapLayout(root) as unknown as TreemapNode;

  const cell = svg
    .selectAll('g')
    .data(rootWithLayout.leaves())
    .enter()
    .append('g')
    .attr('transform', (d: TreemapNode) => `translate(${d.x0},${d.y0})`);

  cell
    .append('rect')
    .attr('width', (d: TreemapNode) => d.x1 - d.x0)
    .attr('height', (d: TreemapNode) => d.y1 - d.y0)
    .style('fill', (d) => d.data.color);
}

interface SunburstData {
  value: number;
  color: string;
  children?: SunburstData[];
}

function createSunburstDiagram({ container, data, config }: VisualizationOptions): void {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const radius = Math.min(width, height) / 2;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const root = d3.hierarchy<SunburstData>(data).sum((d) => d.value);

  const partition = d3.partition<SunburstData>().size([2 * Math.PI, radius]);

  const partitionedRoot = partition(root);

  const arc = d3
    .arc<d3.HierarchyRectangularNode<SunburstData>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1);

  svg
    .selectAll('path')
    .data(partitionedRoot.descendants())
    .enter()
    .append('path')
    .attr('d', (d) => arc(d) || '')
    .style('fill', (d) => d.data.color);
}

// Placeholder functions for the remaining chart types
function createNetworkGraph(options: VisualizationOptions): void {}
function createStreamGraph(options: VisualizationOptions): void {}
function createRadarChart(options: VisualizationOptions): void {}
function createBubbleChart(options: VisualizationOptions): void {}
function createParallelCoordinates(options: VisualizationOptions): void {}
