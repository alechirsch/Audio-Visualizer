if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


var stats;

var camera, scene;

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

	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	camera.position.z = 5;
	scene = new THREE.Scene();
	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
	//SPHERE
	var spheregeometry = new THREE.SphereGeometry(0.2, 16, 16);
    var spherematerial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x00ff00});
    var sphere = new THREE.Mesh(spheregeometry, spherematerial);
    sphere.position.set(0, 0, 0);
    scene.add(sphere);
    //RING
    var ringgeometry = new THREE.RingGeometry(0.6, 0.8, 16);
    var ringmaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var ring = new THREE.Mesh(ringgeometry, ringmaterial);
    ring.position.set(0, 0, 0);
    scene.add(ring);

	parameters = {
		time: { type: "f", value: 1.0 },
		//SPHERE
		sphereShape: sphere,
		sphereRotX: 1,
		sphereRotY: 1,
		sphereRotZ: 1,

		//RING
		ringShape: ring,
		ringPosX: 3,
		ringPosY: 0,
		ringPosZ: 0,

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
	//SPHERE
	parameters.sphereShape.rotation.x += parameters.sphereRotX;
	parameters.sphereShape.rotation.y += parameters.sphereRotY;
	parameters.sphereShape.rotation.z += parameters.sphereRotZ;
	//RING
	parameters.ringShape.rotation.x += parameters.sphereRotX;
	parameters.ringShape.rotation.y += parameters.sphereRotY;
	parameters.ringShape.rotation.z += parameters.sphereRotZ;

	parameters.time.value += 0.05;
	renderer.render( scene, camera );

}