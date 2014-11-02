var waterlooDAL = (function() {

	var groupsDict = { AHS:"Faculty of Applied Health Sciences"
	, ART:"Faculty of Arts"
	, CGC:"Conrad Grebel University College"
	, ENG:"Faculty of Engineering"
	, ENV:"Faculty of Environment"
	, GRAD:"Graduate Studies"
	, IS:"Independent Studies"
	, MAT:"Faculty of Mathematics"
	, REN:"Renison University College"
	, SCI:"Faculty of Science"
	, STJ:"St. Jerome's University"
	, STP:"St. Paul's University College"
	, THL:"Theology"
	, VPA:"Interdisciplinary Studies"
};

// Returns an object that contains arrays of the courses for each subject.
// Example object usage: courses['ART']
var getAllCourses = function getAllCourses(callback) {

	var buildCoursesObject = function (unitsToGroupDict) {
		$.ajax({
			url: "https://api.uwaterloo.ca/v2/codes/subjects.json?key=bbfc4cd8d33601c406f5b5cadfae58b2",
			dataType: 'json',
			async: true,
			success: function(data) {

				var subjects = [];
				for (var i=0; i<data.data.length; i++){
					subjects.push(data.data[i]);
				}
				var promises = [];
				var courses = {}; //array of array of courses sorted by subject

				for (var i=0; i<subjects.length; i++) {
					promises.push(populateCourse(subjects[i]));
				}

				$.when.apply($, promises).then(function(){

					// for (var property in groupsDict) {
					//     if (object.hasOwnProperty(property)) {
					//         for(loop through courses[property])
					//     }
					// }
					callback(courses);
				});

				function populateCourse(subject){

					var deferred = new $.Deferred();

					$.getJSON("https://api.uwaterloo.ca/v2/courses/"+subject.subject+".json?key=bbfc4cd8d33601c406f5b5cadfae58b2", function(data) {
						// cocatenates to array if it is not empty
						if (unitsToGroupDict[subject.unit] in courses) {
							courses[unitsToGroupDict[subject.unit]] = courses[unitsToGroupDict[subject.unit]].concat(data.data.filter(function(el) {
								return el.academic_level == "undergraduate";
							}));
						}
						else {
							courses[unitsToGroupDict[subject.unit]] = data.data.filter(function(el) {
								return el.academic_level == "undergraduate";
							});
						}

						// adds full name key to array ( move to code before fallback) TODO
						// for (var i=0; i<courses[unitsToGroupDict[subject.unit]].length; ++i) {
						// 	courses[unitsToGroupDict[subject.unit]][i]['full_name'] = groupsDict[unitsToGroupDict[subject.unit]];
						// }

						deferred.resolve();
					})

					return deferred.promise();
				}
			}
		});
	};

	var getAllUnits = function (callback) {
		$.ajax({
			url: "https://api.uwaterloo.ca/v2/codes/units.json?key=bbfc4cd8d33601c406f5b5cadfae58b2",
			dataType: 'json',
			async: true,
			success: function(data) {
				var unitsToGroupDict = {};
				for (var i=0; i<data.data.length; i++) {
					unitsToGroupDict[data.data[i].unit_code] = data.data[i].group_code;
				}
				callback(unitsToGroupDict);
			}
		});
	}
	getAllUnits(buildCoursesObject);
}

global = 0;
global2 = 0;

var getPreqs = function getPreqs(courseSubject, courseNumber, callback) {
	// we have original name here
	var promises = [];
	var prereqs={"name":courseSubject+courseNumber,"subject":courseSubject, "code":courseNumber,"children":[]}; //,"children":[]

	promises.push(helper(prereqs, courseSubject, courseNumber, promises)); //either pass info about initial here, or ajax call again in final

	// $.when.apply($, promises).then(function(){
	// 	// build data here
	// 	console.log("I finished");
	// 	callback(prereqs);
	// });

	//returns true when all promises are fulfilled
	function checkPromises(promises) {
		var flag = true;
		for (var i=0; i<promises.length; ++i) {
			if (promises[i].state == false)
				return false;
		}
		return flag;
	}

	function timerFunction(){
	    if (!checkPromises(promises)){ //promises check
	        //run your function here...
	        setTimeout(timerFunction, 200);
	    }
	    else {
	    	callback(prereqs);
	    }
	}
	timerFunction();

	function helper(object, courseSubject, courseNumber, promises) { //origin pointer can point to array, build object right before callback (on recursive exit)
		var dfd = { state: false };
		$.ajax({
			url: "https://api.uwaterloo.ca/v2/courses/"+courseSubject+"/"+courseNumber+"/prerequisites.json?key=bbfc4cd8d33601c406f5b5cadfae58b2",
			dataType: 'json',
			async: true,
			success: function(data) {
				if (data === undefined || data.data.prerequisites_parsed == null || data.data.prerequisites_parsed == "") { //empty
					// dfd.resolve(); //done this branch
				}
				else {
					recurseThroughArray(object, courseSubject, courseNumber, promises, data.data.prerequisites_parsed);
				}
				dfd.state = true;
			}
		});
		return dfd; // RETURN

		function recurseThroughArray(object, courseSubject, courseNumber, promises, arr) { 
			if (Object.prototype.toString.call(arr) === '[object Array]') {
				console.log("it is an array" + arr);
				// object.children.push([]);
				console.log(object);
				//object.children = [];
				for (var i=0; i<arr.length; ++i) {
					recurseThroughArray(object, courseSubject, courseNumber, promises, arr[i]); //children needs offset
				}
			}
			else if (arr != parseInt(arr, 10)) {
				console.log("it is not an int or array " + arr);
				var indexOfFirstDigit = arr.search(/\d/);
				var subj = arr.substring(0, indexOfFirstDigit);
				var cat_num = arr.substring(indexOfFirstDigit, arr.length);
				var name= subj+cat_num;
				object.children.push({"name":name, "subject":courseSubject, "code":courseNumber,"children":[]});

				// console.log(promises); //remove
				promises.push(helper(object.children[object.children.length-1], subj, cat_num, promises));
			}
			else if ((arr == parseInt(arr, 10))) { //if int
				//skip
			}
			else {
				console.log("error state");
				//promises.push(helper(originPointer, arr.subject, arr.catalog_number, promises)); //wil crash here because args
			}
		}
	}	 
}





return {
	getAllCourses: getAllCourses,
	getPreqs: getPreqs

};

})();

