if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var stats;

var parameters, scene, camera, innerparent, outerparent, material;
var innerlayer = [];
var outerlayer = [];
var meshes = [];
var low = 999;
var high = 0;
var mid = 0;
var fakeTime = 0;
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

var colorArray2 = [0x330000, 0x331a1a, 0x4c0000, 0x660000, 0x806060, 0x994d4d, 0xe53939, 0xe57373, 0xf20000, 0xff0000, 0xffbfbf, 0x594643, 0x734139, 0x7f1100, 0xb23e2d, 0xbf1a00, 0xbf6c60, 0xd9aaa3, 0x330e00, 0x4c2213, 0x664133, 0x73341d, 0x806860, 0x8c5946, 0xa64b29, 0xf29979, 0xff4400, 0xffd0bf, 0xff7340, 0x402310, 0x593116, 0x735039, 0x732e00, 0x993d00, 0x996b4d, 0xa65b29, 0xbfa38f, 0xcc5200, 0xd97736, 0xe5a173, 0xff6600, 0x403830, 0x66421a, 0x665a4d, 0x8c6c46, 0x8c4b00, 0x998773, 0xbf7c30, 0xbf6600, 0xf2ba79, 0xff8800, 0xffe1bf, 0x332200, 0x403520, 0x4c3913, 0x665533, 0x7f6020, 0x99804d, 0x996600, 0xbf8f30, 0xccbb99, 0xd9b56c, 0xd99100, 0xffbf40, 0x8c7000, 0xd9b836, 0xffcc00, 0x333000, 0x4c4a26, 0x595300, 0x7f7b40, 0x8c8523, 0x8c8a69, 0xb2ad59, 0xe5de73, 0xf2e200, 0xc2cc33, 0x526600, 0x85a600, 0xb6bf8f, 0xb8cc66, 0xb8e600, 0xe6f2b6, 0x394d13, 0x525943, 0x2d3326, 0x448000, 0x7fa653, 0x6dcc00, 0xbaf279, 0x88ff00, 0x1c330d, 0x507339, 0x6c8060, 0x084000, 0x24661a, 0x6cbf60, 0x90ff80, 0xb6f2b6, 0x009914, 0x00d91d, 0x1a3320, 0x165928, 0x86b392, 0x394d41, 0x238c4d, 0x59b37d, 0x00bf4d, 0x004022, 0x33664e, 0x468c6c, 0x36d98d, 0x00ff88, 0xbfffe1, 0x608075, 0x104036, 0x53a695, 0x86b3aa, 0x30bfa3, 0x00f2c2, 0x80ffe5, 0x394d4b, 0x00665f, 0xb6f2ee, 0x0d3033, 0x005359, 0x396f73, 0x698a8c, 0x269199, 0x33c2cc, 0x00eeff, 0x003d4d, 0x005c73, 0x8fb6bf, 0x33adcc, 0xbff2ff, 0x80e6ff, 0x1a2b33, 0x39464d, 0x004466, 0x267399, 0x738c99, 0x5995b3, 0x0088cc, 0x39ace6, 0x80d5ff, 0x0d2133, 0x00294d, 0x003d73, 0x406280, 0x235b8c, 0x005299, 0xa3bfd9, 0x26364d, 0x597db3, 0x8698b3, 0x3370cc, 0x0061f2, 0x80b3ff, 0x000e33, 0x00144d, 0x233f8c, 0x80a2ff, 0xbfd0ff, 0x2d3359, 0x434659, 0x1a2466, 0x404880, 0x293aa6, 0x001bcc, 0x000059, 0x737399, 0x6666cc, 0x0000f2, 0x3d3df2, 0xbfbfff, 0x1d1a33, 0x140099, 0x9180ff, 0x110040, 0x1f0073, 0x392080, 0x1c0d33, 0x2b2633, 0x2a134d, 0x36264d, 0x6930bf, 0xb8a3d9, 0x44394d, 0x7f53a6, 0xb073e6, 0x9539e6, 0x8800ff, 0x553366, 0x440066, 0x756080, 0x5e008c, 0x6c2080, 0x8d29a6, 0xc200f2, 0x300033, 0x551659, 0xa37ca6, 0xa053a6, 0xce36d9, 0xeeb6f2, 0x331a31, 0xe673de, 0xff00ee, 0x4d003d, 0x4d2645, 0x664d61, 0x733967, 0xa6298d, 0xf23dce, 0x330022, 0x8c2369, 0xbf609f, 0x4d1332, 0x7f0044, 0x994d75, 0xb32d74, 0xb3869e, 0xf23d9d, 0xff80c4, 0xffbfe1, 0x330014, 0x40202d, 0x4c001f, 0x733950, 0xa60042, 0x4d393e, 0x590018, 0x7f2039, 0x990029, 0xb35971, 0xe53967, 0xff80a2, 0x332628, 0x592d33, 0x8c0013, 0xb3868c, 0xe53950];
var colorArray = [0xfa1e34, 0xfa6171, 0xd4192c, 0xd47982, 0xfa1e4a, 0xfa7892, 0xe02f53, 0xed87a6, 0xe05881, 0xd42c5f, 0xfa1e76, 0xfa619e, 0xe06c9a, 0xd42c6f, 0xfa8ec4, 0xed1c85, 0xfa4bb4, 0xe01b91, 0xd466a8, 0xfa78d3, 0xd440a7, 0xe01bb9, 0xe080cd, 0xe058d3, 0xfa61fa, 0xed1ced, 0xed87ed, 0xc119d4, 0xba53d4, 0xc54bfa, 0xaf1ced, 0xc380e0, 0xc678fa, 0x912cd4, 0xa866d4, 0x9c58e0, 0xb98efa, 0x7034fa, 0x7243e0, 0x9479d4, 0x9278fa, 0x7c66d4, 0x341efa, 0x7161fa, 0x998efa, 0x2f2fe0, 0x6c77e0, 0x1e4afa, 0x4b6efa, 0x879ced, 0x2c4ed4, 0x2c5fd4, 0x7994d4, 0x619efa, 0x8eb9fa, 0x327ded, 0x407bd4, 0x669dd4, 0x34abfa, 0x5cb3ed, 0x80bae0, 0x1989d4, 0x47bbed, 0x80c3e0, 0x61dbfa, 0x80cde0, 0x19aed4, 0x61ebfa, 0x19c1d4, 0x34fafa, 0x80e0e0, 0x8efaef, 0x1cedd8, 0x53d4c7, 0x8efada, 0x47edbb, 0x79d4b8, 0x66d4a8, 0x34fa97, 0x8efac4, 0x43e092, 0x1efa60, 0x2fe064, 0x80e09d, 0x87ed91, 0x2cd42c, 0x7eed72, 0x60fa1e, 0x87d466, 0xb9fa8e, 0x8fed32, 0x8ad440, 0xbdfa61, 0xafd479, 0xafed1c, 0xadd453, 0xe0fa78, 0xb2d42c, 0xe6fa34, 0xcbd479, 0xe0e02f, 0xe0e06c, 0xfae41e, 0xd4c119, 0xfad234, 0xfadb61, 0xd4b22c, 0xd4c179, 0xfab81e, 0xfada8e, 0xedc25c, 0xd49c19, 0xd4b366, 0xfaab34, 0xfabd61, 0xedc487, 0xd48919, 0xfab978, 0xed8f32, 0xe0b080, 0xd48a3f, 0xfa761e, 0xfab98e, 0xe0762f, 0xe08e58, 0xfa8f61, 0xed6a32, 0xeda687, 0xd46c3f, 0xfa4a1e, 0xed6847, 0xed8b72, 0xd43f19, 0xd48b79, 0xfa998e, 0xe05343, 0xfa1e1e, 0xfa6161, 0xd41919, 0xd46666];
var colorArray3 = [0xfa1e1e, 0xfa6161, 0xd41919, 0xd46666, 0xfa998e, 0xe05343, 0xfa4a1e, 0xed6847, 0xed8b72, 0xd43f19, 0xd48b79, 0xfa8f61, 0xed6a32, 0xeda687, 0xd46c3f, 0xfa761e, 0xfab98e, 0xe0762f, 0xe08e58, 0xfab978, 0xed8f32, 0xe0b080, 0xd48a3f, 0xfaab34, 0xfabd61, 0xedc487, 0xd48919, 0xfab81e, 0xfada8e, 0xedc25c, 0xd49c19, 0xd4b366, 0xfad234, 0xfadb61, 0xd4b22c, 0xd4c179, 0xfae41e, 0xd4c119, 0xe0e02f, 0xe0e06c, 0xe6fa34, 0xcbd479, 0xe0fa78, 0xb2d42c, 0xafed1c, 0xadd453, 0xbdfa61, 0xafd479, 0x8fed32, 0x8ad440, 0xb9fa8e, 0x60fa1e, 0x87d466, 0x7eed72, 0x2cd42c, 0x87ed91, 0x1efa60, 0x2fe064, 0x80e09d, 0x34fa97, 0x8efac4, 0x43e092, 0x66d4a8, 0x8efada, 0x47edbb, 0x79d4b8, 0x8efaef, 0x1cedd8, 0x53d4c7, 0x34fafa, 0x80e0e0, 0x61ebfa, 0x19c1d4, 0x61dbfa, 0x80cde0, 0x19aed4, 0x47bbed, 0x80c3e0, 0x34abfa, 0x5cb3ed, 0x80bae0, 0x1989d4, 0x669dd4, 0x619efa, 0x8eb9fa, 0x327ded, 0x407bd4, 0x2c5fd4, 0x7994d4, 0x1e4afa, 0x4b6efa, 0x879ced, 0x2c4ed4, 0x6c77e0, 0x2f2fe0, 0x341efa, 0x7161fa, 0x998efa, 0x9278fa, 0x7c66d4, 0x7034fa, 0x7243e0, 0x9479d4, 0xb98efa, 0x9c58e0, 0xc678fa, 0x912cd4, 0xa866d4, 0xc54bfa, 0xaf1ced, 0xc380e0, 0xba53d4, 0xc119d4, 0xfa61fa, 0xed1ced, 0xed87ed, 0xe058d3, 0xe01bb9, 0xe080cd, 0xfa78d3, 0xd440a7, 0xfa4bb4, 0xe01b91, 0xd466a8, 0xfa8ec4, 0xed1c85, 0xfa1e76, 0xfa619e, 0xe06c9a, 0xd42c6f, 0xed87a6, 0xe05881, 0xd42c5f, 0xfa1e4a, 0xfa7892, 0xe02f53, 0xfa1e34, 0xfa6171, 0xd4192c, 0xd47982];

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
		//General
		objectsPerLayer: 20,
		cameraZoom: 35,
		audioInterval: 85, //Should be < 85
		animationSpeed: 0.03, //should be < 0.05 or so
		xScale: 0.8, // should be < 1
		spinDirection: -1, //1 or -1
		expandAmount: 0.5, //around 0.5
		expandThreshold: 35, //20 to 60 range or so
		expanding: false, //true or false
		changeDirectionTime: 60, //pretty much any number
		colorIndex: 0, //0 to colorArray.length
		//Inner circle
		innerRotX: 0,
		innerRotY: 0,
		innerRotZ: 0,
		innerRadius: 5,
		minInnerRadius: 1,
		maxInnerRadius: 25,
		//Outer circle
		outerRotX: 0,
		outerRotY: 0,
		outerRotZ: 0,
		outerRadius: 15,
		minOuterRadius: 11,
		maxOuterRadius: 35,
		//Stuff
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
	material = new THREE.MeshBasicMaterial( { color: colorArray[0] } );
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
function expand() {
	if(parameters.innerRadius + parameters.expandAmount <= parameters.maxInnerRadius) {
		parameters.innerRadius += parameters.expandAmount;
		for(var i=0; i<meshes.length/2; i++) {
			meshes[i].position.y += parameters.expandAmount;
		}
		parameters.expanding = true;
	}
	if(parameters.outerRadius + parameters.expandAmount <= parameters.maxOuterRadius) {
		parameters.outerRadius += parameters.expandAmount;
		for(var i=meshes.length/2; i<meshes.length; i++) {
			meshes[i].position.y += parameters.expandAmount;
		}
		parameters.expanding = true;
	}
	
}
function contract() {
	if(parameters.innerRadius - parameters.expandAmount >= parameters.minInnerRadius) {
		parameters.innerRadius -= parameters.expandAmount;
		for(var i=0; i<Math.floor(meshes.length/2); i++) {
			meshes[i].position.y -= parameters.expandAmount;
		}
		parameters.expanding = false;
	}
	if(parameters.outerRadius - parameters.expandAmount >= parameters.minOuterRadius) {
		parameters.outerRadius -= parameters.expandAmount;
		for(var i=Math.floor(meshes.length/2); i<meshes.length; i++) {
			meshes[i].position.y -= parameters.expandAmount;
		}
		parameters.expanding = false;
	}
}

function incrementColor(index) {
	material.color.setHex(colorArray[index]);
}

function update() {

	analyser.getByteFrequencyData(freqByteData);
	analyser.getByteTimeDomainData(timeByteData);

	var interval = parameters.audioInterval;


	//EXPANSION AND CONTRACTION
	sum = 0;
	j = 0;
	for(var i = j; i < 512; i++) {
		sum += freqByteData[i];
	}
	sum = radiusNormalize(sum) * 0.1;
	if(Math.abs(sum-lastSum) >= parameters.expandThreshold) {
		if(parameters.expanding) {
			parameters.expanding = false;
		}
		else {
			parameters.expanding = true;
		}
	}
	lastSum = sum;


	//COLOR
	var range = sum / colorArray.length;
	
	//ROTATION
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
	if(fakeTime > parameters.changeDirectionTime) {
		parameters.spinDirection *= -1;
		fakeTime = 0;
	}
	if(parameters.expanding) {
		expand();
	}
	else {
		contract();
	}



	renderer.render( scene, camera );

	innerparent.rotation.x += parameters.innerRotX * parameters.spinDirection;
	innerparent.rotation.y += parameters.innerRotY * parameters.spinDirection;
	innerparent.rotation.z += parameters.innerRotZ * parameters.spinDirection;
	outerparent.rotation.x += parameters.outerRotX * parameters.spinDirection;
	outerparent.rotation.y += parameters.outerRotY * parameters.spinDirection;
	outerparent.rotation.z += parameters.outerRotZ * parameters.spinDirection;
}