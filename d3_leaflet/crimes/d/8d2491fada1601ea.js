// https://observablehq.com/@castelojb/d3-com-crossfilter-dc-js-e-leaflet-crimes-chicago@501
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# D3 com Crossfilter, DC.js e Leaflet: Crimes Chicago`
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/13dfe2c1d43e11b5207bb4e6125d71bf/raw/41d14f8fbd9d6cd9e8ad074f8417cff1329ab339/chicago_crimes_sept_2019.csv").then(function(data){
  // formatando nossos dados
  //09/22/2019 11:52:00 PM
  let parseDate = d3.utcParse("%m/%d/%Y %H:%M:%S %p")
  data.forEach(function(d,i){
       d.Date = parseDate(d.Date)
       d.Latitude = d3.format(".7f") (d.Latitude)
       d.Longitude = d3.format(".7f") (d.Longitude)
    
       d.depth = d3.format("d")(d.depth)
       //d.date = d3.utcParse(d.origintime)
   })
  return data
})
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("crimes")).define("crimes", ["facts"], function(facts){return(
facts.dimension(d => d['Primary Type'])
)});
  main.variable(observer("crimes_numero")).define("crimes_numero", ["crimes"], function(crimes){return(
crimes.group()
)});
  main.variable(observer()).define(["crimes_numero"], function(crimes_numero){return(
crimes_numero.all()
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css" integrity="sha384-PDle/QlgIONtM1aqA2Qemk5gPOE7wFq8+Em+G/hmo5Iq0CCmYZLv3fVRDJ4MMwEA" crossorigin="anonymous"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"
integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
crossorigin=""/>`
)});
  main.variable(observer("dateDimension")).define("dateDimension", ["facts","d3"], function(facts,d3){return(
facts.dimension(d => d3.timeDay(d.Date))
)});
  main.variable(observer("crimes_dia")).define("crimes_dia", ["facts","d3"], function(facts,d3){return(
facts.dimension(function(d) { 
   return [d3.timeDay(d.Date), d['Primary Type']];
})
)});
  main.variable(observer("crimes_dia_agrupado")).define("crimes_dia_agrupado", ["crimes_dia"], function(crimes_dia){return(
crimes_dia.group().reduceCount()
)});
  main.variable(observer()).define(["crimes_dia_agrupado"], function(crimes_dia_agrupado){return(
crimes_dia_agrupado.all()
)});
  main.variable(observer("L")).define("L", ["require"], function(require){return(
require('leaflet@1.5.1')
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container","d3","crimes","dc","crimes_numero","dateDimension","crimes_dia","crimes_dia_agrupado"], function(md,container,d3,crimes,dc,crimes_numero,dateDimension,crimes_dia,crimes_dia_agrupado)
{
  
  let view = md`${container()}`
  
  let colorScale = d3.scaleOrdinal()
                      .domain(crimes)
                      .range(["#ca0020", "#0571b0", "#fdae61"])
  
  let barChart = dc.barChart(view.querySelector("#magnitude-chart"))
  let xScale = d3.scaleOrdinal()
                  .domain(crimes)
  
  barChart.width(480)
           .height(200)
           .dimension(crimes)
           .x(xScale)
            .xUnits(dc.units.ordinal)
           .renderHorizontalGridLines(true)
           .group(crimes_numero)
            .colors(colorScale)
            .colorAccessor(d => d.key)
  barChart.render()
  
  let chart = dc.seriesChart(view.querySelector("#depth-chart"),"#teste")
  
  let xscale = d3.scaleTime()
  .domain([dateDimension.bottom(1)[0].Date, dateDimension.top(1)[0].Date])

  chart
   .width(480)
   .height(200)
   .chart(function(c) { 
      return dc.lineChart(c)//.interpolate('cardinal').evadeDomainFilter(true); 
   })
   
   .x(xscale)
   .elasticY(true)
   .brushOn(false)
   .xAxisLabel("Tempo")
   .yAxisLabel("Crimes")
   .dimension(crimes_dia)
   .group(crimes_dia_agrupado)
   .seriesAccessor(d => d.key[1])
   .keyAccessor(d => d.key[0])
   .valueAccessor(d => d.value)
   .colors(colorScale)
    .colorAccessor(d => d.key[1])
   
chart.render();
  
  return view
}
);
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role="main" class="container">
    <div class="row">
      <h4> Crimes em Chicago</h4>
    </div>
    <div class='row'>
        <div id="mapid" class="col-6">
        </div>
        <div class="col-6">
          <div id='magnitude-chart'>
            <h5> Numero de crimes por tipo </h5>
          </div>

          <div id='depth-chart'>
            <h5> Numero de crimes por dia </h5>
          </div>
        </div>
    </div>
   <p>fonte dos dados <a href="https://gist.githubusercontent.com/emanueles/13dfe2c1d43e11b5207bb4e6125d71bf/raw/41d14f8fbd9d6cd9e8ad074f8417cff1329ab339/chicago_crimes_sept_2019.csv">Link</a>.</p>
  </main>
 `
}
)});
  main.variable(observer("map")).define("map", ["buildvis","L"], function(buildvis,L)
{
buildvis;
let mapInstance = L.map('mapid').setView([41.881832,-87.623177], 9)
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
attribution: "Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
maxZoom: 17
}).addTo(mapInstance)
return mapInstance
}
);
  main.variable(observer("circlesLayer")).define("circlesLayer", ["L","map"], function(L,map){return(
L.layerGroup().addTo(map)
)});
  main.variable(observer("circles")).define("circles", ["d3","crimes","circlesLayer","dataset","L"], function(d3,crimes,circlesLayer,dataset,L)
{
  let colorScale = d3.scaleOrdinal()
                      .domain(crimes)
                      .range(["#ca0020", "#0571b0", "#fdae61"])
circlesLayer.clearLayers()
dataset.forEach( function(d) {
let circle = L.circle([d.Latitude, d.Longitude], 200, {
  color: colorScale(d['Primary Type']),
  weight: 2,
  fillColor: '#fecc5c',
  fillOpacity: 0.5,
  //bindPopup: d.magnitude
})
circlesLayer.addLayer(circle) 
circle.bindPopup("Crime: "+d['Primary Type']+"<br>Hora: "+d3.timeDay(d.Date))
}
               )
}
);
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula inclui o css do dc.
<style>
#mapid {
  width: 650px;
  height: 480px;
}
.dc-chart path.dc-symbol, .dc-legend g.dc-legend-item.fadeout {
  fill-opacity: 0.5;
  stroke-opacity: 0.5; }

.dc-chart rect.bar {
  stroke: none;
  cursor: pointer; }
  .dc-chart rect.bar:hover {
    fill-opacity: .5; }

.dc-chart rect.deselected {
  stroke: none;
  fill: #ccc; }

.dc-chart .pie-slice {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }
  .dc-chart .pie-slice.external {
    fill: #000; }
  .dc-chart .pie-slice :hover, .dc-chart .pie-slice.highlight {
    fill-opacity: .8; }

.dc-chart .pie-path {
  fill: none;
  stroke-width: 2px;
  stroke: #000;
  opacity: 0.4; }

.dc-chart .selected path, .dc-chart .selected circle {
  stroke-width: 3;
  stroke: #ccc;
  fill-opacity: 1; }

.dc-chart .deselected path, .dc-chart .deselected circle {
  stroke: none;
  fill-opacity: .5;
  fill: #ccc; }

.dc-chart .axis path, .dc-chart .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges; }

.dc-chart .axis text {
  font: 10px sans-serif; }

.dc-chart .grid-line, .dc-chart .axis .grid-line, .dc-chart .grid-line line, .dc-chart .axis .grid-line line {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges; }

.dc-chart .brush rect.selection {
  fill: #4682b4;
  fill-opacity: .125; }

.dc-chart .brush .custom-brush-handle {
  fill: #eee;
  stroke: #666;
  cursor: ew-resize; }

.dc-chart path.line {
  fill: none;
  stroke-width: 1.5px; }

.dc-chart path.area {
  fill-opacity: .3;
  stroke: none; }

.dc-chart path.highlight {
  stroke-width: 3;
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart g.state {
  cursor: pointer; }
  .dc-chart g.state :hover {
    fill-opacity: .8; }
  .dc-chart g.state path {
    stroke: #fff; }

.dc-chart g.deselected path {
  fill: #808080; }

.dc-chart g.deselected text {
  display: none; }

.dc-chart g.row rect {
  fill-opacity: 0.8;
  cursor: pointer; }
  .dc-chart g.row rect:hover {
    fill-opacity: 0.6; }

.dc-chart g.row text {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }

.dc-chart g.dc-tooltip path {
  fill: none;
  stroke: #808080;
  stroke-opacity: .8; }

.dc-chart g.county path {
  stroke: #fff;
  fill: none; }

.dc-chart g.debug rect {
  fill: #00f;
  fill-opacity: .2; }

.dc-chart g.axis text {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .node {
  font-size: 0.7em;
  cursor: pointer; }
  .dc-chart .node :hover {
    fill-opacity: .8; }

.dc-chart .bubble {
  stroke: none;
  fill-opacity: 0.6; }

.dc-chart .highlight {
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart .fadeout {
  fill-opacity: 0.2;
  stroke-opacity: 0.2; }

.dc-chart .box text {
  font: 10px sans-serif;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .box line {
  fill: #fff; }

.dc-chart .box rect, .dc-chart .box line, .dc-chart .box circle {
  stroke: #000;
  stroke-width: 1.5px; }

.dc-chart .box .center {
  stroke-dasharray: 3, 3; }

.dc-chart .box .data {
  stroke: none;
  stroke-width: 0px; }

.dc-chart .box .outlier {
  fill: none;
  stroke: #ccc; }

.dc-chart .box .outlierBold {
  fill: red;
  stroke: none; }

.dc-chart .box.deselected {
  opacity: 0.5; }
  .dc-chart .box.deselected .box {
    fill: #ccc; }

.dc-chart .symbol {
  stroke: none; }

.dc-chart .heatmap .box-group.deselected rect {
  stroke: none;
  fill-opacity: 0.5;
  fill: #ccc; }

.dc-chart .heatmap g.axis text {
  pointer-events: all;
  cursor: pointer; }

.dc-chart .empty-chart .pie-slice {
  cursor: default; }
  .dc-chart .empty-chart .pie-slice path {
    fill: #fee;
    cursor: default; }

.dc-data-count {
  float: right;
  margin-top: 15px;
  margin-right: 15px; }
  .dc-data-count .filter-count, .dc-data-count .total-count {
    color: #3182bd;
    font-weight: bold; }

.dc-legend {
  font-size: 11px; }
  .dc-legend .dc-legend-item {
    cursor: pointer; }

.dc-hard .number-display {
  float: none; }

div.dc-html-legend {
  overflow-y: auto;
  overflow-x: hidden;
  height: inherit;
  float: right;
  padding-right: 2px; }
  div.dc-html-legend .dc-legend-item-horizontal {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-horizontal.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-vertical {
    display: block;
    margin-top: 5px;
    padding-top: 1px;
    padding-bottom: 1px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-vertical.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-color {
    display: table-cell;
    width: 12px;
    height: 12px; }
  div.dc-html-legend .dc-legend-item-label {
    line-height: 12px;
    display: table-cell;
    vertical-align: middle;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 0.75em; }

.dc-html-legend-container {
  height: inherit; }
</style>`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require('dc')
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require('crossfilter2')
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3')
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  return main;
}
