var sphereSpin = {

	camera: new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000),

	init: function() {
		
		this.camera.position.z = 5;

		scene = new THREE.Scene();

		var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

		var spheregeometry = new THREE.SphereGeometry(0.8, 16, 16);
	    var spherematerial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x00ff00});
	    var sphere = new THREE.Mesh(spheregeometry, spherematerial);

	    sphere.position.set(0, 0, 0);

	    scene.add(sphere);

		this.parameters = {
			time: { type: "f", value: 1.0 },
			sphereScaleX: 1,
			sphereScaleY: 1,
			sphereScaleZ: 1,
			sphereShape: sphere,
			resolution: { type: "v2", value: new THREE.Vector2() }
		};
	},

	audioInit: function() {
		freqByteData = new Uint8Array(analyser.frequencyBinCount);
		timeByteData = new Uint8Array(analyser.frequencyBinCount);
		this.onParamsChange();
	},

	onParamsChange: function() {
			console.log("I got here");
			/* when a parameter is changed, change it */

	},

	normalize: function(value) {
			return value/max;
	},

	update: function() {

			analyser.getByteFrequencyData(freqByteData);
			analyser.getByteTimeDomainData(timeByteData);

			sum = 0;
			j = 0;
			for(var i = j; i < j+20; i++) {
				sum += freqByteData[i];
			}
			this.parameters.sphereScaleX = this.normalize(sum) * 0.1;
			
			sum = 0;
			j = 20;
			for(var i = j; i < j+20; i++) {
				sum += freqByteData[i];
			}
			this.parameters.sphereScaleY = this.normalize(sum) * 0.1;
			
			sum = 0;
			j = 40;
			for(var i = j; i < j+20; i++) {
				sum += freqByteData[i];
			}
			this.parameters.sphereScaleZ = this.normalize(sum) * 0.1;
	},

	temp: 1,

	render: function() {
		this.update(source);

		//uniforms.sphereShape.scale.multiplyScalar((1 / temp));
		//temp = LoopVisualizer.parameters.sphereScale;
		//uniforms.sphereShape.scale.multiplyScalar(LoopVisualizer.parameters.sphereScale);
		this.parameters.sphereShape.rotation.x += this.parameters.sphereScaleX;
		this.parameters.sphereShape.rotation.y += this.parameters.sphereScaleY;
		this.parameters.sphereShape.rotation.z += this.parameters.sphereScaleZ;



		this.parameters.time.value += 0.05;
		renderer.render( scene, this.camera );

	}
};