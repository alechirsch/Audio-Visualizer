var LightsVisual = {

	planegeometry: new THREE.PlaneGeometry(5, 20, 32),
	planematerial: new THREE.MeshBasicMaterial( { color: 0x2e90a4, side: THREE.DoubleSide } ),
	plane: new THREE.Mesh(this.planegeometry, this.planematerial), 
	
	init: function() {
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

		parameters = {

		};

		//Set up scene
		scene = new THREE.Scene();
		camera.position.z = 50;
		var renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		scene.add(this.plane);
		this.render();
	},

	update: function() {

		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);


	},

	render: function() {
		this.update(source);


		renderer.render( scene, camera );
	}
};