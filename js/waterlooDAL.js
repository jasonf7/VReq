// Returns an object that contains arrays of the courses for each subject.
// Example object usage: courses['MATH']
function getAllCourses(callback) {
	$.ajax({
		url: "https://api.uwaterloo.ca/v2/codes/subjects.json?key=bbfc4cd8d33601c406f5b5cadfae58b2",
		dataType: 'json',
		async: true,
		success: function(data) {

			var subjects = [];
			for (var i=0; i<data.data.length; i++){
				subjects.push(data.data[i].subject);
			}
			console.log(subjects);
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

				$.getJSON("https://api.uwaterloo.ca/v2/courses/"+subject+".json?key=bbfc4cd8d33601c406f5b5cadfae58b2", function(data) {
					courses[subject] = data.data;
					deferred.resolve();
				})

				return deferred.promise();
			}
		}
	});

}

