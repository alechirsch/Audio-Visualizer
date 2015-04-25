CylinderVisual = {
	cylinderArray: [],

	init: function() {
		/*start ThreeJS scene*/
		this.cylinderArray = [];
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		camera.position.z = 5;
		camera.position.x = 1;
		camera.position.y = 2;
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		scene = new THREE.Scene();

		/* SPHERE */
		var spheregeometry = new THREE.SphereGeometry(0.8, 16, 16);
		var spherematerial = new THREE.MeshBasicMaterial({color: 0x000000});
		var sphere = new THREE.Mesh(spheregeometry, spherematerial);
		sphere.position.set(0, 0, 0);
		scene.add(sphere);
		/* CYLINDER */
		var cylindergeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.55, 10);
		cylindergeometry.verticesNeedUpdate = true;
		cylindergeometry.normalsNeedUpdate = true;
		cylindergeometry.colorsNeedUpdate = true;
		var cylindermaterial = new THREE.MeshBasicMaterial();
		var cylinder = new THREE.Mesh(cylindergeometry, cylindermaterial);
		cylinder.position.set(0,0,0);
		this.createCylinders(cylinder, 0);
		parameters = {
			sphereShape: sphere,
			cylGeo: cylindergeometry,
			cylMaterial: cylindermaterial,
			cylinderHeights: [],
			cylinderWidths: [],
			cameraX: 0,
			cameraY: 0,
			cameraZ: 0,
		};
	},

	createCylinders: function(cylinder, depth){
		if(depth === 2) return;
		for(var i = 0; i < 8; i++){
			if(depth === 0){
				cylinder.rotation.x += Math.PI/8;
				this.createCylinders(cylinder.clone(), depth + 1);
				cylinder.rotation.x += Math.PI/8;
			}
			else if(depth === 1){
				cylinder.rotation.z += Math.PI/8;
				this.createCylinders(cylinder.clone(), depth + 1);
				cylinder.rotation.z += Math.PI/8;
			}
			var cylindermaterial = new THREE.MeshBasicMaterial();
			cylinder.material = cylindermaterial;
			this.cylinderArray[this.cylinderArray.length] = cylinder;
			scene.add(cylinder);
			cylinder = cylinder.clone();
		}
	},

	update: function() {
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);
		sum = 0;
		for(var i = 5; i <= 71; i++){
			for(var j = 1; j <= 10; j++){
				sum += freqByteData[i*j];
			}
			parameters.cylinderHeights[i] = normalize(sum, 72 * 255) * 30;
			sum = 0;
		}
		for(var i = 5; i <= 71; i++){
			for(var j = 1; j <= 2; j++){
				sum += freqByteData[i*j];
			}
			parameters.cylinderWidths[i] = normalize(sum, 72 * 255) * 30;
			sum = 0;
		}
		for(var i = 12; i < 17; i++){
			sum += freqByteData[i];
		}
		parameters.cameraX += normalize(sum, 5 * 255) * 0.001;
		sum = 0;
		for(var i = 78; i < 92; i++){
			sum += timeByteData[i];
		}
		parameters.cameraY += normalize(sum, 14 * 255) * 0.001;

		sum = 0;
		for(var i = 122; i < 134; i++){
			sum += timeByteData[i];
		}
		parameters.cameraZ += normalize(sum, 12 * 255) * 0.001;
	},

	updateCylinderColor: function(material, height){
		var colorIndex = normalize(height, 30) >= 1 ? colorArray.length - 1 : Math.floor(normalize(height, 30)*colorArray.length);
		material.color.setHex(colorArray[colorIndex]);
	},

	updateCylinders: function(){
		for(var i = 0; i < this.cylinderArray.length; i++){
			this.cylinderArray[i].scale.y = parameters.cylinderHeights[i]*0.4 + 1;
			this.cylinderArray[i].scale.x = parameters.cylinderWidths[this.cylinderArray.length - i] + 0.1;
			this.cylinderArray[i].scale.z = parameters.cylinderWidths[this.cylinderArray.length - i] + 0.1;
			this.updateCylinderColor(this.cylinderArray[i].material, parameters.cylinderHeights[i]);
		}
	},

	render: function() {
		this.update(source);
		this.updateCylinders();
		camera.position.x = Math.cos(parameters.cameraX) * 5;
		camera.position.y = Math.sin(parameters.cameraY) * 5;
		camera.position.z = camera.position.x + camera.position.y < 3 ? 3 : camera.position.x + camera.position.y;
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		renderer.render( scene, camera );
	}
};