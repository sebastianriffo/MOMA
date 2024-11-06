---
layout: dashboard

title: Dataviz

lang: en
ref: dataviz

published: True
order: 3

excerpt_separator: <!--more-->

customjs:
- https://code.jquery.com/jquery-3.7.0.js
- https://code.jquery.com/ui/1.13.2/jquery-ui.js
- https://cdn.datatables.net/select/2.1.0/js/select.jqueryui.js

customcss:
- https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css
- https://cdn.datatables.net/select/2.1.0/css/select.jqueryui.css

---
<!--
<div class="container">
-->
<div class="row-about">	
	<div class="col" id="LHSP" style="height:calc(95vh - 94px);">
		<div class="tab">
			<button class="tablinks" style="width:50%" onclick="openTab(event, 'figures')"> Figures </button>
			<button class="tablinks" style="width:50%" onclick="openTab(event, 'data')"> Datasets </button>
		</div>	
	
		<div id="figures" class="panel tabcontent" style="width:300px; height:calc(95vh - 141px); display:flex; flex-direction: column;"> 
			<div>
			<legend>Plot</legend>	
			<select id="plots" class="specs" style="width:100%;"> 
				<option value="select" selected disabled> Select </option>
				<option value="TS" selected="selected"> Time Series </option>
				<option value="maps"> Maps </option>			
			</select>			
			</div>		
			
			<hr style="background-color:#7f7f7f; margin:12px 0px 12px 0px;">
		
			<div style="margin:0px 0px 12px 0px;">
			<legend>Experience</legend>
			<select id="experience" class="specs" style="width:100%"> 
				<option value="select" selected disabled> Select </option>
				<option value="historical" selected="selected"> Historical </option>
				<option value="transient"> Transient </option>
				<option value="spinup"> Spinup </option>	
			</select>
			</div>

			<div>
			<legend>Variable</legend>
			<select id="variables" class="specs" style="width:100%"> 
				<option value="select" selected disabled> Select </option>
			</select>
			</div>		
			<hr style="background-color:#7f7f7f; margin:12px 0px 12px 0px;">

			<div style="margin:0px 0px 12px 0px;">
			<legend> Time resolution </legend>
			<select id="timeResolution" class="specs" style="width:100%"> 
				<option value="select" selected disabled> Select </option>
				<option value="yearly" selected="selected"> Yearly </option>
				<option value="monthly"> Monthly </option>
				<option value="daily"> Daily </option>
				<option value="seasonal"> Seasonal (DJF MAM JJA SON) </option>
			</select>			
			</div>	
			
			<div style="margin:0px 0px 12px 0px;">
			<legend> Temporal range </legend>
			<input type="date" class="specs" id="startDate"/>  
			<input type="date" class="specs" id="endDate"/> 
			</div>	
						
			<div>
			<label for="regions"> Spatial extent </label>
			<select id="spatialExtent" class="specs" style="width:100%"> 
				<option value="select" selected disabled> Select</option>
				<option value="global" selected="selected">Global land</option>
				<optgroup label="Latitude bands">
					<option value="north">Northern land</option>
					<option value="tropical">Tropical land</option>
					<option value="south">Southern land</option>
				</optgroup>

				<optgroup label="TRANSCOM regions">
					<option value="Boreal_North_America_TrCom">Boreal North America</option>
					<option value="Temperate_North_America_TrCom">Temperate North America</option>
					<option value="Tropical_South_America_TrCom">Tropical South America</option>
					<option value="South_America_Temperate_TrCom">Temperate South America</option>
					<option value="Europe_TrCom">Europe</option>
					<option value="Boreal_Asia_TrCom">Boreal Asia</option>
					<option value="Temperate_Asia_TrCom">Temperate Asia</option>
					<option value="Tropical_Asia_TrCom">Tropical Asia</option>
					<option value="North_Asia_TrCom">North Africa</option>
					<option value="South_Africa_TrCom">South Africa</option>
					<option value="Australia__NewZealand_TrCom">Australia &amp; New Zealand</option>
				</optgroup>
			</select>			
			</div>			
			
			<!--
			<div>
			<legend><b>Figure specs</b></legend>
			</div>
			
			<div style="max-height:140px; overflow-y:auto;">
			<legend><b>Current datasets</b></legend>
			<form role="form" class="cat" id="dataSelected">						
			</form>
			</div>
			<hr style="background-color:#7f7f7f; margin:12px 0px 12px 0px;">
			-->				

		</div>
		
		<div id="data" class="panel tabcontent" style="width:300px; height:calc(95vh - 141px); display:none; flex-direction: column;">
			<input type="text" placeholder="Search..." id="dataSearch" onchange="searchDynamicElement(this)" style="max-width:100%; box-sizing: border-box; margin:0px 0px 12px 0px;"/>
	
			<div style="overflow-y:scroll; margin:0px 0px 12px 0px;">		
			<legend><b> Simulations </b></legend>	
			<form role="form" class="datasetList" id="simulations">
			</form>
			</div>			

			<div style="overflow-y:scroll;">		
			<legend><b> Observations </b></legend>	
			<form role="form" class="datasetList" id="observations">
			</form>
			</div>	
		</div>					
	</div>	

	<div class="col" id="col-dataviz" style="width:100%; height:calc(95vh - 94px); min-height:500px; padding:0px 10px 0px 10px; display: flex; justify-content: center;
    align-items: center;">
		<svg id="dataviz"></svg>
	</div>	
</div>

<!--
</div>
-->

<script src="js/dataviz.js"></script>
<script src="D3/datavizD3.js" type="module" ></script>

<link rel="stylesheet" href="css/dataviz.css">
