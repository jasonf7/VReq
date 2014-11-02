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
	
	var getPreq= function getPreq(subject,courseCode,callback){
		$.getJSON("https://api.uwaterloo.ca/v2/courses/"+subject+"/"+courseCode+"/prerequisites.json?key=bbfc4cd8d33601c406f5b5cadfae58b2", function(jd,status, jqXHR) {
			callback(jd.data);
		});
	
	}

	return {
		getAllCourses: getAllCourses,
		getPreq: getPreq
		
	};

})();

