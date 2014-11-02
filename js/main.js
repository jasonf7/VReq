var _AHS = 0;
var _ART = 1;
var _CGC = 2;
var _ENG = 3;
var _ENV = 4;
var _IS = 5;
var _MAT = 6;
var _REN = 7;
var _SCI = 8;
var _STJ = 9;
var _STP = 10;
var _VPA = 11;

var nodeSize = 3.5;

var margin = {top: 10, right: 50, bottom: 10, left: 50};
var width = ($(window).width()) - margin.left - margin.right;
var height = ($(window).height()/1.12) - margin.top - margin.bottom;

var dx=width/24;
var dy=height/8;

var CPM,svg,tree,root,xaxis,yaxis;

var xAxisScale,xBlandScale,yAxisScale,yBlandScale;
var gx,gy;

var maxDepth,duration,diagonal, i=0;
var treeNodes;

var nodeColors=new Array();



function getRandColor(){
	var randR = Math.floor(Math.random() * (255 + 1));
	var randG = Math.floor(Math.random() * (255 + 1));
	var randB = Math.floor(Math.random() * (255 + 1));
	var rgbString = "rgb("+randR+", "+randG+", "+randB+")"; // get this in whatever way.

	var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	// parts now should be ["rgb(0, 70, 255", "0", "70", "255"]

	delete (parts[0]);
	for (var i = 1; i <= 3; ++i) {
	    parts[i] = parseInt(parts[i]).toString(16);
	    if (parts[i].length == 1) parts[i] = '0' + parts[i];
	} 
	var hexString ='#'+parts.join('').toUpperCase();
	return hexString;
}

function setRandColors(){
	nodeColors["ECE"]=getRandColor();
	nodeColors["SE"]=getRandColor();
	nodeColors["CS"]=getRandColor();
	nodeColors["MATH"]=getRandColor();
	nodeColors["BIO"]=getRandColor();
	nodeColors["EARTH"]=getRandColor();
	nodeColors["AFM"]=getRandColor();
	nodeColors["ANTH"]=getRandColor();
	nodeColors["ARTS"]=getRandColor();
	nodeColors["COGSCI"]=getRandColor();
	nodeColors["ENGL"]=getRandColor();
	nodeColors["ESL"]=getRandColor();
	nodeColors["FINE"]=getRandColor();
	nodeColors["FR"]=getRandColor();
	nodeColors["GBDA"]=getRandColor();
	nodeColors["HIST"]=getRandColor();
	nodeColors["HRM"]=getRandColor();
	nodeColors["HUMSC"]=getRandColor();
	nodeColors["KOR"]=getRandColor();

}

function getFacInt(facString){
    var name = "_"+facString;
    return window[name];
}

function getRandCoord(faculty, year){
    var initX = CPM[getFacInt(faculty)][year].x;
    var initY = CPM[getFacInt(faculty)][year].y;
    var randX = Math.floor(Math.random() * ((initX+dx) - (initX-dx) + 1))+ (initX-dx);
    var randY = Math.floor(Math.random() * ((initY+dy) - (initY-dy) + 1))+ (initY-dy);
    var coord = {x: randX, y: randY};
    return coord;
}   

function createGraph(){
	xAxisScale = d3.scale.ordinal().domain(["AHS","ART","CGC","ENG","ENV","IS","MAT","REN","SCI","STJ","STP","VPA"]).rangeBands([0,width]);
	xBlandScale = d3.scale.ordinal().domain(["","","","","","","","","","","",""]).range([0,width]);
	yAxisScale = d3.scale.ordinal().domain([4,3,2,1]).rangeBands([height, 0]);
	yBlandScale = d3.scale.ordinal().domain(["","","",""]).range([height, 0]);
	xaxis = d3.svg.axis()
	            .orient("bottom")
	            .scale(xAxisScale);
	yaxis = d3.svg.axis()
	            .orient("left")
	            .scale(yAxisScale);
	svg = d3.select("body").append("svg")
	    .attr("width", width+margin.left+margin.right)
	    .attr("height", height+margin.bottom+margin.top+20)
	  .append("g")
	    .attr("transform", "translate("+margin.left+","+margin.top+")");
	gx = svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xaxis);
	gy = svg.append("g")
	    .attr("class", "axis")
	    .call(yaxis);

	CPM=new Array();
	for(var i=0; i<12; i++){
	    CPM[i]=new Array();
	}

	for(var i=0; i<12; i++){
	    for(var j=0; j<4; j++){
	        var xVal = dx+dx*2*i;
	        var yVal = dy+dy*2*j;
	        var coord = {x: xVal, y: yVal};
	        CPM[i][j]=coord;
	        console.log(i+ "," + j + ": (" + xVal + "," + yVal + ")");
	        /*svg.append("circle")
	                .attr("cx", coord.x)
	                .attr("cy", coord.y)
	                .attr("r", 2);*/
	    }
	}
}

function collapse(d){
	if(d.children){
		d._children = d.children;
		d._children.forEach(collapse);
		d.children = null;
	}
}

function createTree(){

	tree = d3.layout.tree().size([width,height]);
	diagonal = d3.svg.diagonal()
	    .projection(function(d) { return [d.x, (height-d.y)]; });
	duration = 750;
	maxDepth=0;


	root.x0 = width/2;
	root.y0 = 25;
	tree.nodes(root).forEach(function(d) { 
		if(d.depth > maxDepth) maxDepth = d.depth;
	});

	//root.children.forEach(collapse);
	//collapse(root);
	update(root);
}

function update(source) {
  // Compute the new tree layout.
  treeNodes = tree.nodes(root);
  var links = tree.links(treeNodes);

  // Normalize for fixed-depth.
  console.log(maxDepth);
  treeNodes.forEach(function(d) { 
  					console.log(d);
  					var newY = d.depth * (height/maxDepth)+25;
  					if(newY > height)
  						newY=height-20;
  					d.y = newY;
  				});

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(treeNodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.x0 + "," + (height-source.y0) + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
      .append("svg:title")
   		.text(function(d) { return "Name: ".concat(d.title).concat("\nDesc: ").concat(d.description); });

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.x + "," + (height-d.y) + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 15)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1)
      .attr("y", function(d) { 
	  	return d.children || d._children ? -18 : 18; })
	  .attr("dy", ".35em");

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.x + "," + (height-source.y) + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  treeNodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

$(document).keyup(function(e){
	if (e.keyCode == 27) { 
   		transitionOut();
	}
});

function transitionIn(callback){
	var node = svg.selectAll(".node")
					.transition()
					.delay(2000)
				.attr("r", 1)
				.duration(2000); // this is 1s
				
	var node = svg.select(".CS488")
				.transition()
				.delay(4000)
				.attr("r", 15)
				.attr("cx",width/2)
				.attr("cy",height-margin.bottom-margin.top)
				.duration(2000); // this is 1s
	setTimeout(callback,7000);
	var node = svg.select(".CS488")
				.transition()
				.delay(6000)
				.attr("r", 0)
				.duration(1000);
}

function transitionOut(){
	var node = svg.select(".CS488")
					.transition()
					.delay(1000)
					.attr("r", 15)
					.duration(1000)
					.transition()
					.delay(2000)
					.attr("r",1)
					.attr("cx",function(d) {return d.x; })
					.attr("cy",function(d) {return d.y; })
					.duration(2000); // this is 1s2			
				
	var node = svg.selectAll(".node")
   					.transition()
					.delay(4000)
					.attr("r", nodeSize)
					.duration(2000); // this is 1s
	
	if(root.children){
		root.children.forEach(collapse);
		collapse(root);
		update(root);
	}
	setTimeout(function(){
		svg.selectAll("g.node").remove();
	},1000);
	setTimeout(function(){
		xaxis.scale(xAxisScale);
	   	gx.call(xaxis);
		yaxis.scale(yAxisScale);
	   	gy.call(yaxis);
	},3000);	
}

function renderTree(subj, cat_num){
	waterlooDAL.getPreqs(subj, cat_num, function(data){
		console.log(data);
		if(root){
			transitionOut();
		}
		
		root=data;
		transitionIn(function (){
	   		createTree();
	   		xaxis.scale(xBlandScale)
	   		gx.call(xaxis)
		    yaxis.scale(yBlandScale)
	   	    gy.call(yaxis)
	   		//svg.selectAll("g.node").data(treeNodes).exit().remove();
	   	});
	});
}

waterlooDAL.getAllCourses(function(courses){
	setRandColors();
    console.log(courses);
    $("#title-bar").show();
    $("#loading-text").hide();
    createGraph();
    var nodes = []
    var force = d3
    for(fac in courses) {
        for(var i=0; i< courses[fac].length; i++){
            var courseObj = courses[fac][i];
            var year = parseInt(courseObj.catalog_number.charAt(0));
            if(year < 5){
                var randCoord = getRandCoord(fac,year-1);
                courseObj.x=randCoord.x;
                courseObj.y=randCoord.y;
                nodes.push(courseObj);
            }
        }
    }
    console.log("DONE");
    var force = d3.layout.force()
        .charge(0)
        .gravity(0)
        .size([width+margin.left+margin.right,height+margin.bottom+margin.top+10]);
		
   	force.nodes(nodes).start();
	var node = svg.selectAll(".node")
	   					.data(nodes)
	   				  .enter().append("circle")
						.attr("r", 0)
	   				    .attr("class", function(d) {return d.subject.concat(d.catalog_number).concat(" node"); })
	   				    .attr("cx", function(d) {return d.x; })
	   				    .attr("cy", function(d) {return d.y; })
	   				    .style("fill", function (d) { return nodeColors[d.subject]; })
						.transition()
						.attr("r", nodeSize)
						.duration(2000);
					  
	   	

   	/*transitionIn(function (){
   		createTree();
   		xaxis.scale(xBlandScale)
   		gx.call(xaxis)
	    yaxis.scale(yBlandScale)
   	    gy.call(yaxis)
   		//svg.selectAll("g.node").data(treeNodes).exit().remove();
   	});*/
				
   	/*xaxis.scale(xBlandScale)
   	gx.call(xaxis)
	yaxis.scale(yBlandScale)
   	gy.call(yaxis)*/
	/*
	xaxis.scale(xAxisScale);
   	gx.call(xaxis);
	yaxis.scale(yBlandScale);
   	gy.call(yaxis);
	*/
});