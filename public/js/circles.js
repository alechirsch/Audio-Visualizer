if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var stats;

var camera, scene;

var parameters;

var SEGMENTS = 512;
var BIN_COUNT = 512;
var analyser, source, buffer, audioBuffer, dropArea, audioContext, freqByteData, timeByteData;
var min = 0, sum = 0, max = 255 * 20;
var counter = 0;
var circleArray = [];

function init() {
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		audioContext = new window.AudioContext();
	} catch(e) {
		return;
	}
	window.addEventListener('touchstart', function() {
		/* create empty buffer */
		var buffer = audioContext.createBuffer(1, 1, 22050);
		var source = audioContext.createBufferSource();
		source.buffer = buffer;
		/* connect to output (your speakers) */
		source.connect(audioContext.destination);
		/* play the file */
		source.noteOn(0);
	}, false);

	/* init audio */
	analyser = audioContext.createAnalyser();
	analyser.smoothingTimeConstant = 0.01;
	analyser.fftSize = 1024;

	/*start ThreeJS scene*/
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	camera.position.x = 20;
	camera.position.y = 40;
	camera.position.z = 50;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	controls = new THREE.OrbitControls( camera );
	controls.damping = 0.2;
	controls.addEventListener( 'change', render );

	scene = new THREE.Scene();
	/*To use enter the axis length*/
	var debugaxis = function(axisLength){
		/*Shorten the vertex function*/
		function v(x,y,z){ 
			return new THREE.Vector3(x,y,z);
		}

		/*Create axis (point1, point2, colour)*/
		function createAxis(p1, p2, color){
			var line, lineGeometry = new THREE.Geometry(),
			lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
			lineGeometry.vertices.push(p1, p2);
			line = new THREE.Line(lineGeometry, lineMat);
			scene.add(line);
		}

		createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
		createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
		createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
	};

	debugaxis(100);

	var material = new THREE.MeshBasicMaterial({color: 0xff00});
	var geometry = new THREE.PlaneBufferGeometry( 200, 200 );
	var plane = new THREE.Mesh(geometry, material);
	plane.position.set(0,0,0);
	plane.rotation.x = -Math.PI/2;
	plane.rotation.y = 0;
	scene.add(plane);


	var material = new THREE.LineBasicMaterial({color: 0x0000ff});
	var radius = 1;
	var segments = 20;

	var circleGeometry = new THREE.CircleGeometry( radius, segments );				
	var circle = new THREE.Line( circleGeometry, material );
	circleGeometry.vertices.shift();
	circle.position.set(0, 1, 0);
	circle.rotation.x = -Math.PI/2;
	circle.rotation.y = 0;
	scene.add( circle );
	circleArray[0] = circle;
	parameters = {
		material: material,
		newHeight: 1
	};

	createCircles(2, 20);

	audioInit();
}

function createCircles(radius, segments){
	if(radius > 100) return;
	var circleGeometry = new THREE.CircleGeometry( radius, segments );				
	var circle = new THREE.Line( circleGeometry, parameters.material );
	circleGeometry.vertices.shift();
	circle.position.set(0, 1, 0);
	circle.rotation.x = -Math.PI/2;
	circle.rotation.y = 0;
	scene.add( circle );
	circleArray[radius - 1] = circle;
	createCircles(radius + 1, segments + 2);
}

function audioInit(){
	freqByteData = new Uint8Array(analyser.frequencyBinCount);
	timeByteData = new Uint8Array(analyser.frequencyBinCount);
	onParamsChange();
}

function onParamsChange() {
	console.log("I got here");
	/* when a parameter is changed, change it */
}

function normalize(value, max){
	return (value - min) / (max * 255 - min);
}

function update() {
	analyser.getByteFrequencyData(freqByteData);
	analyser.getByteTimeDomainData(timeByteData);
	sum = 0;

	for(var i = 0; i < 50; i++){
		sum += freqByteData[i];
	}
	var average = sum / 50;

	parameters.newHeight = normalize(average, 50) * 1000;

	/*
	for(var i = 12; i < 17; i++){
		sum += freqByteData[i];
	}
	parameters.cameraX += normalize(sum, 5) * 0.01;
	sum = 0;
	for(var i = 78; i < 92; i++){
		sum += timeByteData[i];
	}
	parameters.cameraY += normalize(sum, 14) * 0.01;

	sum = 0;
	for(var i = 122; i < 134; i++){
		sum += timeByteData[i];
	}
	parameters.cameraZ += normalize(sum, 12) * 0.01;
	*/
}

function animate() {

	requestAnimationFrame( animate );

	render();
	/*stats.update();*/

}

function updateCircleHeights(index){
	if(index === 0){
		circleArray[index].position.y = parameters.newHeight;
		return;
	}
	circleArray[index].position.y = circleArray[index - 1].position.y;
	updateCircleHeights(index - 1);
}

function render() {
	update(source);

	updateCircleHeights(circleArray.length - 1);

	/*
	for(var i = 0; i < cylinderArray.length; i++){
		cylinderArray[i].scale.y = parameters.cylinderHeights[i]*0.4 + 1;
		cylinderArray[i].scale.x = parameters.cylinderWidths[cylinderArray.length - i] + 0.1;
		cylinderArray[i].scale.z = parameters.cylinderWidths[cylinderArray.length - i] + 0.1;
	}
	camera.position.x = Math.cos(parameters.cameraX) * 5;
	camera.position.y = Math.sin(parameters.cameraY) * 5;
	camera.position.z = camera.position.x + camera.position.y < 3 ? 3 : camera.position.x + camera.position.y;

	camera.lookAt(new THREE.Vector3(0, 0, 0));
	*/
	//parameters.time.value += 0.05;1
	renderer.render( scene, camera );
}