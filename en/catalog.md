---
layout: dashboard

title: Catalog

lang: en
ref: catalog

published: True
order: 2

excerpt_separator: <!--more-->

customjs:
- https://code.jquery.com/jquery-3.7.0.js
- https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.1/moment.min.js
- https://code.jquery.com/ui/1.13.2/jquery-ui.js
- https://cdn.datatables.net/2.1.8/js/dataTables.js
- https://cdn.datatables.net/2.1.8/js/dataTables.jqueryui.js
- https://cdn.datatables.net/searchpanes/2.3.3/js/dataTables.searchPanes.js
- https://cdn.datatables.net/searchpanes/2.3.3/js/searchPanes.jqueryui.js
- https://cdn.datatables.net/select/2.1.0/js/dataTables.select.js
- https://cdn.datatables.net/select/2.1.0/js/select.jqueryui.js
- https://cdn.datatables.net/plug-ins/1.13.7/filtering/type-based/accent-neutralise.js

customcss:
- https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css
- https://cdn.datatables.net/2.1.8/css/dataTables.jqueryui.css
- https://cdn.datatables.net/searchpanes/2.3.3/css/searchPanes.jqueryui.css
- https://cdn.datatables.net/select/2.1.0/css/select.jqueryui.css

---
<div class="dtsp-verticalContainer">
        <div class="dtsp-verticalPanes" style="width:300px; height:calc(100vh - 94px); position: sticky; top: 63px; padding-top: inherit;"></div>
        
	<div class="container">
  		<table id="example">
      		<thead>
          		<tr>
		      	<th></th>
		      	<th>surface component</th>
		      	<th>name</th>
		      	<th>budget</th>
		      	<th>variable</th>
		      	<th>spatial resolution</th>
		      	<th>spatial extent</th>
		      	<th>temporal range (min)</th>
		      	<th>temporal range (max)</th>
		      	<th>temporal resolution</th>
		      	</tr>
		</thead>
		</table>
	</div>
</div>

<!-- sources: 
https://live.datatables.net/jorexujo/678/edit 
https://datatables.net/examples/api/row_details.html
https://datatables.net/extensions/searchpanes/examples/
-->

<script src="js/catalog_dataTables.js"></script>

<link rel="stylesheet" href="css/catalog.css">
