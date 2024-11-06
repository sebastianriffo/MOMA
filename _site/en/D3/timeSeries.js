/*
FEATURES
- tooltip depending on mouse's x-coordinate (in progress : 17/10/24)
- clickable legend (pending)
- legend, mousehover (as this ? https://observablehq.com/@d3/multi-line-chart/2 or https://observablehq.com/@geofduf/simple-dashboard-line-charts), 
- uncertainties (check evaluation datasets first)

It's not necessary to read a file each time we click on it, sort of cache is needed

FIGURES (define common criteria with Patricia)
- units in y-axis
- title depending on variable and spatial extent
*/

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'

import { data, units, margin, width, height, width_initial, height_initial } from './datavizD3.js';

export { xLimBrush }

let x, y, xAxis, xLimBrush;

export function timeSeries(data, colorPalette, xLim, yLim){
/* Sources
- https://d3-graph-gallery.com/graph/line_change_data.html
- https://jsfiddle.net/jaimem/T546B/
*/	
	if ((data.length === 0) && (d3.select(".myXaxis").empty())) {
//		let svg = d3.selectAll("svg > g")
		let svg = d3.select("#dataviz")
				.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox", `0 0 ${width_initial} ${height_initial}`)
				.append("g")
				.attr("transform", `translate(${margin.left},${margin.top})`);	
		
		
		let defs = svg.append("defs")
		
		// initialize axes		
		x = d3.scaleTime().range([0, width]);
		y = d3.scaleLinear().range([height, 0]);
		
		xAxis = svg.append("g")
			.attr("transform", `translate(0, ${height})`)
			.attr("class","myXaxis")
			.call(d3.axisBottom().scale(x).tickFormat(d3.timeFormat("%Y")));//.tickSize(0).tickValues([]));

		let yAxis = svg.append("g")
			.attr("class","myYaxis")
			.call(d3.axisLeft().scale(y)); //.tickSize(0).tickValues([]))

		// customization			
		xAxis.style('font-size', '1rem')
		yAxis.style('font-size', '1rem')

		/*
		pending : arrow at the end
							
		xAxis.select("path.domain").attr("marker-end","url(#markerArrow)")
		yAxis.select("path.domain").attr("marker-end","url(#markerArrow)")
								
		defs.append("svg:marker")
			.attr("id", "markerArrow")
			.attr("refX", 0)
			.attr("refY", 6)
			.attr("orient", "auto")
			.attr("markerWidth", 13)
			.attr("markerHeight", 13)
			.append("svg:path")
			.attr("d","M 0 0 L 10 5 L 0 10 z") //.attr("d","M2,2 L2,11 L10,6 L2,2")	
		*/
			
		// Add legend
		svg.append('g')
			.attr("class", "legend-TS")
			.attr("transform", `translate(${width},${0})`);			
		
		// Add a clipPath: everything out of this area won't be drawn (used for brushing)
		defs.append("svg:clipPath")
			.attr("id", "clip")
			.append("svg:rect")
			.attr("width", width )
			.attr("height", height )
			.attr("x", 0)
			.attr("y", 0);	
				
		// Add brushing
		let brush = d3.brushX()                   
			.extent( [ [0,0], [width,height] ] )          
			.on("end", (event) => updateLineChart(event))
			
		let context = svg.append('g')
				.attr("class", "context")
				.attr("clip-path", "url(#clip)");
				
		context.append('g')
			.attr("class", "brush")				
			.call(brush);
	} else {
		// optional arguments (for redrawing)
		var minX = d3.min(data, function (d) { return d3.min(d.data, d => d.x) });
		var maxX = d3.max(data, function (d) { return d3.max(d.data, d => d.x) });
		var minY = d3.min(data, function (d) { return d3.min(d.data, d => d.y) });
		var maxY = d3.max(data, function (d) { return d3.max(d.data, d => d.y) });

		var xLim = (typeof xLim === 'undefined') ? [minX, maxX] : [!isNaN(xLim[0]) ? xLim[0] : minX, !isNaN(xLim[1]) ? xLim[1] : maxX];	
		var yLim = (typeof yLim === 'undefined') ? [minY, maxY] : yLim;

		// LINES
		let svg = d3.selectAll("svg > g")

		// add units, title, etc
		if (d3.select(".yLabel").empty()){
			svg.append('g')
				.attr("class", "yLabel")		
				.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 0 - margin.left)
					.attr("x",0 - (height / 2))
					.attr("dy", "1em")
					.attr("font-size", "20px")
					.style("text-anchor", "middle")
					.text(units);	
		}

		// redraw axis
		let xScale = x.domain(xLim);
		
		let xAxis = svg.selectAll(".myXaxis")
				.transition().duration(1000)
				.call(d3.axisBottom().scale(x));
				
		let yScale = y.domain(yLim);	
		let yAxis = svg.selectAll(".myYaxis")
				.transition().duration(1000)
				.call(d3.axisLeft().scale(y));

		// stats
		let options = data.map(d => d.dataset); 

		let avg = Array.from({length: (data.length >= 1) ? data[0].data.length : 0}, (v, i) => 0);
			
		// (re)drawing lines for each group
		// source : https://stackoverflow.com/questions/52028595/how-to-use-enter-data-join-for-d3-line-graphs
	 
		for(const dataset of options) {
			if (svg.selectAll("#"+dataset).empty()) {
				var lines = svg.select(".context").append("g")		
						.attr("id", dataset)
						.attr("class", "timeSeries")
			} else { 
				var lines = d3.selectAll('#'+dataset);
			}

			// color line (and uncertainty) function		
			let colorLine = (colorPalette.filter(function (d) { return d.dataset === dataset; }))[0].darkColor;		
						
			// create/update line with new data
			lines.selectAll("path")
				.data([data.filter(function (d) { return d.dataset === dataset; })[0].data])
				.join(
					enter => enter.append("path"),
					update => update,
					exit => exit.remove()
					)
				// all this applies to enter/update
				.attr("d", d3.line()
						.x(d => x(d.x))
						.y(d => y(d.y)))
				.transition().duration(1000)			
				.attr("fill", "none")		
				.attr("stroke-width", 1.5)
				.attr("stroke", colorLine);
			
			avg = (data.filter(function (d) { return d.dataset === dataset; })[0].data.map(d => d.y)).map(function (num, idx) {return num + avg[idx];})				
		}
		
		let leavingLines = (new Set (svg.selectAll(".timeSeries").nodes().map(d => d.id))).difference(new Set (options))
				
		for(const ll of leavingLines) {
			svg.selectAll('#'+ll.replace('.','\\.'))
				.attr("fill-opacity", 1)
				.attr("stroke-opacity", 1)
				.transition().duration(1000)	
				.attr("fill-opacity", 0)
				.attr("stroke-opacity", 0)
				.remove(); 
		}

		// stats
		if (data.length >= 1) {
			let time = data.filter(function (d) { return d.dataset === options[0]; })[0].data.map(d => d.x)

			var minYbrush = d3.min(data, function (d) { return d3.min(d.data.filter(function (d) {return ((d.x >= xLim[0]) && (d.x <= xLim[1]))}), d => d.y) });
			var maxYbrush = d3.max(data, function (d) { return d3.max(d.data.filter(function (d) {return ((d.x >= xLim[0]) && (d.x <= xLim[1]))}), d => d.y) });
		
			let stats = [	{dataset: "minimum", data : time.map((el, index) => ({x: el, y: minYbrush})) },
					{dataset: "maximum", data : time.map((el, index) => ({x: el, y: maxYbrush})) }];

			if (data.length > 1) {
				stats = stats.concat({dataset: "average", data : time.map((el, index) => ({x: el, y: avg[index]/data.length}) )})
			}
			statistics(stats, xLim)
		}
				
		// add legend
		legend(colorPalette)
		
		// tooltip must be on top (i.e., it's the last element) but why ?
		// it has to be removed, otherwise we repeat it when re-adding an element
		// also : each time we add/remove a line we repeat this element
		// we lost brushing too 
		// needs width and height
		
		/*
		svg.append('rect')
			.attr('width', width)
			.attr('height', height)
			.style('opacity', 0)
			.on('touchmouse mousemove', function(event){
				const date = xScale.invert(d3.pointer(event, this))

				const dateBisector = d3.bisector(d => d.x).left;
				
				
				var ds = data.map(function(e) {
					var i = dateBisector(e.data, date, 1),
					d0 = e.data[i - 1],
					d1 = e.data[i];
					return date - d0.x > d1.x - date ? d1 : d0;
				});
				console.log(ds)
				console.log([...new Set(ds.map(d => d.x))]) // just the date...

			})
			.on('mouseleave', function(event){
			})
		*/
	}
}

/* BRUSHING
- sources
https://d3-graph-gallery.com/graph/line_brushZoom.html
https://krisrs1128.github.io/stat679_notes/2022/06/01/week6-4.html
*/
export function updateLineChart(event) {	
	d3.select(".selection").attr("fill-opacity", 0).attr("width","0")
				
	// selected boundaries
	let extent = (event !== null) ? event.selection : null;	
	let svg = d3.selectAll("svg > g");
	let xScale = null;

	if(extent !== null){		
		// d3.select(".brush").call(event.target.move, null)
		d3.select(".brush").attr("pointer-events","none")
		
		// x.invert() relates the mouse selection with the axis
		xLimBrush = [x.invert(extent[0]), x.invert(extent[1])];
		x.domain(xLimBrush);
	} else {
		// a click zoom out the chart
		let minX = d3.min(data, function (d) { return d3.min(d.data, d => d.x) });
		let maxX = d3.max(data, function (d) { return d3.max(d.data, d => d.x) });
		
		let startDate = d3.select('#startDate').node().value;	
		let endDate = d3.select('#endDate').node().value;
		
		let x0 = new Date(startDate); 
		let x1 = new Date(endDate); 

		xLimBrush = [!isNaN(x0) ? x0 : minX, !isNaN(x1) ? x1 : maxX]

		x.domain(xLimBrush);
	}	

	xAxis.transition().call(d3.axisBottom(x))
	
	let context = svg.select(".context")
	context.selectAll('path')
		.transition().duration(1000)
		.attr("d", d3.line()
				.x(function(d) { return x(d.x); })
				.y(function(d) { return y(d.y); }))
				
	// stats
	if (data.length >= 1) { 
		let options = data.map(d => d.dataset); 
		let time = data.filter(function (d) { return d.dataset === options[0]; })[0].data.map(d => d.x)

		var minYbrush = d3.min(data, function (d) { return d3.min(d.data.filter(function (d) {return ((d.x >= xLimBrush[0]) && (d.x <= xLimBrush[1]))}), d => d.y) });
		var maxYbrush = d3.max(data, function (d) { return d3.max(d.data.filter(function (d) {return ((d.x >= xLimBrush[0]) && (d.x <= xLimBrush[1]))}), d => d.y) });

		let stats = [	{dataset: "minimum", data : time.map((el, index) => ({x: el, y: minYbrush})) },
				{dataset: "maximum", data : time.map((el, index) => ({x: el, y: maxYbrush})) }];
		statistics(stats, xLimBrush)	
	}				
	// communication
	let pythonInfo = {	"plot" : d3.select('#plots').node().value, 
				"experience" : d3.select('#experience').node().value, 
				"variable" : d3.select('#variables').node().value, 
				"timeRes" : d3.select('#timeResolution').node().value, 
				"startDate" : xLimBrush[0], 
				"endDate" : xLimBrush[1], 
				"spatialExt": d3.select('#spatialExtent').node().value,  
				};
					
	fetch(`${window.origin}/en/dataviz.html`, {
		method: "POST",
		credentials: "include",
		body: JSON.stringify(pythonInfo),
		cache: "no-cache",
		headers: new Headers({"content-type": "application/json"})
	})

	d3.select(".selection").attr("fill-opacity", "0.3")
}

/* LEGEND */
function legend(colorPalette){
	const fontSize = 16;
		
	let legendContainer = d3.select(".legend-TS");		
	
	d3.selectAll(".legend-TS > rect").remove();		
	legendContainer.selectAll("mydots").data(colorPalette)
                .enter().append("rect")
                .attr("height", 0.7*fontSize)
                .attr("width", 1.6*fontSize)
                .attr("x", 20)
                .attr("y", function(d,i){ return (10 + i*25) })
                .attr("stroke", d => d.darkColor)
                .attr("class", "legend-box")
                .style("fill", function(d) {       
                           return d.visible ? d.darkColor : "white";})
		/*               	
//             see : https://github.com/mpld3/mpld3/blob/master/mpld3/plugins.py              
                .on("click", 
                	function(d, i){
				d.visible = !!d.visible;
				console.log(d.visible)
				
				d3.select(this).style("fill", d.visible ? d.darkColor : "white");

				});
		//	set_alphas(d, false) 		
            	.on('mouseover', 
            		function (d,i){
             			set_alphas(d, true);
        		})
        	.on('mouseout', 
        		function (d,i){
             			set_alphas(d, false);
			});
*/
	d3.selectAll(".legend-TS > text.label").remove();	
	legendContainer.selectAll("mylabels").data(colorPalette)
		.enter().append("text").attr("class", "label")
		.attr("x", 25+ 1.6*fontSize )
		.attr("y", function(d,i){return (22 + i*25)}) 
		.style("fill", function(d){ return d.darkColor })
		.text(function(d){ return d.dataset })
		.attr("text-anchor", "left")
		.style("font-size", fontSize+"px")
		.style("alignment-baseline", "middle");	
		
	// stats
	let stats = (colorPalette.length > 1) ? [{dataset: "average"}, {dataset: "maximum"}, {dataset: "minimum"}]:[{dataset: "maximum"}, {dataset: "minimum"}]
	
	
	d3.selectAll(".legend-TS > line").remove();
	legendContainer.selectAll("mydots").data(stats)
		.enter().append("line")
		.attr("x1", 20).attr("y1", function(d,i){ return (17 + (i+colorPalette.length+1)*25) })
		.attr("x2", 20+27).attr("y2", function(d,i){ return (17 + (i+colorPalette.length+1)*25) })
		.attr("stroke-width", 2)
		.attr("stroke", "#899499")
		.attr("stroke-dasharray", function(d) { return (d.dataset === "average") ? "none": ((d.dataset === "maximum") ? "6":"3") })
		.attr("class", "legend-box");
		
	legendContainer.selectAll("mylabels").data(stats)
		.enter().append("text").attr("class", "label")
		.attr("x", 25+ 27)
		.attr("y", function(d,i){return (22 + (i+colorPalette.length+1)*25)}) 
		.style("fill", "#899499")
		.text(function(d){ return d.dataset })
		.attr("text-anchor", "left")
		.style("font-size", fontSize+"px")
		.style("alignment-baseline", "middle");		
}

/* STATS */
function statistics(stats, xLim) { 
	let svg = d3.selectAll("svg > g")
	
	if (data.length <= 1) { d3.selectAll(".stats").remove() };

	for (const dataset of stats.map(d => d.dataset)) {
		d3.selectAll("#"+dataset).remove()
	
		var lines = svg.select(".context").append("g")		
					.attr("id", dataset)
					.attr("class", "stats")		
					
		// create/update line with new data
		lines.selectAll("path")
			.data([stats.filter(function (d) { return d.dataset === dataset; })[0].data])
			.join(
				enter => enter.append("path"),
				update => update,
				exit => exit.remove()
				)
			// all this applies to enter/update
			.attr("d", d3.line()
					.x(d => x(d.x))
					.y(d => y(d.y)))
			.transition().duration(1000)			
			.attr("fill", "none")		
			.attr("stroke-width", 1)
			.attr("stroke", "#899499")
			.attr("stroke-dasharray", (dataset === "average") ? "none": ((dataset === "maximum") ? "6":"3"));
	}
}

/* COLORING */
// palette
export function coloring(){
/* strong and light versions of a color palette, based on tableau20 */

	const color = ["#1f77b4", "#aec7e8", //blue
			"#ff7f0e", "#ffbb78", //orange
			"#2ca02c", "#98df8a", //green
			"#d62728", "#ff9896", //red
			"#9467bd", "#c5b0d5", //purple
			"#8c564b", "#c49c94", //brown
			"#e377c2", "#f7b6d2", //pink
			"#7f7f7f", "#c7c7c7", //grey
			"#bcbd22", "#dbdb8d", //olive green
			"#17becf", "#9edae5"  //cyan 
			]
	
	const darkColor = color.filter(function(element, index, array) { return (index % 2 == 0);});
	const lightColor = color.filter(function(element, index, array) { return (index % 2 == 1);});
	
	return [darkColor, lightColor]
}	

export function palette(data, colorPalette, darkColor, lightColor) {	
	let dataset = [...new Set(data.map(d => d.dataset))]
	let palette = [...new Set(colorPalette.map(d => d.dataset))]

	if (dataset.length > palette.length) {		
		// add the one not belonging to palette, and its respective colors	
		let name = dataset.filter(x => !palette.includes(x))[0];
		let new_darkColor =  darkColor.filter(x => !(colorPalette.map(d => d.darkColor)).includes(x))[0];
		let new_lightColor =  lightColor.filter(x => !(colorPalette.map(d => d.lightColor)).includes(x))[0];
				 		
		colorPalette.push({dataset: name, darkColor: new_darkColor, lightColor: new_lightColor, visible: true})
	} else {
		// drop the one still belonging
		let name = palette.filter(x => !dataset.includes(x))[0];
		
		colorPalette = colorPalette.filter(function (d) { return d.dataset !== name; });	
	}

	return colorPalette
}
