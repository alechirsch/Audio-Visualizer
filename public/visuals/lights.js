var LightsVisual = {	
	init: function() {
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

		//Set up scene
		scene = new THREE.Scene();
		camera.position.z = 50;

		//"Canvas"
		var canvasgeometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight, 32 );
		var canvasmaterial = new THREE.MeshPhongMaterial({
			color: 0x000000,
			specular: 0xffffff,
			shininess: 100
		});
		//var material = new THREE.MeshBasicMaterial({color: 0xa06ff0});
		var plane = new THREE.Mesh( canvasgeometry, canvasmaterial );
		scene.add( plane );

		//Lights
		var light = new THREE.DirectionalLight( 0x1f6e99 );
		light.position.set( 0, 0, 1 ).normalize();
		scene.add(light);

		parameters = {
			canvasgeo: canvasgeometry,
			canvasmat: canvasmaterial,
			canvas: plane
		};
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