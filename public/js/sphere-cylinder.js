if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var stats;

var camera, scene;

var parameters;

var SEGMENTS = 512;
var BIN_COUNT = 512;
var analyser, source, buffer, audioBuffer, dropArea, audioContext, freqByteData, timeByteData;
var min = 0, sum = 0, max = 256 * 20;


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
	analyser.smoothingTimeConstant = 0.000001;
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

	debugaxis(100);
	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	/* SPHERE */
	var spheregeometry = new THREE.SphereGeometry(0.8, 16, 16);
	var spherematerial = new THREE.MeshBasicMaterial({wireframe: false, color: 0xff0000});
	var sphere = new THREE.Mesh(spheregeometry, spherematerial);
	sphere.position.set(0, 0, 0);
	scene.add(sphere);
	/* CYLINDER */
	var cylindergeometry = new THREE.CylinderGeometry(0.01, 0.01, 5, 50);
	var cylindermaterial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x00ff00});
	var cylinder = new THREE.Mesh(cylindergeometry, cylindermaterial);
	cylinder.position.set(0,0,0);
	scene.add(cylinder);
	//for(var i = 1; i <= 5; i++){
		//cylinder.rotation.x += Math.PI/5;
		//for(var j = 1; j <=5; j++){
			//cylinder.rotation.y += Math.PI/5;
			for(var k = 1; k <=5; k++){
				cylinder = cylinder.clone();
				cylinder.rotation.z += Math.PI/5;
				scene.add(cylinder);
			}
		//}
		
	//}

	parameters = {
		time: { type: "f", value: 1.0 },
		sphereScaleX: 1,
		sphereScaleY: 1,
		sphereScaleZ: 1,
		sphereShape: sphere,
		resolution: { type: "v2", value: new THREE.Vector2() }
	};

	audioInit();
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

function normalize(value){
	return (value - min) / (max - min);
}

function update() {
	analyser.getByteFrequencyData(freqByteData);
	analyser.getByteTimeDomainData(timeByteData);
	sum = 0;
	j = 0;
	for(var i = j; i < j+20; i++) {
		sum += freqByteData[i];
	}
	parameters.sphereScaleX = normalize(sum) * 0.1;

	sum = 0;
	j = 20;
	for(var i = j; i < j+20; i++) {
		sum += freqByteData[i];
	}
	parameters.sphereScaleY = normalize(sum) * 0.1;

	sum = 0;
	j = 40;
	for(var i = j; i < j+20; i++) {
		sum += freqByteData[i];
	}
	parameters.sphereScaleZ = normalize(sum) * 0.1;
}

function animate() {

	requestAnimationFrame( animate );

	render();
	/*stats.update();*/

}

var temp = 1;
function render() {
	update(source);

	//uniforms.sphereShape.scale.multiplyScalar((1 / temp));
	//temp = LoopVisualizer.parameters.sphereScale;
	//uniforms.sphereShape.scale.multiplyScalar(LoopVisualizer.parameters.sphereScale);
	parameters.sphereShape.rotation.x += parameters.sphereScaleX;
	parameters.sphereShape.rotation.y += parameters.sphereScaleY;
	parameters.sphereShape.rotation.z += parameters.sphereScaleZ;

	//parameters.time.value += 0.05;
	renderer.render( scene, camera );
}