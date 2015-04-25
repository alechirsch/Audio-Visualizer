var LightsVisual = {	

	init: function() {
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

		parameters = {
			//OBJECTS
			canvas: {},
			canvasgeometry: {},
			canvasmaterial: {},
			spotlight: {},
			lights: [],

			//Params
			n: 5, //NxN lights total
			threshold: 0.5,
			cameraZoom: 5
		};

		//Set up scene
		scene = new THREE.Scene();
		camera.position.z = parameters.cameraZoom;

		//"Canvas"
		parameters.canvasgeometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight, 32 );
		parameters.canvasmaterial = new THREE.MeshPhongMaterial({
			color: 0x000000,
			specular: 0xffffff,
			shininess: 500
		});
		parameters.canvas = new THREE.Mesh( parameters.canvasgeometry, parameters.canvasmaterial );
		scene.add( parameters.canvas );

		//SpotLights
		var xpos = -4;
		var ypos = 4;
		for(var i=0; i<parameters.n; i++) {
			xpos = (i*2)-4;
			ypos = 4;
			parameters.lights.push([]);
			for(var j=0; j<parameters.n; j++) {
				parameters.lights[i].push(new THREE.SpotLight(colorArray[12], 1));
				parameters.lights[i][j].position.set(xpos, ypos, 1);
				scene.add(parameters.lights[i][j]);
				ypos -= 2;
			}
		}

	},

	incrementIntensity: function(index) {

	},

	decrementIntensity: function(index) {

	},

	updateLightColor: function(index) {

	},

	update: function() {
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);
		sum = 0;
		var interval = 512 / (parameters.n*parameters.n);
		var colorIndex = 0;

		for(var i=0; i<512; i++) {
			sum += freqByteData[i];
		}
		colorIndex = sum % colorArray.length;

		for(var i=0; i<parameters.n; i++) {
			for(var j=0; j<parameters.n; j++) {
				parameters.lights[i][j].color.setHex(colorArray[colorIndex]);
			}
		}
		console.log(sum);

		if(sum > parameters.threshold) {
			
		}

	},

	render: function() {
		this.update(source);
		renderer.render( scene, camera );
	}
};