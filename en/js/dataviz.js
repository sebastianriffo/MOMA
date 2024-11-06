/* selectmenu from QUERY UI */
$("#experience").selectmenu(); 
$("#variables").selectmenu(); 
$("#plots").selectmenu(); 
$("#timeResolution").selectmenu(); 
$("#spatialExtent").selectmenu(); 

/* panel selector */
function openTab(evt, tab) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(tab).style.display = "flex";
	evt.currentTarget.className += " active";
}

/* search bar */
function searchDynamicElement() {
//	setTimeout(function(){
		const search = document.getElementById("dataSearch");
		const labels = document.querySelector("#simulations").querySelectorAll(".dataset > label");

		const removeAccents = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		  
		search.addEventListener("input", () => Array.from(labels).forEach((element) => element.style.display = removeAccents(element.childNodes[0].id.toLowerCase()).includes(removeAccents(search.value.toLowerCase())) ? "inline" : "none"))
//	}, 250);
}


/* SELECTORS REQUIRING TO CONNECT TO A SERVER : 
- resourceList yields a list of available variables/datasets
*/
// pending : how to set this variable, how to detect which framework are we using (jekyll, spirit, thredds)
// IN THREDDS : url = "sreyes/dataviz/"
let source = "demo"
let url = "variables"

/* variable selector */
resourceList(source, url, "folder").then(function(elements) {
	let select = document.querySelector("#variables")

	for (let elt of elements){
		let option = document.createElement("option");
		option.text = elt;
		option.value = elt;
		select.appendChild(option);
	}
});

/* dataset selector */
$(".specs").on('selectmenuchange', function() { 
	const plot = document.getElementById('plots').selectedOptions[0].value;

	const experience = document.getElementById('experience').selectedOptions[0].value; 
	const variableName = document.getElementById('variables').selectedOptions[0].value;
	const timeRes = document.getElementById('timeResolution').selectedOptions[0].value;
	const spatialExt = document.getElementById('spatialExtent').selectedOptions[0].value;
	
	// list of simulations/observations
	for (let datasetType of document.getElementsByClassName("datasetList")){
		datasetType.innerHTML = '';	
	    	
		if ((variableName !== 'select') && (plot === 'TS')) {
			let v = "";		
			let type = datasetType.id.slice(0,3)
		
			/* testing on THREDDS with 
			("THREDDS", "psepulchre/DeepMIP/deepmip-eocene-p1/CESM/CESM1.2-CAM5/deepmip-eocene-p1-PI/v1.0/climatology", ".nc")
			("THREDDS", "sreyes/dataviz/"+variableName, ".nc")
			*/
			let path = [type, (type === "obs") ? "historical" : experience, variableName].join("/");
			
			resourceList(source, path, "file").then(function(elements) {
				for (let label of elements){
					v += '<div class="dataset"> <label for="' +label+ '"><input id="' +label+ '" class="'+type+'" type="checkbox"> '+label+ ' </label> </div>'
				}
				datasetType.innerHTML = v ? v : '<div class="dataset" style="padding-left:10px;">   Not available </div>';
			});
		}
	}
})


async function resourceList(source, directory, type) { 
	if (source === "spirit") {
		const flaskResponse = await fetch(`${window.origin}/${directory}`, {method : 'GET'})
							.then((response) => {
								if (response.ok) {
									return response.json();
								}						
							})
							.catch((error) => { console.log(error) });
							
		return flaskResponse;
	}
	/* complete selectors using THREDDS
	source: https://observablehq.com/@pbrockmann/wms-leaflet-map-deepmip
	*/
	else if (source === "THREDDS") {
		const xmlResponseDirectories = await fetch("https://thredds-su.ipsl.fr/thredds/catalog/ipsl_thredds/"+directory+"/catalog.xml")
							.then((response) => {
								if (response.ok) {
									return response.text();
								}						
							})
							.catch((error) => {
								console.log(error)
							});

		if (typeof xmlResponseDirectories !== 'undefined') {
			const catalog = new DOMParser().parseFromString(xmlResponseDirectories,"text/xml");
			
			if (type === "folder") {
				var ressourcesArray = Array.from(catalog.querySelectorAll("dataset > catalogRef"), 
									(n) => n.getAttribute("ID").replace("DatasetScanIPSLTHREDDS/" + directory +"/", ""));
			} else {
				var ressourcesArray = Array.from(catalog.querySelectorAll("dataset > dataset"),
									(n) => n.getAttribute("name")).filter((d) => d.endsWith(".nc"));	
			}
			return ressourcesArray;
		} else {
			return [];
		}
	}

	// unknown tree structure, used only for website development purposes		
	else {
		let path = window.location.origin+directory;

		return (type === "folder") ? ["gpp"] : ((directory === "sim/historical/gpp") ? ["ORCHIDEE_v4_r8520_A1_FG", "ORCHIDEE_v4_r8603_A_FG", "ORCHIDEE_v4_r8603_B_FG"] : []);
	}
};

/* variable selector
- https://stackoverflow.com/questions/53780838/populate-html-select-options-via-http-request

on THREDDS : const url = "sreyes/dataviz";
*/

