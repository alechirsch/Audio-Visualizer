/*from http://airtightinteractive.com/demos/js/reactive/	*/
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();



//var container
var stats;

var camera, scene;//, renderer;

var uniforms;



//init();
//animate();

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
	//container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	camera.position.z = 5;

	scene = new THREE.Scene();

	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	var spheregeometry = new THREE.SphereGeometry(0.8, 16, 16);
    var spherematerial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x00ff00});
    var sphere = new THREE.Mesh(spheregeometry, spherematerial);

    sphere.position.set(0, 0, 0);

    scene.add(sphere);

	uniforms = {
		time: { type: "f", value: 1.0 },
		color1: { type: "f", value: 0.0},
		color2: { type: "f", value: 0.0},
		color3: { type: "f", value: 0.0},
		color4: { type: "f", value: 0.0},
		sphereShape: sphere,
		resolution: { type: "v2", value: new THREE.Vector2() }
	};

	//renderer = new THREE.WebGLRenderer();
	//container.appendChild( renderer.domElement );




	LoopVisualizer.init();

/*
	if(<%= youtube %>){
		loadYoutube('<%= video_id %>');
	}
	*/
}






/*** END FROM http://airtightinteractive.com/demos/js/reactive/ ***/





function animate() {

	requestAnimationFrame( animate );

	render();
	/*stats.update();*/

}
var temp = 1;
function render() {
	LoopVisualizer.update(source);

	//uniforms.sphereShape.scale.multiplyScalar((1 / temp));
	temp = LoopVisualizer.parameters.sphereScale;
	//uniforms.sphereShape.scale.multiplyScalar(LoopVisualizer.parameters.sphereScale);
	uniforms.sphereShape.rotation.x += LoopVisualizer.parameters.sphereScaleX;
	uniforms.sphereShape.rotation.y += LoopVisualizer.parameters.sphereScaleY;
	uniforms.sphereShape.rotation.z += LoopVisualizer.parameters.sphereScaleZ;



	uniforms.time.value += 0.05;
	renderer.render( scene, camera );

}