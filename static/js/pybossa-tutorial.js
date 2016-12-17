/*
	Issue: Pybossa always mark tutorial as seen on serverside after first load 
	no matter user click skip tutorial or user complete the tutorial or not.

	Solution : store tutorial state like "skipped", "complete" in another cookie.

	Other system like 
	- the tutorial template, 
	- login modal 
	can use that cookie to decide to open the tutorial again or not.
*/
(function(){
	//create our own namespace
	var tutorial = window.pybossaTutorial = {};

	//
	tutorial.setStage = setStage;
	tutorial.getStage = getStage;
	tutorial.isSkippedOrComplete = isSkippedOrComplete;
	tutorial.setSkipped = setSkipped;
	tutorial.setComplete = setComplete;

	//tutorial stages for projects will looks like this: 
	//project1!complete$project2!skipped
	var projectSeparator = '$';
	var keyValueSeparator = '!';

	function setStage(project, stage) {
		var projectsStageObj = getAllProjectsStage();

		//update stage for specified project
		projectsStageObj[project] = stage;

		//flat object to string format
		cookieValue = [];
		for (var i in projectsStageObj) {
			cookieValue[] = i + keyValueSeparator + projectsStageObj[i];
		}
		cookieValue = cookieValue.join(projectSeparator);

		createCookie('decode-darfurtutorial-stage', cookieValue, 120);
	}

	function getStage(project) {
		var projectsStageObj = getAllProjectsStage();
		if (projectsStageObj) {
			if (project in projectsStageObj) {
				return projectsStageObj[project];
			}
		}
		return null;
	}

	function getAllProjectsStage() {
		var cookieValue = readCookie('decode-darfurtutorial-stage');

		//extract project-stage value to object format
		cookieValue = cookieValue.split(projectSeparator);
		var projectsStageObj = {};
		cookieValue.forEach(function(value){
			value = value.split(keyValueSeparator);
			if (value && value.length == 2) {
				projectsStageObj[value[0]] = value[1];	
			} else {
				console.warn('tutorial stage has incorrect value:' + 
					value + '.' + 
					' Value should have format: projectname!stagename'
				);
			}
		});

		return projectsStageObj;
	}

	function isSkippedOrComplete(project) {
		var state = getStage(project) ;
		if (state == 'skipped' || state == 'complete') {
			return true;
		}
		return false;
	}

	function setSkipped(project) {
		setStage(project, 'skipped');
	}

	function setComplete(project) {		
		setStage(project, 'complete');
	}

	//cookie method
	function createCookie(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}

	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}

	function eraseCookie(name) {
		createCookie(name,"",-1);
	}

})();

(function(){
	// when should we open tutorial 
	// ----------------------------

	//we are in tutorial
	if(window.isInTutorial){
		return;
	}

	var currentProject = window.settings.currentProject;
	//we are in page tutorial
	if (window.location.href.indexOf("/project/" + currentProject + "/tutorial") !== -1) {
		return;
	}

	//we are in login/register modal
	if (window.location.href.indexOf("modal=all") !== -1 
		|| window.location.href.indexOf("modal=login") !== -1 
		|| window.location.href.indexOf("modal=register") !== -1 
		) {
		return;
	}

	//use already click skip or complete tutorial
	var currentSubProject = window.settings.currentSubProject;
	if (window.pybossaTutorial.isSkippedOrComplete(currentSubProject)) {

		return;
	}
	window.location.href = "/project/" + currentProject + "/tutorial";
	//
})();