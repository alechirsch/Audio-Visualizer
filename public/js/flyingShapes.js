if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var stats;

var parameters, scene, camera, innerparent, outerparent;
var innerlayer = [];
var outerlayer = [];
var meshes = [];
var low = 999;
var high = 0;
var mid = 0;
var fakeTime = 0;
var expanding = true;
var lastSum = 0;
var animated = false;

var SEGMENTS = 512;
var BIN_COUNT = 512;
var analyser;
var source;
var buffer;
var audioBuffer;
var dropArea;
var audioContext;

var freqByteData;
var timeByteData;

var min = 0;
var sum = 0;
var max = 256 * 20;



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

	parameters = {
		objectsPerLayer: 20,
		cameraZoom: 35,
		audioInterval: 85,
		animationSpeed: 0.05,
		xScale: 0.7,
		//Inner circle
		innerRotX: 0,
		innerRotY: 0,
		innerRotZ: 0,
		innerRadius: 5,
		//Outer circle
		outerRotX: 0,
		outerRotY: 0,
		outerRotZ: 0,
		outerRadius: 15,
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() }
	};


	//Set up all the basic stuff
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = parameters.cameraZoom;
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	var light = new THREE.PointLight( 0xff0000, 1, 0 );
	light.position.set( 5, -50, 10 );
	scene.add( light );
	var geometry = new THREE.BoxGeometry(1,1,1);
	var material = new THREE.MeshBasicMaterial( { color: 0x866ff } );
	var parentmaterial = new THREE.MeshBasicMaterial( { visible: false } );
	innerparent = new THREE.Mesh( geometry, parentmaterial );
	outerparent = new THREE.Mesh( geometry, parentmaterial );
	scene.add( innerparent );
	scene.add( outerparent );

	//Create objects
	for(var i=0; i<parameters.objectsPerLayer; i++) {
		innerlayer.push(new THREE.Object3D());
	}
	for(var i=0; i<parameters.objectsPerLayer; i++) {
		outerlayer.push(new THREE.Object3D());
	}

	//Position the objects
	for(var i=0; i<parameters.objectsPerLayer; i++) {
		innerlayer[i].rotation.z = (i*2) * Math.PI / parameters.objectsPerLayer;
		outerlayer[i].rotation.z = (i*2) * Math.PI / parameters.objectsPerLayer;
	}

	//Give objects rotation hierarchy
	for(var i=0; i<parameters.objectsPerLayer; i++) {
		innerparent.add(innerlayer[i]);
		outerparent.add(outerlayer[i]);
	}

	//Give objects meshes
	for(var i=0; i<parameters.objectsPerLayer*2; i++) {
		meshes.push(new THREE.Mesh(geometry, material));
		if(i<parameters.objectsPerLayer) {
			meshes[i].position.y = parameters.innerRadius;
			innerlayer[i].add(meshes[i]);
		}
		else {
			meshes[i].position.y = parameters.outerRadius;
			outerlayer[i-parameters.objectsPerLayer].add(meshes[i]);
		}
	}


	audioInit();
}

function audioInit(){
	freqByteData = new Uint8Array(analyser.frequencyBinCount);
	timeByteData = new Uint8Array(analyser.frequencyBinCount);
	onParamsChange();
}

function onParamsChange() {

}
function normalize(value) {
		return (value - min) / (max - min);
}
function radiusNormalize(value) {
		var v = normalize(value) * 100;
		return v;
}
function detectLowAndHigh(value) {
	var bool = false;
	if(value < low - 1 ) {
		low = value;
		bool = true;
	}
	if(value > high + 1) {
		high = value;
		bool = true;
	}
	return bool;
}

function update() {

		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

		var interval = parameters.audioInterval;

		sum = 0;
		j = 0;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		sum = radiusNormalize(sum) * 0.1;
		if(detectLowAndHigh(sum)) {
			mid = (high-low)/2 + low;
		}
		if(sum < mid) {
			if(parameters.innerRadius > 1) {
				for(var i=0; i<meshes.length; i++) {
					meshes[i].position.y -= 0.1;
					parameters.innerRadius -= 0.1;
				}
			}
		}
		else if(sum > mid) {
			if(parameters.innerRadius < 200) {
				for(var i=0; i<meshes.length; i++) {
					meshes[i].position.y += 0.5;
					parameters.innerRadius += 0.5;
				}
			}
		}
		lastSum = sum;
		if(Math.abs(lastSum-sum) > 1) {
			expanding = !expanding;
		}
		lastSum = sum;
		
		sum = 0;
		j = 0;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.innerRotY = normalize(sum) * parameters.animationSpeed * parameters.xScale;
		
		sum = 0;
		j = interval;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.innerRotZ = normalize(sum) * parameters.animationSpeed * parameters.xScale;

		sum = 0;
		j = interval*2;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.outerRotX = normalize(sum) * parameters.animationSpeed;

		sum = 0;
		j = interval*3;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.outerRotY = normalize(sum) * parameters.animationSpeed;

		sum = 0;
		j = interval*4;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.outerRotZ = normalize(sum) * parameters.animationSpeed;

		j = interval*5;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.innerRotX = normalize(sum) * parameters.animationSpeed * parameters.xScale;


}

function animate() {

	requestAnimationFrame( animate );

	render();

}
var temp = 1;
function render() {
	update(source);

	parameters.time.value += 0.05;
		fakeTime += 0.1;
		
			if(fakeTime > 7) {
				for(var i=0; i<meshes.length; i++) {
					//meshes[i].position.y -= 0.5;
					//parameters.innerRadius -= 0.5;
				}
			}
			else {
				for(var i=0; i<meshes.length; i++) {
					//meshes[i].position.y += 0.5;
					//parameters.innerRadius += 0.5;
				}
			}

		if(fakeTime > 14) {
			fakeTime = 0;
		}
		renderer.render( scene, camera );

		innerparent.rotation.x += parameters.innerRotX;
		innerparent.rotation.y += parameters.innerRotY;
		innerparent.rotation.z += parameters.innerRotZ;
		outerparent.rotation.x += parameters.outerRotX;
		outerparent.rotation.y += parameters.outerRotY;
		outerparent.rotation.z += parameters.outerRotZ;
		//outerparent.rotation.z -= 0.01;
}