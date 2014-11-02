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

var margin = {top: 10, right: 50, bottom: 10, left: 50};
var width = ($(window).width()) - margin.left - margin.right;
var height = ($(window).height()/1.12) - margin.top - margin.bottom;

var dx=width/24;
var dy=height/8;

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

var xAxisScale = d3.scale.ordinal().domain(["AHS","ART","CGC","ENG","ENV","IS","MAT","REN","SCI","STJ","STP","VPA"]).rangeBands([0,width]);
var shiityScale = d3.scale.ordinal().domain(["","","","","","","","","","","",""]).range([0,width]);
var yAxisScale = d3.scale.ordinal().domain([4,3,2,1]).rangeBands([height, 0]);
var xaxis = d3.svg.axis()
            .orient("bottom")
            .scale(xAxisScale);
var yaxis = d3.svg.axis()
            .orient("left")
            .scale(yAxisScale);
var svg = d3.select("body").append("svg")
    .attr("width", width+margin.left+margin.right)
    .attr("height", height+margin.bottom+margin.top+10)
  .append("g")
    .attr("transform", "translate("+margin.left+","+margin.top+")");
var gx = svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);
var gy = svg.append("g")
    .attr("class", "axis")
    .call(yaxis);

var CPM=new Array();
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

var tree = d3.layout.tree().size([width,height]);
var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, (height-d.y)]; });
var duration = 750;
var root;
var maxDepth=0;


d3.json("testCourse.json", function(error, flare){
	console.log(flare);
	root=flare;
	root.x0 = width/2;
	root.y0 = 25;
	tree.nodes(root).forEach(function(d) { if(d.depth > maxDepth) maxDepth = d.depth; });
	function collapse(d){
		if(d.children){
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
		}
	}

	root.children.forEach(collapse);
	console.log(root);
	update(root);
});

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  console.log(maxDepth);
  nodes.forEach(function(d) { 
  					var newY = d.depth * (height/maxDepth)+25;
  					if(newY > height)
  						newY=height;
  					d.y = newY;
  				});

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.x0 + "," + (height-source.y0) + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

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
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

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
  nodes.forEach(function(d) {
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


waterlooDAL.getAllCourses(function(courses){
    console.log(courses);

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
					.transition()
					.attr("r", 2.5)
					.duration(2000);

	var node = svg.selectAll(".node")
   					.transition()
					.delay(2000) // this is 1s
					.attr("r", 1)
					.duration(2000); // this is 1s
					
	var node = svg.select(".CS488")
					.transition()
					.delay(4000)
					.attr("r", 15)
					.attr("cx",width/2)
					.attr("cy",height-margin.bottom-margin.top)
					.duration(2000); // this is 1s
				
	var node = svg.select(".CS488")
					.transition()
					.delay(6000)
					.attr("r", 1)
					.attr("cx",function(d) {return d.x; })
					.attr("cy",function(d) {return d.y; })
					.duration(2000); // this is 1s			
				
	var node = svg.selectAll(".node")
   					.transition()
					.delay(8000)
					.attr("r", 2.5)
					.duration(2000); // this is 1s	
	
   	xaxis.scale(xBlandScale)
   	gx.call(xaxis)
	yaxis.scale(yBlandScale)
   	gy.call(yaxis)
	/*
	xaxis.scale(xAxisScale);
   	gx.call(xaxis);
	yaxis.scale(yBlandScale);
   	gy.call(yaxis);
	*/
});