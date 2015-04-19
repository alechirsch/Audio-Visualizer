if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var stats;

var parameters, scene, camera, innerparent, outerparent;
var innerlayer = [];
var outerlayer = [];
var meshes = [];

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
		innerRotX: 0,
		innerRotY: 0,
		innerRotZ: 0,
		outerRotX: 0,
		outerRotY: 0,
		outerRotZ: 0,
		time: { type: "f", value: 1.0 },
		innerRadius: 5,
		outerRadius: 15,
		resolution: { type: "v2", value: new THREE.Vector2() }
	};



	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = parameters.cameraZoom;
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	var geometry = new THREE.BoxGeometry(1,1,1);
	var material = new THREE.MeshBasicMaterial( { color: 0x866ff } );
	var parentmaterial = new THREE.MeshBasicMaterial( { visible: false } );
	innerparent = new THREE.Mesh( geometry, parentmaterial );
	outerparent = new THREE.Mesh( geometry, parentmaterial );

	scene.add( innerparent );
	scene.add( outerparent );

	for(var i=0; i<parameters.objectsPerLayer; i++) {
		innerlayer.push(new THREE.Object3D());
	}
	for(var i=0; i<parameters.objectsPerLayer; i++) {
		outerlayer.push(new THREE.Object3D());
	}

	for(var i=0; i<parameters.objectsPerLayer; i++) {
		innerlayer[i].rotation.z = (i*2) * Math.PI / parameters.objectsPerLayer;
		outerlayer[i].rotation.z = (i*2) * Math.PI / parameters.objectsPerLayer;
	}
	/*innerlayer[0].rotation.z = 0;
	innerlayer[1].rotation.z = 2 * Math.PI / parameters.objectsPerLayer;
	innerlayer[2].rotation.z = 4 * Math.PI / parameters.objectsPerLayer;
	innerlayer[3].rotation.z = 6 * Math.PI / parameters.objectsPerLayer;
	outerlayer[0].rotation.z = 0;
	outerlayer[1].rotation.z = 2 * Math.PI / parameters.objectsPerLayer;
	outerlayer[2].rotation.z = 4 * Math.PI / parameters.objectsPerLayer;
	outerlayer[3].rotation.z = 6 * Math.PI / parameters.objectsPerLayer;*/

	for(var i=0; i<parameters.objectsPerLayer; i++) {
		innerparent.add(innerlayer[i]);
		outerparent.add(outerlayer[i]);
	}

	// mesh
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
	/*var mesh1 = new THREE.Mesh( geometry, material );
	var mesh2 = new THREE.Mesh( geometry, material );
	var mesh3 = new THREE.Mesh( geometry, material );
	var mesh4 = new THREE.Mesh( geometry, material );

	mesh1.position.y = parameters.innerRadius;
	mesh2.position.y = parameters.innerRadius;
	mesh3.position.y = parameters.innerRadius;
	mesh4.position.y = parameters.innerRadius;

	innerlayer[0].add( meshes[] );
	innerlayer[1].add( mesh2 );
	innerlayer[2].add( mesh3 );
	innerlayer[3].add( mesh4 );*/



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

function update() {

		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

		sum = 0;
		j = 0;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.sphereRotX = normalize(sum) * 0.1;
		
		sum = 0;
		j = 20;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.sphereRotY = normalize(sum) * 0.1;
		
		sum = 0;
		j = 40;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.sphereRotZ = normalize(sum) * 0.1;
}

function animate() {

	requestAnimationFrame( animate );

	render();

}
var temp = 1;
function render() {
	update(source);

	parameters.time.value += 0.05;
	renderer.render( scene, camera );
	innerparent.rotation.z += 0.01;
	outerparent.rotation.z -= 0.01;
}