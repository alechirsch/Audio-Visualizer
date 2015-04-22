if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var stats;

var camera, scene;

var parameters;

var SEGMENTS = 512;
var BIN_COUNT = 512;
var analyser, source, buffer, audioBuffer, dropArea, audioContext, freqByteData, timeByteData;
var min = 0, sum = 0, max = 255 * 20;
var counter = 0;
var cylinderArray = [];

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
	analyser.smoothingTimeConstant = 0.001;
	analyser.fftSize = 1024;

	/*start ThreeJS scene*/
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	camera.position.z = 5;
	camera.position.x = 1;
	camera.position.y = 2;
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

	//debugaxis(100);
	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	/* SPHERE */
	var spheregeometry = new THREE.SphereGeometry(0.8, 16, 16);
	var spherematerial = new THREE.MeshBasicMaterial({wireframe: false, color: 0x000000});
	var sphere = new THREE.Mesh(spheregeometry, spherematerial);
	sphere.position.set(0, 0, 0);
	scene.add(sphere);
	/* CYLINDER */
	var cylindergeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.55, 10);
	cylindergeometry.verticesNeedUpdate = true;
	cylindergeometry.elementsNeedUpdate = true;
	cylindergeometry.morphTargetsNeedUpdate = true;
	cylindergeometry.uvsNeedUpdate = true;
	cylindergeometry.normalsNeedUpdate = true;
	cylindergeometry.colorsNeedUpdate = true;
	cylindergeometry.tangentsNeedUpdate = true;
	var cylindermaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
	var cylinder = new THREE.Mesh(cylindergeometry, cylindermaterial);
	cylinder.position.set(0,0,0);
	createCylinders(cylinder, 0);
	console.log(cylinderArray.length);
	parameters = {
		time: { type: "f", value: 1.0 },
		sphereShape: sphere,
		cylGeo: cylindergeometry,
		cylMaterial: cylindermaterial,
		cylinderHeights: [],
		cylinderWidths: [],
		cameraX: 0,
		cameraY: 0,
		cameraZ: 0,
		resolution: { type: "v2", value: new THREE.Vector2() }
	};

	audioInit();
}

function createCylinders(cylinder, depth){
	if(depth === 2) return;
	console.log(depth);
	for(var i = 0; i < 8; i++){
		if(depth === 0){
			cylinder.rotation.x += Math.PI/8;
			createCylinders(cylinder.clone(), depth + 1);
			cylinder.rotation.x += Math.PI/8;
		}
		else if(depth === 1){
			cylinder.rotation.z += Math.PI/8;
			createCylinders(cylinder.clone(), depth + 1);
			cylinder.rotation.z += Math.PI/8;
		}
		cylinderArray[counter++] = cylinder;
		scene.add(cylinder);
		cylinder = cylinder.clone();
	}
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
	for(var i = 5; i <= 71; i++){
		for(var j = 1; j <= 10; j++){
			sum += freqByteData[i*j];
		}
		parameters.cylinderHeights[i] = normalize(sum, 72) * 20;
		sum = 0;
	}
	for(var i = 5; i <= 71; i++){
		for(var j = 1; j <= 2; j++){
			sum += freqByteData[i*j];
		}
		parameters.cylinderWidths[i] = normalize(sum, 72) * 20;
		sum = 0;
	}
	for(var i = 12; i < 17; i++){
		sum += freqByteData[i];
	}
	parameters.cameraX += normalize(sum, 5) * 0.001;
	sum = 0;
	for(var i = 78; i < 92; i++){
		sum += timeByteData[i];
	}
	parameters.cameraY += normalize(sum, 14) * 0.001;

	sum = 0;
	for(var i = 122; i < 134; i++){
		sum += timeByteData[i];
	}
	parameters.cameraZ += normalize(sum, 12) * 0.001;
}

function animate() {

	requestAnimationFrame( animate );

	render();
	/*stats.update();*/

}
function render() {
	update(source);
	for(var i = 0; i < cylinderArray.length; i++){
		cylinderArray[i].scale.y = parameters.cylinderHeights[i]*0.4 + 1;
		cylinderArray[i].scale.x = parameters.cylinderWidths[cylinderArray.length - i] + 0.1;
		cylinderArray[i].scale.z = parameters.cylinderWidths[cylinderArray.length - i] + 0.1;
	}
	camera.position.x = Math.cos(parameters.cameraX) * 5;
	camera.position.y = Math.sin(parameters.cameraY) * 5;
	camera.position.z = camera.position.x + camera.position.y < 3 ? 3 : camera.position.x + camera.position.y;

	camera.lookAt(new THREE.Vector3(0, 0, 0));
	//parameters.time.value += 0.05;1
	renderer.render( scene, camera );
}