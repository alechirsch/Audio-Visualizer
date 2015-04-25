var FlyingShapesVisual = {

	max: 256 * 20,

	geometry: new THREE.BoxGeometry(1,1,1),
	innerparent: new THREE.Mesh( this.geometry, this.parentmaterial ),
	outerparent: new THREE.Mesh( this.geometry, this.parentmaterial ),
	material: new THREE.MeshBasicMaterial( { color: colorArray[0] } ),
	parentmaterial: new THREE.MeshBasicMaterial( { visible: false } ),
	innerlayer: [],
	outerlayer: [],
	meshes: [],
	fakeTime: 0,
	lastSum: 0,

	init: function() {

		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

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
		};


		//Set up all the basic stuff
		scene = new THREE.Scene();
		camera.position.z = parameters.cameraZoom;
		var renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		var light = new THREE.PointLight( 0xff0000, 1, 0 );
		light.position.set( 5, -50, 10 );
		scene.add( light );
		scene.add( this.innerparent );
		scene.add( this.outerparent );

		//Create objects
		for(var i=0; i<parameters.objectsPerLayer; i++) {
			this.innerlayer.push(new THREE.Object3D());
		}
		for(var i=0; i<parameters.objectsPerLayer; i++) {
			this.outerlayer.push(new THREE.Object3D());
		}

		//Position the objects
		for(var i=0; i<parameters.objectsPerLayer; i++) {
			this.innerlayer[i].rotation.z = (i*2) * Math.PI / parameters.objectsPerLayer;
			this.outerlayer[i].rotation.z = (i*2) * Math.PI / parameters.objectsPerLayer;
		}

		//Give objects rotation hierarchy
		for(var i=0; i<parameters.objectsPerLayer; i++) {
			this.innerparent.add(this.innerlayer[i]);
			this.outerparent.add(this.outerlayer[i]);
		}

		//Give objects this.meshes
		for(var i=0; i<parameters.objectsPerLayer*2; i++) {
			this.meshes.push(new THREE.Mesh(this.geometry, this.material));
			if(i<parameters.objectsPerLayer) {
				this.meshes[i].position.y = parameters.innerRadius;
				this.innerlayer[i].add(this.meshes[i]);
			}
			else {
				this.meshes[i].position.y = parameters.outerRadius;
				this.outerlayer[i-parameters.objectsPerLayer].add(this.meshes[i]);
			}
		}
	},

	radiusNormalize: function(value) {
			var v = normalize(value, this.max) * 100;
			return v;
	},

	expand: function() {
		if(parameters.innerRadius + parameters.expandAmount <= parameters.maxInnerRadius) {
			parameters.innerRadius += parameters.expandAmount;
			for(var i=0; i<this.meshes.length/2; i++) {
				this.meshes[i].position.y += parameters.expandAmount;
			}
			parameters.expanding = true;
		}
		if(parameters.outerRadius + parameters.expandAmount <= parameters.maxOuterRadius) {
			parameters.outerRadius += parameters.expandAmount;
			for(var i=this.meshes.length/2; i<this.meshes.length; i++) {
				this.meshes[i].position.y += parameters.expandAmount;
			}
			parameters.expanding = true;
		}
		
	},

	contract: function() {
		if(parameters.innerRadius - parameters.expandAmount >= parameters.minInnerRadius) {
			parameters.innerRadius -= parameters.expandAmount;
			for(var i=0; i<Math.floor(this.meshes.length/2); i++) {
				this.meshes[i].position.y -= parameters.expandAmount;
			}
			parameters.expanding = false;
		}
		if(parameters.outerRadius - parameters.expandAmount >= parameters.minOuterRadius) {
			parameters.outerRadius -= parameters.expandAmount;
			for(var i=Math.floor(this.meshes.length/2); i<this.meshes.length; i++) {
				this.meshes[i].position.y -= parameters.expandAmount;
			}
			parameters.expanding = false;
		}
	},

	update: function() {

		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

		var interval = parameters.audioInterval;


		//EXPANSION AND CONTRACTION
		sum = 0;
		j = 0;
		for(var i = j; i < 512; i++) {
			sum += freqByteData[i];
		}
		sum = this.radiusNormalize(sum, this.max) * 0.1;
		if(Math.abs(sum-this.lastSum) >= parameters.expandThreshold) {
			if(parameters.expanding) {
				parameters.expanding = false;
			}
			else {
				parameters.expanding = true;
			}
		}
		this.lastSum = sum;


		//COLOR
		var range = sum / colorArray.length;
		
		//ROTATION
		sum = 0;
		j = 0;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.innerRotY = normalize(sum, this.max) * parameters.animationSpeed * parameters.xScale;
		
		sum = 0;
		j = interval;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.innerRotZ = normalize(sum, this.max) * parameters.animationSpeed * parameters.xScale;

		sum = 0;
		j = interval*2;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.outerRotX = normalize(sum, this.max) * parameters.animationSpeed;

		sum = 0;
		j = interval*3;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.outerRotY = normalize(sum, this.max) * parameters.animationSpeed;

		sum = 0;
		j = interval*4;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.outerRotZ = normalize(sum, this.max) * parameters.animationSpeed;

		j = interval*5;
		for(var i = j; i < j+interval; i++) {
			sum += freqByteData[i];
		}
		parameters.innerRotX = normalize(sum, this.max) * parameters.animationSpeed * parameters.xScale;
	},

	temp: 1,

	updateColor: function(index, maxval){
		var colorIndex = normalize(this.meshes[index].position.y, maxval) >= 1 ? colorArray.length - 1 : Math.floor(normalize(this.meshes[index].position.y, maxval)*colorArray.length);
		this.material.color.setHex(colorArray[colorIndex]);
	},

	render: function() {
		this.update(source);
		this.fakeTime += 0.1;

		this.innerparent.rotation.x += parameters.innerRotX * parameters.spinDirection;
		this.innerparent.rotation.y += parameters.innerRotY * parameters.spinDirection;
		this.innerparent.rotation.z += parameters.innerRotZ * parameters.spinDirection;
		this.outerparent.rotation.x += parameters.outerRotX * parameters.spinDirection;
		this.outerparent.rotation.y += parameters.outerRotY * parameters.spinDirection;
		this.outerparent.rotation.z += parameters.outerRotZ * parameters.spinDirection;

		for(var i=0; i<this.meshes.length/2; i++) {
			this.updateColor(i, parameters.maxInnerRadius);
		}
		for(var i=this.meshes.length/2; i<this.meshes.length; i++) {
			this.updateColor(i, parameters.maxOuterRadius);
		}

		if(this.fakeTime > parameters.changeDirectionTime) {
			parameters.spinDirection *= -1;
			this.fakeTime = 0;
		}
		if(parameters.expanding) {
			this.expand();
		}
		else {
			this.contract();
		}

		renderer.render( scene, camera );
	}
};