function buildTable(articles, searchText) {
	var table = document.createElement("table");
	table.id = "table";
	table.className = "table table-striped table-bordered table-sm"
	table.width = "100%";
	var tableHeading = `
	  <thead>
	    <tr>
	      <th class="th-sm">Published Date
	      </th>
	      <th class="th-sm">Headline
	      </th>
	      <th class="th-sm">Summary
	      </th>
	      <th class="th-sm">URL
	      </th>
	      <th class="th-sm">Source
	      </th>
	    </tr>
	  </thead>
    `;
    $(tableHeading).appendTo(table);
	var usage = document.querySelector(".usage");
	var tbody = document.createElement("tbody");
	for(var page=0; page<articles.length; page++) {
		for (var article = 0; article < articles[page].length; article++) {
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			td.append(articles[page][article]["pub_date"].substr(0,10));
			tr.append(td);
			td = document.createElement("td");
			td.append(articles[page][article]["headline"]["main"]);
			tr.append(td);
			td = document.createElement("td");
			td.append(articles[page][article]["abstract"]);
			tr.append(td);
			td = document.createElement("td");
			var a = document.createElement("a");
			a.href = articles[page][article]["web_url"];
			a.append(articles[page][article]["web_url"]);
			td.append(a);
			tr.append(td);
			td = document.createElement("td");
			td.append(articles[page][article]["source"]);
			tr.append(td);
			tbody.append(tr);
		}
	}
	table.append(tbody);
	usage.innerHTML = "<h5 style='color:#7a7a7a;'>Here are your search results for \"" + searchText + "\"</h5>";
	usage.append(table);
	usage.innerHTML += "<h5 id='loading'>Loading Chart...</h5>";
	setTimeout(function () {
		buildChart(searchText);
	}, 100);

	$("table").DataTable({
		 "ordering": false,
		  columnDefs: [ {
	        targets: [1,2],
	        render: function ( data, type, row ) {
	            return type === 'display' && data.length > 10 ?
			        data.substr( 0, 100 ) +'…' :
			        data;
	        }
	    } ]


	});
	$('.dataTables_length').addClass('bs-select');
}

function buildChart(searchText) {
	var dataPoints = {};
    jQuery.ajaxSetup({async:false});
	for (var i = 2020; i >= 2011; i--) {
		$.get( `https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=pub_year:${i}&q=${searchText}&sort=newest&api-key=xrp7NPZMKRQ3U8nmHM5UMXu2XwBKYXei`, function( data ) {
			console.log(data.response["meta"]["hits"], i);
			dataPoints[i] = data.response["meta"]["hits"];
		});
	}
	var loading = document.querySelector("#loading");
	loading.parentNode.removeChild(loading);
	var canvas = document.createElement("canvas");
	canvas.id = "myChart";
	canvas.width = 900;
	canvas.height = 380;
	var usage = document.querySelector(".usage");
	usage.append(canvas);
	canvas = document.querySelector("canvas");
	var myChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
          datasets: [{
            data: [dataPoints[2011], dataPoints[2012], dataPoints[2013], dataPoints[2014], dataPoints[2015], dataPoints[2016], dataPoints[2017], dataPoints[2018], dataPoints[2019], dataPoints[2020]],
            lineTension: 0,
            backgroundColor: 'transparent',
            borderColor: '#007bff',
            borderWidth: 4,
            pointBackgroundColor: '#007bff'
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: false
              }
            }]
          },
          legend: {
            display: false,
          },
          title: {
          	display: true,
          	text: "Number of articles published for " + searchText
          }
        }
      });
}
	

function search() {
	var searchbox = document.querySelector("input");
	var noUsage = document.querySelector(".nousage");
	var usage = document.querySelector(".usage");
	noUsage.style = "display: none";
	usage.style = "min-height: 91vh";
	usage.innerHTML = "<h5>Loading ...</h5>";
	var searchText = searchbox.value;
	var articles = [];
	var totalArticles = 0;
	
	$.get( `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${searchText}&sort=newest&api-key=xrp7NPZMKRQ3U8nmHM5UMXu2XwBKYXei&&begin_date=20110101&end_date=20201231`, function( data ) {
		console.log(data);
	  articles.push(data.response["docs"]);
	  totalArticles = data.response["meta"]["hits"];
	  var offsets = totalArticles/10;
	  jQuery.ajaxSetup({async:false});
	  // Limit number of pages due to NYT number of consecutive requests limit
	  for (var page = 1; page < Math.min(offsets, 4); page++) {
		$.get( `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${searchText}&sort=newest&api-key=xrp7NPZMKRQ3U8nmHM5UMXu2XwBKYXei&&begin_date=20110101&end_date=20201231&page=${page}`, function( dataResponse ) {
			if(dataResponse.status != "OK") return;
            articles.push(dataResponse.response["docs"]);
		});
		if(page == Math.min(offsets, 4) - 1){
			buildTable(articles, searchText);
		}
	  }
	  if(Math.min(offsets, 4) <= 1){
			buildTable(articles, searchText);
		}
	});
	
}


var input = document.querySelector("input");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    event.preventDefault();
    search();
  }
});