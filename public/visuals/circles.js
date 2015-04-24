var CirclesVisual = {
	counter: 0,
	circleArray: [],
	parameters: {},

	init: function() {
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		camera.position.x = 0;
		camera.position.y = 135;
		camera.position.z = 200;
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		scene = new THREE.Scene();

		var material = new THREE.LineBasicMaterial({color: 0x0000ff});
		var radius = 1;
		var segments = 20;

		var circleGeometry = new THREE.CircleGeometry( radius, segments );				
		var circle = new THREE.Line( circleGeometry, material );
		circleGeometry.vertices.shift();
		circle.position.set(0, 0, 0);
		circle.rotation.x = -Math.PI/2;
		circle.rotation.y = 0;
		scene.add( circle );
		this.circleArray[0] = circle;
		parameters = {
			newHeight: 0
		};

		this.createCircles(2, 20);

	},

	createCircles: function(radius, segments){
		if(radius > 150) return;
		var circleGeometry = new THREE.CircleGeometry( radius, segments );	
		var circleMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});				
		var circle = new THREE.Line( circleGeometry, circleMaterial );
		circleGeometry.vertices.shift();
		circle.position.set(0, 0, 0);
		circle.rotation.x = -Math.PI/2;
		circle.rotation.y = 0;
		scene.add( circle );
		this.circleArray[radius - 1] = circle;
		this.createCircles(radius + 1, segments + 2);
	},

	update: function() {
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);
		sum = 0;

		for(var i = 0; i < 500; i++){
			sum += freqByteData[i];
		}

		parameters.newHeight = normalize(sum, 500 * 255) * 70;
	},

	updateCircleColor: function(index){
		var colorIndex = normalize(this.circleArray[index].position.y, 45) >= 1 ? colorArray.length - 1 : Math.floor(normalize(this.circleArray[index].position.y, 45)*colorArray.length);
		this.circleArray[index].material.color.setHex(colorArray[colorIndex]);
	},

	updateCircleHeights: function(index){
		if(index === 0){
			this.circleArray[index].position.y = parameters.newHeight;
			this.updateCircleColor(index);
			return;
		}
		this.circleArray[index].position.y = this.circleArray[index - 1].position.y;
		this.updateCircleColor(index);
		this.updateCircleHeights(index - 1);
	},

	render: function() {
		this.update(source);
		this.updateCircleHeights(this.circleArray.length - 1);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		renderer.render( scene, camera );
	}
}