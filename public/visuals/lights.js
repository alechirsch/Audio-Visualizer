var LightsVisual = {

	fakeTime: 0,	

	init: function() {
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

		parameters = {
			//OBJECTS
			canvas: {},
			canvasgeometry: {},
			canvasmaterial: {},
			gridlights: [],
			biglight: {},
			spotlights: [],
			spinners: [],

			//Gridlight params
			n: 5, //NxN lights total
			threshold: 0.5,
			cameraZoom: 5,
			colorIndex: 0,
			gridsums: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			lastgridsums: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			increasing: [],
			girdstate: [],
			randomizedIndex: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			allLightsVisible: true,
			girdlightThreshold: 2500,

			//Spotlight params
			spotlightx: [0,0,0],
			spotlighty: [0,0,0],
			lastSumsSpotlight: [0,0],
			xdir: [1,1,1],
			ydir: [1,1,1],
			xmax: 1.5,
			ymax: 0.7,
			spotthesholds: [0.16, 0.16, 0.06, 0.06],
			speed: 0.025,

			//Biglight params
			totalLastSum: 0,
			biglightOn: false,
			goingDown: false,

			//General params
			max: 256*20
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

		//GridLights
		var taken = [];
		var check = true;
		var temp;
		for(var i=0; i<25; i++) {
			taken.push(false);
		}
		var xpos = -4;
		var ypos = 6;
		for(var i=0; i<25; i++) {
			if(i % 5 === 0) {
				xpos = -4;
				ypos -= 2;
			}
			parameters.gridlights.push(new THREE.PointLight(colorArray[colorArray.length/2], 0.05));
			while(check) {
				temp = Math.floor(Math.random() * 25);
				check = taken[temp];
			}
			check = true;
			taken[temp] = true;
			parameters.randomizedIndex[i] = temp;
			parameters.increasing.push(false);
			parameters.gridlights[i].position.set(xpos, ypos, 1);
			scene.add(parameters.gridlights[i]);
			xpos += 2;
		}

		//BigLight
		parameters.biglight = new THREE.DirectionalLight(colorArray[12], 0);
		parameters.biglight.position.set( 0, 0, 1 );
		scene.add(parameters.biglight);

		//SpotLights
		for(var i=0; i<2; i++) {
			parameters.spotlights.push(new THREE.DirectionalLight(colorArray[12], 0.1));
		}
		parameters.spotlights[0].position.set(-1.5 ,0.7 , 1);
		parameters.spotlights[1].position.set(1.5 ,0.7 , 1);
		scene.add(parameters.spotlights[0]);
		scene.add(parameters.spotlights[1]);
	},

	updateSpotlightPositions: function(sums) {
		for(var i=0; i<2; i++) {
			if(sums[i] > parameters.spotthesholds[i]) {
				parameters.xdir[i] *= -1;
			}
			if(sums[i+2] > parameters.spotthesholds[i+2]) {
				parameters.ydir[i] *= -1;
			}
		}
		for(var j=0; j<2; j++) {
			if((parameters.xdir[j] === 1 && parameters.spotlightx[j] > parameters.xmax) || (parameters.xdir[j] === -1 && parameters.spotlightx[j] < parameters.xmax * -1)) {
				parameters.xdir[j] *= -1;
			}
			if((parameters.ydir[j] === 1 && parameters.spotlighty[j] > parameters.ymax) || (parameters.ydir[j] === -1 && parameters.spotlighty[j] < parameters.ymax * -1)) {
				parameters.ydir[j] *= -1;
			}
		}
		for(var k=0; k<2; k++) {
			parameters.spotlightx[k] += (parameters.speed * parameters.xdir[k]);
			parameters.spotlighty[k] += (parameters.speed * parameters.ydir[k]);
			parameters.spotlights[k].position.set(parameters.spotlightx[k], parameters.spotlighty[k], 1);
		}
	},

	makeAllLightsVisible: function() {
		if(parameters.allLightsVisible) {
			for(var i=0; i< parameters.gridlights.length; i++) {
				if(parameters.gridlights[i].intensity < 0.01) {
					parameters.gridlights[i].intensity = 0.01;
					parameters.gridlights[i].color.setHex(colorArray[0]);
				}
			}
		}
	},

	update: function() {
		this.fakeTime += 1;
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);
		sum = 0;
		var interval = 512 / (parameters.n*parameters.n);
		var colorIndex = 0;

		//UPDATE GRIDLIGHTS
		//In case colorArray was changed and index is out of bounds
		if(parameters.colorIndex >= colorArray.length) {
			parameters.colorIndex = colorArray.length / 2;
		}

		var start = 0
		var end = 0;
		for(var k=0; k<25; k++) {
			start = end;
			end += 20;
			for(var i=start; i<end; i++) {
				parameters.gridsums[k] += freqByteData[i];
			}
			if(parameters.gridsums[k] === 0) {
				//do nothing
			} 
			else if(parameters.gridsums[k] > parameters.lastgridsums[k] + parameters.girdlightThreshold && parameters.gridlights[parameters.randomizedIndex[k]].intensity < 0.5) {
				parameters.gridlights[parameters.randomizedIndex[k]].intensity += 0.00002;
				parameters.gridlights[parameters.randomizedIndex[k]].color.setHex(colorArray[parameters.gridsums[k] % colorArray.length]);
				parameters.increasing[parameters.randomizedIndex[k]] = true;
			}
			else if(parameters.gridsums[k] < parameters.lastgridsums[k] && parameters.gridlights[parameters.randomizedIndex[k]].intensity > 0.1) {
				parameters.gridlights[parameters.randomizedIndex[k]].intensity -= 0.00002;
				parameters.gridlights[parameters.randomizedIndex[k]].color.setHex(colorArray[parameters.gridsums[k] % colorArray.length]);
				parameters.increasing[parameters.randomizedIndex[k]] = false;
			}
			else {
				if(parameters.increasing[parameters.randomizedIndex[k]] && parameters.gridlights[parameters.randomizedIndex[k]].intensity < 0.5) {
					parameters.gridlights[parameters.randomizedIndex[k]].intensity += 0.00002;	
				}
				else if(parameters.gridlights[parameters.randomizedIndex[k]].intensity > 0.1) {
					parameters.gridlights[parameters.randomizedIndex[k]].intensity -= 0.00002;
				}
			}
			parameters.lastgridsums[k] = parameters.gridsums[k];
		}

		//UPDATE BIGLIGHT
		for(var i=0; i<512; i++) {
			sum += freqByteData[i];
		}
		if(Math.abs(sum-parameters.totalLastSum) > 45000 && this.fakeTime > 500) {
			parameters.biglight.intensity = 1.5;
			parameters.biglight.color.setHex(colorArray[sum % colorArray.length]);
			parameters.biglightOn = true;
			parameters.gridstate = [];
			for(var i=0; i<parameters.gridlights.length; i++) {
				parameters.gridstate.push(new THREE.PointLight(parameters.gridlights[i].color, parameters.gridlights[i].intensity));
				parameters.gridstate[i].position.x = parameters.gridlights[i].position.x;
				parameters.gridstate[i].position.y = parameters.gridlights[i].position.y;
				parameters.gridstate[i].position.z = parameters.gridlights[i].position.z;
				parameters.gridlights[i].intensity = 0;
			}
		}
		else if(parameters.biglightOn) {
			if(!parameters.goingDown){
				parameters.biglight.intensity = parameters.biglight.intensity * parameters.biglight.intensity;
				if(parameters.biglight.intensity > 100) {
					parameters.goingDown = true;
				}
			}
			else {
				parameters.biglight.intensity /= 10;
				if(parameters.biglight.intensity < 1.5) {
					this.fakeTime = 0;
					parameters.biglight.intensity = 0;
					parameters.goingDown = false;
					parameters.biglightOn = false;

					for(var i=0; i<parameters.gridlights.length; i++) {
						parameters.gridlights[i].intensity = parameters.gridstate[i].intensity;
						parameters.gridlights[i].color.setHex(parameters.gridstate.color);
						parameters.gridlights[i].position.x = parameters.gridstate[i].position.x;
						parameters.gridlights[i].position.y = parameters.gridstate[i].position.y;
						parameters.gridlights[i].position.z = parameters.gridstate[i].position.z;
					}

					//Re-randomize the gridlights
					var taken = [];
					var check = true;
					var temp;
					for(var i=0; i<25; i++) {
						taken.push(false);
					}
					for(var i=0; i<parameters.gridlights.length; i++) {
						while(check) {
						temp = Math.floor(Math.random() * 25);
						check = taken[temp];
						}
						check = true;
						taken[temp] = true;
						parameters.randomizedIndex[i] = temp;
					}
				}
			}
		}
		parameters.totalLastSum = sum;

		//UPDATE SPOTLIGHTS
		var sums = [0, 0, 0, 0];
		for(var i=0; i<128; i++) {
			sums[0] += freqByteData[i];
		}
		for(var i=128; i<256; i++) {
			sums[1] += freqByteData[i];
		}
		if(Math.abs((sums[0]+sums[1]) - parameters.lastSumsSpotlight[0]) > 2000) {
			parameters.spotlights[0].color.setHex(colorArray[(sums[0]+sums[1]) % colorArray.length]);
		}
		parameters.lastSumsSpotlight[0] = sums[0]+sums[1];
		for(var i=256; i<384; i++) {
			sums[2] += freqByteData[i];
		}
		for(var i=384; i<512; i++) {
			sums[3] += freqByteData[i];
		}
		if(Math.abs((sums[2]+sums[3]) - parameters.lastSumsSpotlight[1]) > 2000) {
			parameters.spotlights[1].color.setHex(colorArray[(sums[2]+sums[3]) % colorArray.length]);
		}
		parameters.lastSumsSpotlight[1] = sums[2]+sums[3];

		for(var i=0; i<4; i++) {
			sums[i] = normalize(sums[i], parameters.max) * 0.05;
		}
		this.updateSpotlightPositions(sums);

		//Finally make all lights visible (if that parameter is set to true)
		if(!parameters.biglightOn) {
			this.makeAllLightsVisible();
		}
	},

	render: function() {
		this.update(source);
		renderer.render( scene, camera );
	}
};