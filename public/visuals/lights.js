var LightsVisual = {	

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
		var xpos = -4;
		var ypos = 6;
		for(var i=0; i<25; i++) {
			if(i % 5 === 0) {
				xpos = -4;
				ypos -= 2;
			}
			parameters.gridlights.push(new THREE.PointLight(colorArray[colorArray.length/2], 0.5));
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

		//Spinner(s)
	},

	updateGirdIntensity: function(index) {

	},

	incrementBigIntensity: function() {

	},

	decrementBigIntensity: function() {

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

	updateLightColor: function(index) {

	},

	update: function() {
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
			else if(parameters.gridsums[k] > parameters.lastgridsums[k] + 3000 && parameters.gridlights[k].intensity < 0.5) {
				parameters.gridlights[k].intensity += 0.00002;
				parameters.gridlights[k].color.setHex(colorArray[parameters.gridsums[k] % colorArray.length]);
				parameters.increasing[k] = true;
			}
			else if(parameters.gridsums[k] < parameters.lastgridsums[k]) {
				parameters.gridlights[k].intensity -= 0.00002;
				parameters.gridlights[k].color.setHex(colorArray[parameters.gridsums[k] % colorArray.length]);
				parameters.increasing[k] = false;
			}
			else {
				if(parameters.increasing[k] && parameters.gridlights[k].intensity < 0.5) {
					parameters.gridlights[k].intensity += 0.00002;	
				}
				else {
					parameters.gridlights[k].intensity -= 0.00002;
				}
			}
			parameters.lastgridsums[k] = parameters.gridsums[k];
		}
		
		//console.log(sum);

		//UPDATE BIGLIGHT
		/*parameters.biglight.intensity = sum / 100;
		parameters.biglight.color.setHex(colorArray[0]);*/

		//UPDATE SPOTLIGHTS
		/*var sums = [0, 0, 0, 0, 0, 0];
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
		this.updateSpotlightPositions(sums);*/

		//FIRE SPINNER
	},

	render: function() {
		this.update(source);
		renderer.render( scene, camera );
	}
};