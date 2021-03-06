var SphereSpinVisual = {
	max: 256 * 20,
	init: function() {

		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		
		camera.position.z = 5;

		scene = new THREE.Scene();

		var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

		var spheregeometry = new THREE.SphereGeometry(0.8, 16, 16);
		var spherematerial = new THREE.MeshBasicMaterial({wireframe: true, color: colorArray[0]});
		var sphere = new THREE.Mesh(spheregeometry, spherematerial);

		sphere.position.set(0, 0, 0);

		scene.add(sphere);

		parameters = {
			time: { type: "f", value: 1.0 },
			sphereScaleX: 1,
			sphereScaleY: 1,
			sphereScaleZ: 1,
			sphereShape: sphere,
			sphereMat: spherematerial,
			resolution: { type: "v2", value: new THREE.Vector2() }
		};
	},

	update: function() {

		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

		sum = 0;
		j = 0;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.sphereScaleX = normalize(sum, this.max) * 0.1;
		
		sum = 0;
		j = 20;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.sphereScaleY = normalize(sum, this.max) * 0.1;
		
		sum = 0;
		j = 40;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.sphereScaleZ = normalize(sum, this.max) * 0.1;
	},

	temp: 1,

	updateColor: function(){
		var colorIndex = normalize(parameters.sphereScaleY, 0.1) >= 1 ? colorArray.length - 1 : Math.floor(normalize(parameters.sphereScaleY, 0.1)*colorArray.length);
		parameters.sphereMat.color.setHex(colorArray[colorIndex]);
	},

	render: function() {
		this.update(source);

		parameters.sphereShape.rotation.x += parameters.sphereScaleX;
		parameters.sphereShape.rotation.y += parameters.sphereScaleY;
		parameters.sphereShape.rotation.z += parameters.sphereScaleZ;

		this.updateColor();

		parameters.time.value += 0.05;
		renderer.render( scene, camera );

	}
};