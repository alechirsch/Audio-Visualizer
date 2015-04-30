var FallingVisual = {
	init: function() {
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		
		parameters = {
			canvas: {},
			running: false,
			spheres: [],
			materials: [],
			hemlight: {},
			sums: [],
			falling: [],
			motionThreshold: 350,
			colorThreshold: 2000,
			motionIntensity: 70, //more is less	
			lastSum: 0
		};

		camera.position.z = 120;
		camera.position.y = -10;
		scene = new THREE.Scene();

		camera.lookAt(new THREE.Vector3(0, 0, 0));

		parameters.hemlight = new THREE.HemisphereLight(0xe6af29, 0x209fb7, 1);
		scene.add(parameters.hemlight);

		var geometry = new THREE.SphereGeometry(2.5, 32, 32);
		for(var i=0; i<256; i++) {
			parameters.materials.push(new THREE.MeshPhongMaterial( { 
				color: 0xffffff,
				specular: 0xffffff,
				shininess: 500
			}));
		}
		var x = -80;
		var y = -60;
		for(var i=0; i<256; i++) {
			parameters.spheres.push(new THREE.Mesh(geometry, parameters.materials[i]));
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
			parameters.falling.push(false);
		}
	},

	update: function() {
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

		//Position
		var j = 0;
		for(var i=0; i<512; i+=2) {
			parameters.sums[j] = freqByteData[i] + freqByteData[i+1];
			j++;
		}
		for(var i=0; i<256; i++) {
			if(parameters.sums[i] > parameters.motionThreshold) {
				parameters.spheres[i].position.z = normalize(parameters.sums[i], 40);
				parameters.falling[i] = false;
			}
			else if(parameters.sums[i] > 1) {
				parameters.spheres[i].position.z--;
				parameters.falling[i] = true;
			}
			else {
				parameters.spheres[i].position.z = 1;
				parameters.falling[i] = false;
			}
		}

		//Color
		sum = 0;
		for(var i=0; i<512; i++) {
			sum += freqByteData[i];
		}
		if(!parameters.running || Math.abs(sum-parameters.lastSum) > parameters.colorThreshold ) {
			var ind = Math.abs(sum-parameters.lastSum) % colorArray.length;
			for(var j=0; j<256; j++) {
				if(!parameters.falling[j]) {
					parameters.materials[j].color.setHex(colorArray[ind]);
				}
			}
		}
		parameters.lastSum = sum;
		if(sum !== 0) {
			parameters.running = true;
		}
	},

	render: function() {
		this.update(source);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		renderer.render( scene, camera );
	}
};