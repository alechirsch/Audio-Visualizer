if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var stats;

var parameters;

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



var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 15;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

var geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var parent = new THREE.Mesh( geometry, material );

// parent
//parent = new THREE.Object3D();
scene.add( parent );

// pivots
var pivot1 = new THREE.Object3D();
var pivot2 = new THREE.Object3D();
var pivot3 = new THREE.Object3D();
var pivot4 = new THREE.Object3D();

pivot1.rotation.z = 0;
pivot2.rotation.z = 2 * Math.PI / 4;
pivot3.rotation.z = 4 * Math.PI / 4;
pivot4.rotation.z = 6 * Math.PI / 4;

parent.add( pivot1 );
parent.add( pivot2 );
parent.add( pivot3 );
parent.add( pivot4 );

// mesh
var mesh1 = new THREE.Mesh( geometry, material );
var mesh2 = new THREE.Mesh( geometry, material );
var mesh3 = new THREE.Mesh( geometry, material );
var mesh4 = new THREE.Mesh( geometry, material );

mesh1.position.y = 5;
mesh2.position.y = 5;
mesh3.position.y = 5;
mesh4.position.y = 5;

pivot1.add( mesh1 );
pivot2.add( mesh2 );
pivot3.add( mesh3 );
pivot4.add( mesh4 );







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
		time: { type: "f", value: 1.0 },

		innerRadius: 150,
		outerRadius: 300,
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
	parent.rotation.z += 0.01;
}