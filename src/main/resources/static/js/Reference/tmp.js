/*
 * Performs some general setup of the annual tab.
 * hide building selection box, display the annual consumption selection box.
 * display the year selection.
 * Add click events to the year buttons, which trigger the displayMainContent function.
 */
drawAnnualChart(years, consumptionType, data1, data2);
var localYears, localConsumptionType, localData1, localData2;

function drawLocal(){
    drawAnnualChart(localYears, localConsumptionType, localData1, localData2);
}

function setupAnnualTab(){
	$("#building_select").hide();
	
    // populate annual consumption select
    populateConsumptionSelectAnnual();
    $("#consumption_select_annual").show();
    $("#data_title").text("Annual Energy Consumption & EUI - " + campusName + (hasFullCampus() ? " Campus" : "")).show();
    $("#year_select").show(); 
	var maxYear = new Date().getFullYear()-1;		// completed done by jasman singh sahi // fiscal // year
	//-1 just for annual tab since the latest year has only partial data 												
													
	populateYearSelect(2, maxYear);// check data and with peter
	
	// allows selection of up to 2 years at a time
	$(".year_button").click(function(event){
		
		var yearClicked = $(event.target).attr("data-year");

		if(yearClicked == yearStack[0]){
			// first year unchecked
			deselectYear(yearStack[0]);
			yearStack.shift();
		}
		else if(yearClicked == yearStack[1]){
			// second year unchecked
			deselectYear(yearStack[1]);
			yearStack.pop();
		}
		else {
			// a new year checked
			selectYear(yearClicked);
			yearStack.push(yearClicked);

			if(yearStack.length > 2){
				// this is the third year checked (which unchecks the first)
				deselectYear(yearStack[0]);
				yearStack.shift();
			}
		}

		// finished changing year selection, display content
		displayMainContent();
	});

	// finished setup, display content (if nothing selected, will display helper images)
	displayMainContent();
}

/*
 * handles display of everything on the Annual tab
 * retrieves data, processes and then calls the drawAnnualChart function, 
 * to draw the annual consumption bar chart.
 */
function displayAnnualPage(){

	// get consumption type or show instruction
	var consumptionType = getConsumptionType();
	if (!consumptionType) {
		showInstructionConsumptionAnnual();
	}else{
		if (consumptionType.substring(0,3)=="EUI"){
			$("#data_title").text("Annual Energy EUI - " + campusName + (hasFullCampus() ? " Campus" : "")).show();
		}else{
		    $("#data_title").text("Annual Energy Consumption - " + campusName + (hasFullCampus() ? " Campus" : "")).show();
		}
	}
	
	// get years or show instruction
	var years = getYears();
	if (years.length == 0) {
		showInstructionYearsTwo();
	}

	// if no consumption type or no years selected, do nothing
	if ( !consumptionType || years.length == 0)
		return;

	/*
	 * changes value of -1 to 0, and removes EUI notation if value is greater
	 * than 0, consumption notation if it returns OK
	 */
    function modifyData(d) { 	
    	if (d.notation == "OK" || (consumptionType == "EUI" || consumptionType == "EUI_ELE" || consumptionType == "EUI_NG" || consumptionType == "EUI_STM") && d.value > 0)
    		d.notation = "";
    	
    	if (d.value < 0)
    		d.value = 0;
    }


    /*
     * function to be executed when the annual data returns
     * data2 only needs to be provided if two years are selected
     */
	function dataCallback(data1, data2){
		
		// cancel if the user has made changes to the selection
		if (!verifySelection("annual_consumption", null, consumptionType, years))
			return;

		// JS (2019-11-28)
		// this is weird and probably doesn't do anything
		// data1 is an array of objects corresponding to each building.
		// if the before last object notation has "No meter" then we make all data undefined???
		// furthermore, setting data1=undefined breaks everything anyways.
//		if (data1 != undefined) {
//			var len = data1.length;
//			console.log("data1:")
//			console.log(len)
//			for (var i = 0; i < len; i++) {
//				console.log(i)
//				console.log(data1[i])
//				if (data1[i].notation != "No meter")
//					break;
//				else if (i == data1.length-1 && data1[i].notation == "No meter")
//					data1 = undefined;
//			}
//		}
//
//		if (data2 != undefined) {
//			var len = data2.length;
//			for(var i = 0 ; i < len ; i++){
//				if(data2[i].notation != "No meter")
//					break;
//				else if(i == data2.length-1 && data2[i].notation == "No meter")
//					data2 = undefined;
//			}
//		}
		
		// if datasets are undefined, display no data
		// if one dataset is undefined, swap it
		if (!data1 && !data2) {
			showNoData();
			return;
		} else if (!data1 && data2) {
			data1 = data2;
			data2 = undefined;
		}
		
		// format and sort data1
		data1.forEach(modifyData);
		data1.sort(function(a, b) {
	        return d3.descending(a.value, b.value);
	    });
		
		// format data2 but no need to sort because its values will get matched
		// automatically with the values in data1
		if (data2) data2.forEach(modifyData);
            
        localConsumptionType = consumptionType;
        localData1 = data1;
        localData2 = data2;

		// create annual bar chart with one or two sets of data
        drawAnnualChart(years, consumptionType, data1, data2);
        
	};
	
	// toggle EUI variable
	// is not used anywhere
//	var eui = false;
//	if (consumptionType.includes("EUI")){
//		eui = "kWh";
//	}
	
	// get unit for consumption type
	
	//WRONG YZHAO
//	var unit = {"Electricity": "kWh", "Natural_Gas": "kWh", "Steam": "kWh"}[consumptionType];
//	if (unit == undefined)
//		unit = "kWh";
//	
	// not currently used for anything
//	var bldgIds = getAllBuildings().map(function(b) { return b.id }).join(",");
	
	// Get the first year consumption
    var firstYear = stdGet("wsapi/campuses/" + campusNumber + "/annualConsumption", "type=" + consumptionType + "&fy=" + years[0]);
    localYears = firstYear;
	// if a second year is selected, get the data
	// perform necessary data processing
	if (years.length == 2) {

		var secondYear = stdGet("wsapi/campuses/" + campusNumber + "/annualConsumption", "type=" + consumptionType + "&fy=" + years[1]);
		
		$.when(firstYear, secondYear).done(function(data1, data2) {
			// unwrap the actual data object (only necessary inside a $.when())
			
			if (data1[0] == undefined & data2[0] != undefined) {
				data2 = data2[0].bldgAnnualConsList;
//				data2.unit = secondYear.unit;
				data2.unit = secondYear.responseJSON.unit;
				dataCallback(data2);
			}
			else if (data1[0] != undefined & data2[0] == undefined) {
				data1 = data1[0].bldgAnnualConsList;
				data1.unit = firstYear.responseJSON.unit;
				dataCallback(data1);
			}
			else if (data1[0] == undefined && data2[0] == undefined) {
				return;
			}
			else {
				data1 = data1[0].bldgAnnualConsList;
				data2 = data2[0].bldgAnnualConsList;
//				data1.unit = unit;
				data1.unit = firstYear.responseJSON.unit;
				data2.unit = secondYear.responseJSON.unit;
				dataCallback(data1, data2);
			}
		});
	}
	else {
		// only one year is selected
		// perform necessary data processing
		firstYear.done(function(data1) {
			if (data1 == undefined)
				return;
			
			data1 = data1.bldgAnnualConsList;
			if (data1[0] != undefined)
//				data1.unit = unit;
				data1.unit = firstYear.responseJSON.unit;
			dataCallback(data1);
		});
	}
}

/*
 * Draws the annual energy consumption and EUI chart, in the Annual tab.
 * bar chart, buildings on the y-axis, consumption on the x-axis.
 * 
 * NOTE: Be very careful not to directly modify any of the objects passed
 * into the function, as you may want to call this function again to
 * re-display the data
 * 
 * years:              an array of selected years
 * consumptionType:    the type of utility
 * data1, data2:       arrays of objects representing energy consumption per building.
 */
function drawAnnualChart(years, consumptionType, data1, data2){
	// NOTE: Be very careful not to directly modify any of the objects passed
	// into the function, as you may want to call this function again to
	// re-display the data

	// create a new array that is the concatenation of data1 and data2
	var allData = [];
	var mapIdNotationData1 = {}; //{id:notation}
	var mapIdNotationData2 = {};
	var tmpReference = [];
//	tmpReference.push({name:"Reference #1.",value:1000});
//	tmpReference.push({name:"Reference #2.",value:2000});
//	tmpReference.push({name:"Reference #3.",value:3000});
//	tmpReference.push({name:"Reference #4.",value:4000});
//	tmpReference.push({name:"Reference #5.",value:5000});
//	tmpReference.push({name:"Reference #6.",value:6000});
//	tmpReference.push({name:"Reference #7.",value:7000});
	allData.unit = data1.unit;
	
	
	
	/*
	 * when show two years, if one of the two years have valid return true
	 * if not hiding data, return true
	 */
	function checkValid(index,data){
		var data1Valid = mapIdNotationData1[data[i].bldgId] === "" || 
        		mapIdNotationData1[data[i].bldgId].substring(0,12) === "Partial data";
		var data2Valid = mapIdNotationData2[data[i].bldgId] === "" || 
				mapIdNotationData2[data[i].bldgId].substring(0,12) === "Partial data";
		var notHideMissingData = !$("#hideData").is(':checked');
		return data1Valid || data2Valid || notHideMissingData;
	}
	
	/*
	 * return false if the data is filtered
	 */

	function checkCategory(index,data){
		var show = true;
		for (var i=0; i<tmpCategory.length; i++){
			if (!$("#hideCategory_"+i).is(':checked')){
				// check valid
				if (mapType[data[index].bldgId] == tmpCategory[i]){
					show = false;
				}
			}
		}
		return show;
	}

	if (data2) {
    	for (var i = 0; i < data1.length; i++) {
            mapIdNotationData1[data1[i].bldgId] = data1[i].notation;
        }
    	
    	for (var i = 0; i < data2.length; i++) {
            mapIdNotationData2[data2[i].bldgId] = data2[i].notation;
        }
    	
    	for (var i = 0; i < data1.length; i++) {
	        if (checkValid(i,data1) && checkCategory(i,data1))// only show filtered data that are not missing
	        	allData.push(data1[i]);//	           
	    }
        for (var i = 0; i < data2.length; i++) {
        	if (checkValid(i,data2) && checkCategory(i,data2))// only show filtered data that are not missing
                allData.push(data2[i]);
        }
    } else {
    	for (var i = 0; i < data1.length; i++) {
	        if ((data1[i].notation === "" || data1[i].notation.substring(0,12) === "Partial data" || !$("#hideData").is(':checked')) && checkCategory(i,data1))// only show filtered data that are not missing
	        	allData.push(data1[i]);
	    }
    }

    // Create chart1 div in #page div
    $("#page").empty();
    $("#page").append("<div id='chart1' class='chart'></div>");
    
    // add notice that you can hover over the graph's labels for the full name
    $("#chart1").append("<p class='tip'>Hover over a bar or building label for additional info. " +
    		"<br/> <span style='color: grey;'>* Partial data: hover for details.</span> </p>");

    // Create margin variable
    var margin = {
    	top: 40,
    	right: 100,
    	bottom: 30,
    	left: 60
    };

    // work out the dimensions of the chart
    // calculate height using a formula that ensures the bars won't be too small
    var width = $("#chart1").width() - margin.left - margin.right;
    var basicHeight = 400 + 7 * allData.length;
    var minHeight = 16 * allData.length + margin.top + margin.bottom;
    var maxHeight = 16 + 40 * allData.length + margin.top + margin.bottom; // added 16 to fix the issue of too small

    var height = Math.min(Math.max(basicHeight, minHeight), maxHeight) - margin.top - margin.bottom;
    var pad = 0.1;

    // Creates x and y values/functions
    var x = d3.scaleBand().rangeRound([0, height]).padding(pad),
        y = d3.scaleLinear().rangeRound([0, width - 40]);

    // set domains
    x.domain(allData.map(function(d) {
//        return d.bldgEmsRef;
        return d.buildingName;
    }));
    
    y.domain([0, 1.1 * d3.max(allData, function(d) {
        return d.value
    })]);

    // Creates x-axis and y-axis objects
    var xAxis = d3.axisLeft()
        .scale(x);

    var yAxis = d3.axisTop()
        .scale(y)
        .tickFormat(d3.format(",")) // for the format in millions (1e6)
        .ticks(Math.max(width/70, 2));

    legendLength = years.length * 25 + 30 + tmpReference.length * 55;
    // Creates svg element in chart1 div
    var svg = d3.select("#chart1").append("svg")
        .attr("width", width + margin.left + margin.right+300)// 300 for long legend name.
        .attr("height", height < legendLength ? legendLength : height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Sets colors
    var color1 = {
        "Total": "#7b6888",
        "EUI":   "#7b6888",
        "Electricity": "#c3d69b",
        "EUI_ELE":     "#95b850",
        "Heating":  "#ff6969",
        "Natural_Gas": "#fac090",
        "Steam": "#d99694",
        "EUI_HEAT": "#ff6969",
        "EUI_NG": "#ff6969",
        "Cooling":  "#75a4dd",
        "EUI_COOL": "#75a4dd",
        "EUI_STM": "#75a4dd"
    }[consumptionType];
    
    var color2 = {
        "Total": "#660366",
        "EUI":   "#660366",
        "Electricity": "#96a577",
        "EUI_ELE":     "#c3d69b",
        "Heating":  "#ff9b9b",
        "Natural_Gas":  "#f9d4b6",
        "EUI_HEAT": "#ff9b9b",
        "EUI_NG": "#ff9b9b",
        "Cooling":  "#4383d1",
        "Steam":  "#e2b4b3",
        "EUI_COOL": "#4383d1",
        "EUI_STM": "#4383d1"
    }[consumptionType];

    var referenceColors = ["rgb(255, 0, 0)","rgb(0, 0, 255)","rgb(255, 165, 0)","rgb(60, 179, 113)","rgb(238, 130, 238)","rgb(106, 90, 205)","rgb(91, 255, 255)"];
    
    // attach a definitions tag to the svg
    var defs = svg.append("defs");

    // function that creates a hashed pattern of the given color
    function createPattern(givenID, givenFill){
        var pattern = defs.append("pattern")
        	.attr("id", givenID)
        	.attr("width", 8)
        	.attr("height", 8)
        	.attr("patternUnits", "userSpaceOnUse")
        	.attr("patternTransform", "rotate(45)");

        pattern.append("rect")
        	.attr("width", 7)
        	.attr("height", 8)
        	.attr("fill", givenFill);
    }
    
    
    createPattern("hashed_1", color1);
    var pattern1 = "url('#hashed_1')";

    createPattern("hashed_2", color2);
    var pattern2 = "url('#hashed_2')";

    // used in the CSS with the .bar.highlighted.hashed class
    createPattern("hashed_highlighted", "orangered");

    var numberFormat = d3.format(".3f");

    
    
    
    
    // draw out the bars
    var infoBar = svg.selectAll("rect.bar")
        .data(allData)
        .enter().append("rect")
        .attr("class", function(d) {
        	// the class added here will determine highlight styling
            return "bar " + (d.notation == "" ? "solid" : "hashed");
        })
        .attr("x", 0)
        .attr("y", function(d, i) {
            if (i < (data2 ? allData.length/2 : data1.length))
                return x(d.buildingName);
            else return x(d.buildingName) + x.bandwidth() / 2;
        })
        .attr("width", function(d) {
            return y(d.value);
        })
        .attr("height", data2 ? x.bandwidth() / 2 : x.bandwidth()) // bandwidth
        .style("fill", function(d, i) {
        	// choose colour and pattern
            if (i < (data2 ? allData.length/2 : data1.length))
            	return d.notation == "" ? color1 : pattern1;
            else return d.notation == "" ? color2 : pattern2;
        });
    
    
 // helper functions
    function drawLine(svg, x1, y1, x2, y2, color, strokeWidth, opacity, value, i) {
    	let tmp = svg.append("line")
    		.attr("class", "ref")
    		.attr("id","ref_"+i)
    	    .attr("stroke",color)
    		.attr("opacity",opacity)
    		.attr("stroke-width",strokeWidth)
    		.attr("x1",x1)
    		.attr("y1",y1)
    		.attr("x2",x2)
    		.attr("y2",y2);
    	return tmp;
    }
    
    var reference = [];
    for (var i=0; i<tmpReference.length; i++){
    	reference[i] = drawLine(svg, y(tmpReference[i].value), 0, y(tmpReference[i].value), height, referenceColors[i], 2, 0.2, tmpReference[i].value, i);
    }
    
	
     

    
    
    // draw y axis
    svg.append("g")
        .attr("class", "axisy")
        .call(yAxis)
        .append("text")
        .attr("class", "unit")
        .attr("y", -7) // PLACE OF LABEL
        .attr("dy", ".71em")
        .attr("x", width - 25)
        .style("text-anchor", "start")
        .text(allData.unit);
    
    // create x axis
    svg.append("g")
        .attr("class", "axisx")
        .call(xAxis);
    
	// show tooltip when hovering over building labels
    svg.selectAll(".axisx .tick")
        .data(allData)
        .on("mouseenter", function(d) {
            d3.select(this).select("text").classed("highlighted", true);
            showTooltip(d.bldgEmsRef, d3.event.pageX, d3.event.pageY);
//            showTooltip(d.buildingName, d3.event.pageX, d3.event.pageY);
        })
        .on("mouseleave", function(d) {
            d3.select(this).select("text").classed("highlighted", false);
            hideTooltip();
        });

	// show texts in the bars
    svg.selectAll("text.bar")
        .data(allData)
        .enter()
        .append("text")
        .attr("class", "bar")
        .attr("x", function(d) {
            return y(d.value);
        })
        .attr("y", function(d, i) {
            if (i < (data2 ? allData.length/2 : data1.length)) {
                return x(d.buildingName);
            } else {
            	return x(d.buildingName) + x.bandwidth() / 2;
            }
        })
        .attr("dy", height * pad / allData.length + height * (1 - pad) / allData.length * 0.5) // 1em
        .attr("dx", "1em")
        .style("text-anchor", "start")
        .style("dominant-baseline", "middle")
        .style("font-size", Math.min(data2 ? x.bandwidth() / 2 : x.bandwidth(), 16) + "px")
        .style("fill", function(d){
        	return d.notation == "" ? null : "grey";
        })
        .text(function(d) {
        	if(d.notation == "")
        		return parseInt(d.value);
        	else return d.value == 0 ? ($("#hideData").is(':checked')? "":d.notation) : parseInt(d.value)+" *";
//        	else return d.value == 0 ? (d.notation) : numberFormat(d.value)+" *";
        });

    // handles rect.bar and text.bar
    svg.selectAll(".bar") 
	    .on("mouseenter", function(d) {
	        d3.selectAll(".bar").filter(function(d2){
	        	return d2 == d; // highlights both the rect and text, regardless
								// of which was selected
	        }).classed("highlighted", true);

	        showTooltip(d.buildingName + "<br>" + numberFormat(d.value) + " " + allData.unit + "<br> <span style='color: yellow;'>" + d.notation + "</span>",
            		d3.event.pageX, d3.event.pageY);
	    })
	    .on("mouseleave", function(d, i) {
	    	d3.selectAll(".bar").filter(function(d2){
	        	return d2 == d; // removes highlight on both the rect and text,
								// regardless of which was selected
	        }).classed("highlighted", false);

	    	hideTooltip();
	    });
    
    svg.selectAll(".ref") 
    .on("mouseenter", function(d) {
        showTooltip(tmpReference[this.id.split("_")[1]].value,d3.event.pageX, d3.event.pageY);
    })
    .on("mouseleave", function(d, i) {
    	hideTooltip();
    });


//    Not necessary, we already have a variable to hold the years
//
//    var legendData = new Array();
//    legendData.push( {"year": years[0]} );
//    
//    if (data2) {
//        legendData.push( {"year": years[1]} );
//    }
    
    // create an element to hold the legend
    
    
	
	
    var legend = svg.append("g")
        .attr("class", "legend");
    
    
    legend.selectAll("g")
        .data(years)
        .enter()
        .append("g")
        .each(function(d, i) {
        	
            var g = d3.select(this);
            var legCol = (i == 0) ? color1 : color2;

            g.append("rect")
                .attr("x", width - 20)
                .attr("y", i * 25 + 30)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", legCol);

            g.append("text")
                .attr("x", width - 5)
                .attr("y", i * 25 + 40)
                .attr("height", 30)
                .attr("width", 100)
                .style("fill", legCol)
        	    .style("font-size", "16px")
                .text(years[i]);
        });
    
    var legendRef = svg.append("g")
    	.attr("class", "legend");


    legendRef.selectAll("g")
		.data(tmpReference)
		.enter()
		.append("g")
		.each(function(d, i) {
			
		    var g = d3.select(this);
		    var legCol = referenceColors[i];
		
		    g.append("line")
		        .attr("x1", width - 20)
		        .attr("y1", (i+years.length) * 25 + 34)
		        .attr("x2", width - 10)
		        .attr("y2", (i+years.length) * 25 + 34)
		        .attr("opacity",1)
		        .attr("stroke-width",2)
		        .style("stroke", legCol);
		
		    g.append("text")
		        .attr("x", width - 5)
		        .attr("y", (i+years.length) * 25 + 40)
		        .attr("height", 30)
		        .attr("width", 100)
		        .attr("id","legendText_"+i)
		        .style("fill", legCol)
			    .style("font-size", "16px")
			    .style("cursor", "pointer")
		        .text(tmpReference[i].name);
		});
	
	for (var i=0; i<tmpReference.length; i++){
		document.getElementById("legendText_"+i).onclick = function(){
			var id = parseInt(this.id.split("_")[1]);
			var line = document.getElementById("ref_"+id);
			if (line.style.display === "none") {
				line.style.display = "block";
			  } else {
				line.style.display = "none";
			  }
		}
	}
	// if no data, hide legend
	if (allData.length==0){
		$(".legend").hide();
	}
	
}
	
	


	