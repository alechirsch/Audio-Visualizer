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
	camera.position.z = 500;
	scene = new THREE.Scene();
	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	var innerlayer = new THREE.Group();
	var outerlayer = new THREE.Group();
	var allobjects = new THREE.Group();

	//CENTER SPHERE (invisible)
	var spheregeometry = new THREE.SphereGeometry(20, 16, 16);
    var spherematerial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x0000ff } );
    var sphere = new THREE.Mesh(spheregeometry, spherematerial);
    sphere.position.set(0, 0, 0);
    scene.add(sphere);
    //CUBE
    //var cubegeometry = new THREE.BoxGeometry(20, 20, 20);
    //var cubematerial = new THREE.MeshNormalMaterial( { color: 0x00ff00 } );
    //var cube = new THREE.Mesh(cubegeometry, cubematerial);
    //cube.position.set(200, 0, 0);
    //scene.add(cube);

    var lineStart = new THREE.Vector3(0,0,0);
    var lineEnd = new THREE.Vector3(200,0,0);
    var linegeometry = new THREE.Geometry();
    linegeometry.vertices.push(new THREE.Vector3(0,0,0), new THREE.Vector3(200,0,0));
    var linematerial = new THREE.LineBasicMaterial( { color: 0x000000 } );
    var line = new THREE.Line(linegeometry, linematerial);
    scene.add(line);
    

	parameters = {
		time: { type: "f", value: 1.0 },
		//GROUP
		innergroup: innerlayer,
		outergroup: outerlayer,
		entiregroup: allobjects,

		//SPHERE
		sphereShape: sphere,
		sphereRotX: 1,
		sphereRotY: 1,
		sphereRotZ: 1,

		//LINE
		lineShape: line,
		lineGeo: linegeometry,
		lineRotZ: 1,

		innerRadius: 150,
		outerRadius: 300,
		resolution: { type: "v2", value: new THREE.Vector2() }
	};

	audioInit();
	sceneInit();
}

function audioInit(){
	freqByteData = new Uint8Array(analyser.frequencyBinCount);
	timeByteData = new Uint8Array(analyser.frequencyBinCount);
	onParamsChange();
}

function sceneInit() {
	var cubegeometry = new THREE.BoxGeometry(20, 20, 20);
    var cubematerial = new THREE.MeshNormalMaterial( { color: 0x00ff00 } );
    var cubes = [];
    for(var i=0; i<8; i++) {
    	cubes.push(new THREE.Mesh(cubegeometry, cubematerial));
	}
	cubes[0].position.set(parameters.innerRadius, 0, 0);
	cubes[1].position.set(0, parameters.innerRadius, 0);
	cubes[2].position.set(-1*parameters.innerRadius, 0, 0);
	cubes[3].position.set(0, -1*parameters.innerRadius, 0);
	cubes[4].position.set(parameters.outerRadius, 0, 0);
	cubes[5].position.set(0, parameters.outerRadius, 0);
	cubes[6].position.set(-1*parameters.outerRadius, 0, 0);
	cubes[7].position.set(0, -1*parameters.outerRadius, 0);
	for(var j=0; j<4; j++) {
		parameters.innergroup.add(cubes[j]);
		parameters.entiregroup.add(cubes[j]);
		parameters.sphereShape.add(cubes[j]);
	}
	for(var j=0; j<4; j++) {
		parameters.outergroup.add(cubes[j]);
		parameters.entiregroup.add(cubes[j]);
		parameters.sphereShape.add(cubes[j]);
	}
	for(var cube in cubes) {
		scene.add(cubes[cube]);
	}
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
	//parameters.sphereShape.rotation.x += parameters.sphereRotX;
	//parameters.sphereShape.rotation.y += parameters.sphereRotY;
	//parameters.sphereShape.rotation.z += parameters.sphereRotZ;

	parameters.sphereShape.traverse(function(obj) {
		obj.rotation.x += parameters.sphereRotX;
		obj.rotation.y += parameters.sphereRotY;
		obj.rotation.z += parameters.sphereRotZ;
		//console.log(parameters.sphereShape.rotation.x);
	});


	parameters.time.value += 0.05;
	renderer.render( scene, camera );

	//parameters.lineShape.rotation.z += 0.01;

}