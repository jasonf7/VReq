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
						callback(courses);
					});

					function populateCourse(subject){

						var deferred = new $.Deferred();

						$.getJSON("https://api.uwaterloo.ca/v2/courses/"+subject.subject+".json?key=bbfc4cd8d33601c406f5b5cadfae58b2", function(data) {

							courses[unitsToGroupDict[subject.unit]] = data.data;
							for (var i=0; i<courses[unitsToGroupDict[subject.unit]].length; ++i) {
								courses[unitsToGroupDict[subject.unit]][i]['full_name'] = groupsDict[unitsToGroupDict[subject.unit]];
							}

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

	return {
		getAllCourses: getAllCourses
	};

})();

