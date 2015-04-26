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

			//Spotlight params
			spotlightx: [0,0,0],
			spotlighty: [0,0,0],
			lastSumsSpotlight: [0,0,0],
			xdir: [1,1,1],
			ydir: [1,1,1],
			xmax: 1.5,
			ymax: 0.7,
			spottheshold: 0.06,
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
		for(var i=0; i<3; i++) {
			parameters.spotlights.push(new THREE.DirectionalLight(colorArray[12], 0.1));
		}
		parameters.spotlights[0].position.set(-1.5 ,0.7 , 1);
		parameters.spotlights[1].position.set(1.5 ,0.7 , 1);
		parameters.spotlights[2].position.set(0 ,-0.7 , 1);
		scene.add(parameters.spotlights[0]);
		scene.add(parameters.spotlights[1]);
		scene.add(parameters.spotlights[2]);
	},

	updateSpotlightPositions: function(sums) {
		for(var i=0; i<3; i++) {
			if(sums[i] > parameters.spottheshold) {
				//parameters.xdir[i] *= -1;
			}
			if(sums[i+3] > parameters.spottheshold) {
				parameters.ydir[i] *= -1;
			}
		}

		for(var i=0; i<3; i++) {
			if((parameters.xdir[i] === 1 && parameters.spotlightx[i] > parameters.xmax) || (parameters.xdir[i] === -1 && parameters.spotlightx[i] < parameters.xmax * -1)) {
				//parameters.xdir[i] *= -1;
			}
			parameters.spotlightx += (sums[i] * parameters.xdir[i]);
			if((parameters.ydir[i] === 1 && parameters.spotlighty[i] > parameters.ymax) || (parameters.ydir[i] === -1 && parameters.spotlighty[i] < parameters.ymax * -1)) {
				parameters.ydir[i] *= -1;
			}
		}
		for(var i=0; i<3; i++) {
			parameters.spotlightx[i] += (parameters.speed * parameters.xdir[i]);
			//console.log((parameters.speed * parameters.xdir[i]));
			//console.log(parameters.spotlightx[i] + parameters.speed);
			parameters.spotlighty[i] += (parameters.speed * parameters.ydir[i]);
			parameters.spotlights[i].position.set(parameters.spotlightx[i] , parameters.spotlighty[i], 1);
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
			parameters.colorIndex = colorArray / 2;
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
			else if(parameters.gridsums[k] > parameters.lastgridsums[k] + 3000 && parameters.gridlights[parameters.randomizedIndex[k]].intensity < 0.5) {
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
		
		//console.log(sum);

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
		var sums = [0, 0, 0, 0, 0, 0];
		for(var i=0; i<85; i++) {
			sums[0] += freqByteData[i];
		}
		for(var i=85; i<170; i++) {
			sums[1] += freqByteData[i];
		}
		if(Math.abs((sums[0]+sums[1]) - parameters.lastSumsSpotlight[0]) > 2000) {
			parameters.spotlights[0].color.setHex(colorArray[(sums[0]+sums[1]) % colorArray.length]);
		}
		parameters.lastSumsSpotlight[0] = sums[0]+sums[1];
		for(var i=170; i<255; i++) {
			sums[2] += freqByteData[i];
		}
		for(var i=255; i<340; i++) {
			sums[3] += freqByteData[i];
		}
		if(Math.abs((sums[2]+sums[3]) - parameters.lastSumsSpotlight[1]) > 2000) {
			parameters.spotlights[1].color.setHex(colorArray[(sums[2]+sums[3]) % colorArray.length]);
		}
		parameters.lastSumsSpotlight[1] = sums[2]+sums[3];
		for(var i=340; i<425; i++) {
			sums[4] += freqByteData[i];
		}
		for(var i=425; i<512; i++) {
			sums[5] += freqByteData[i];
		}
		if(Math.abs((sums[4]+sums[5]) - parameters.lastSumsSpotlight[2]) > 2000) {
			parameters.spotlights[2].color.setHex(colorArray[(sums[4]+sums[5]) % colorArray.length]);
		}
		parameters.lastSumsSpotlight[2] = sums[4]+sums[5];
		for(var i=0; i<6; i++) {
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