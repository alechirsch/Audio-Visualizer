var FallingVisual = {
	init: function() {
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		
		parameters = {
			canvas: {},
			spheres: [],
			sums: [],
			motionThreshold: 350,
			motionIntensity: 70 //more is less	
		};

		camera.position.z = 120;
		camera.position.y = -10;
		scene = new THREE.Scene();
		var canvasgeometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight, 32 );
		var canvasmaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
		parameters.canvas = new THREE.Mesh(canvasgeometry, canvasmaterial);
		//scene.add(parameters.canvas);
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		var light = new THREE.AmbientLight( 0xffffff );
		//scene.add( light );
		var hemlight = new THREE.HemisphereLight(0xe6af29, 0x209fb7, 1);
		scene.add(hemlight);

		var geometry = new THREE.SphereGeometry(2.5, 32, 32);
		var material = new THREE.MeshPhongMaterial( { 
			color: 0xffffff,
			specular: 0xffffff,
			shininess: 500
		});
		var x = -80;
		var y = -60;
		for(var i=0; i<256; i++) {
			parameters.spheres.push(new THREE.Mesh(geometry, material));
			parameters.spheres[i].position.x = x;
			parameters.spheres[i].position.y = y;
			parameters.spheres[i].position.z = 1;
			if((i+1) % 16 === 0) {
				x = -80;
				y += 10;
			}
			else {
				x += 10;
			}
			scene.add(parameters.spheres[i]);
		}

		for(var i=0; i<256; i++) {
			parameters.sums.push(0);
		}
	},

	update: function() {
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);
		var j = 0;
		for(var i=0; i<512; i+=2) {
			parameters.sums[j] = freqByteData[i] + freqByteData[i+1];
			j++;
		}
		for(var i=0; i<256; i++) {
			if(parameters.sums[i] > parameters.motionThreshold) {
				parameters.spheres[i].position.z = normalize(parameters.sums[i], 40);
			}
			else if(parameters.sums[i] > 1) {
				parameters.spheres[i].position.z--;
			}
			else {
				parameters.spheres[i].position.z = 1;
			}
		}
	},

	render: function() {
		this.update(source);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		renderer.render( scene, camera );
	}
};