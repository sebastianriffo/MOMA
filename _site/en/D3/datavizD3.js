import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm' //'https://unpkg.com/d3?module'
import { NetCDFReader } from "https://cdn.jsdelivr.net/npm/netcdfjs@3.0.0/+esm";
import { coloring, palette, timeSeries, updateLineChart } from './timeSeries.js';

export { data, units, margin, width, height, width_initial, height_initial }
import { xLimBrush } from './timeSeries.js';

let test = 0;

// SVG CONTAINER
const div_container = d3.select('#col-dataviz').node();

const scale = 1;	
const width_initial = scale*parseInt(window.getComputedStyle(div_container).width);
const height_initial = scale*parseInt(window.getComputedStyle(div_container).height);

let margin = {top: 20, right: 275, bottom: 30, left: 75},
width = width_initial - margin.left - margin.right,
height = height_initial - margin.top - margin.bottom;

// plot specs
let data = [];
let colorPalette = [];
const [darkColor, lightColor] = coloring();
let units = null;

// filename
let plot, experience, variableName, timeRes, spatialExt = null;

/* PLOT SELECTOR (jqueryUI compatible) */
$('.specs').on('selectmenuchange change', async function(event) {

	plot = d3.select('#plots').node().value;
	
	experience = d3.select('#experience').node().value;
	variableName = d3.select('#variables').node().value;
	
	timeRes = d3.select('#timeResolution').node().value;
	startDate = d3.select('#startDate').node().value;	
	endDate = d3.select('#endDate').node().value;	
	
	spatialExt = d3.select('#spatialExtent').node().value;

	if (plot === 'TS') { 
		if ((event.target.id !== 'startDate') && (event.target.id !== 'endDate')) {
			d3.selectAll("svg > g").remove();
			data = [];
			colorPalette = [];
			/*
			let svg = d3.select("#dataviz")
					.attr("preserveAspectRatio", "xMinYMin meet")
					.attr("viewBox", `0 0 ${width_initial} ${height_initial}`)
					.append("g")
					.attr("transform", `translate(${margin.left},${margin.top})`);	
			*/
			timeSeries(data, colorPalette, xLimBrush)
			
		} else if (((event.target.id === 'startDate') || (event.target.id == 'endDate')) && (!d3.select(".myXaxis").empty()) ) {
			// user could select dates first
			updateLineChart(null);
			
		} else {
		}	
	} else {
		d3.selectAll("svg > g").remove();
		data = [];
		colorPalette = [];
	}

});

/*
it seems there is a problem with delegate events
function selected(switchKeys){
	if (switchKeys.indexOf('Uncheck all') == -1){
		switchKeys.unshift(['Uncheck all'])
	}
	
	var a = d3.select('#dataSelected').selectAll('.checkbox').data(switchKeys, d => d.id )
						
	a.enter()
		.append('div')
		.attr('class', 'checkbox')
		.append('label').attr('for', id => id).html(function(id) {
			let checkbox = '<input id="'+id+'" type="checkbox" class="category"' +((id != 'Uncheck all')? ' checked>':' >');
			
			return checkbox +' '+id;
			})
		.on('click', function() {
			const id = ('#'+d3.select(this).attr('for')).replaceAll(' ','\\ ').replace('(','\\(').replace(')','\\)').replace(',','\\,');
			d3.select('#simulations').selectAll('label').select(id).property('checked', false);
			
			if (id != '#Uncheck\\ all'){
				// simulate click : // https://stackoverflow.com/questions/32610092/why-isnt-the-checkbox-change-event-triggered-when-i-do-it-programatically-in-d3
				d3.select('#simulations').selectAll('label').select(id).on('change')();	
			}
		});

	a.exit().remove();	
}
*/

/* FIGURES */ 
// since input elements were created after DOM, d3 function .on('change', async function()) does not catch anything 
// we must use event delegation instead
document.querySelectorAll(".datasetList").forEach( function(element) { 
element.addEventListener('change', async function(event) {

let storage = "local";

if (event.target.tagName.toLowerCase() === 'input') {

	let filename = event.target.id;
	
	if (event.target.checked) {	
		// path must be adapted to THREDDS (23/10/2024)
		// should realize when a file is unavailable (due to poor filtering)		
		let root, folder, fullFilename = null;
		
		if (window.location.origin === "https://thredds-su.ipsl.fr"){
			root = "https://thredds-su.ipsl.fr/thredds/fileServer/ipsl_thredds";
			folder = "sreyes/dataviz";
			fullFilename = variableName+"/"+variableName+"_"+filename+"_annual_global_mean.nc";
		} else {
			root = (window.location.origin === "https://sebastianriffo.github.io") ? "https://raw.githubusercontent.com/sebastianriffo/MOMA/master":window.location.origin;
			folder = ["data", event.target.className, experience, variableName, filename, plot].join("/");				
			fullFilename = [variableName, filename, experience, timeRes, spatialExt, "mean.nc"].join("_");
		}
		console.log(window.location.origin)
		console.log(window.location.origin === "https://sebastianriffo.github.io")
		
		let path = root +"/"+ folder +"/"+ fullFilename;
		
		try {
			let response = await fetch(path, { method: "GET" });	
			let blob = await response.blob();
			let arrayBuffer = await blob.arrayBuffer();			
			let netcdfFile = new NetCDFReader(arrayBuffer);
			
			units = netcdfFile.header.variables
					.find((val) => {return val.name === variableName; }).attributes
					.find((attr) => {return attr.name === "units"; }).value
			
			let process = new Array(netcdfFile.getDataVariable(variableName))[0]			
			let time = parsingTime(netcdfFile)			

			// zip time and process coordinates
			let data_unparsed = time.map((e, i) => [e, process[i]]);
			
			/* nested array containing each line */
			data = data.concat({	dataset: filename, 
						data: data_unparsed.map(function(d) { return {x: d[0], y: d[1] }; })
						});									
		} catch(error) {
			d3.select(".datasetList").select('#'+filename)
				.attr("disabled","1")
				.attr("onclick","return false")
		}
	} else {
		data = data.filter(function (d) { return d.dataset !== filename; });		
	}	
	
	// update axis and data
	colorPalette = palette(data, colorPalette, darkColor, lightColor);	
	timeSeries(data, colorPalette, xLimBrush);
}
}) 
});


/* NETCDF FILES */
function parsingTime(netcdfFile) {
/* It finds and transforms the time coordinate into a Date object */
// pending: we must consider calendars ! (gregorian, noleap)
		
	let index_time = netcdfFile.variables.map(function(e) { return e.name; }).indexOf("time");
	let time = netcdfFile.variables[index_time];

	let index_calendar = (time.attributes).map(function(e) { return e.name; }).indexOf("calendar");

//	if (time.attributes[index_calendar].value === "gregorian"){
	let index_units = (time.attributes).map(function(e) { return e.name; }).indexOf("units");
	
	let ref_date = new Date((time.attributes[index_units].value).match(/\d{4}-\d{1,2}-\d{1,2}/)[0]);
	let ref_unit = (time.attributes[index_units].value).split(' ')[0];
	
	if (ref_unit === "days") {
		var ms = 24*60*60*1000;
	} else if (ref_unit === "seconds") {
		var ms = 1000;
	} else {
		var ms = 0;
	}
	
	let time_axis = new Array(netcdfFile.getDataVariable("time"))[0]

	// dates needs to be converted to miliseconds first
	return time_axis.map(x => new Date(parseInt(x)*ms + ref_date.getTime()))
//	}
}


