var TerrainVisual = {
	parameters: {},

	init: function() {
		/*start ThreeJS scene*/
		camera.position.x = -60;
		camera.position.y = 80;
		camera.position.z = -140;
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		scene = new THREE.Scene();

		parameters = {
			lines: [],
			newHeights: [],
			time: 0
		};
		this.createLines();
		for(var i = 0; i < 257; i++){
			parameters.newHeights[i] = 0;
		}
	},

	createLines: function(){
		var x = -50, z = -128;
		var material = new THREE.LineBasicMaterial({color: 0xFF0000});
		for(var i = 0; i < 256; i++){
			var geometry = new THREE.Geometry();
			for(var j = 0; j < 100; j++){
				geometry.vertices.push(new THREE.Vector3(x + 4*j, 0, z + i));
			}
			geometry.verticesNeedUpdate = true;
			geometry.colorsNeedUpdate = true;
			var line = new THREE.Line(geometry, material);
			parameters.lines[i] = line;
			scene.add(line);
		}
		console.log(parameters.lines[0]);
	},

	normalize: function(value, max){
		return (value)/(max);
	},

	update: function() {
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);
		sum = 0;

		for(var i = 0; i < 512; i++){
			sum += freqByteData[i];
			if(i % 2 === 0 && i !== 0){
				parameters.newHeights[i/2 - 1] = Math.floor(normalize(sum, 2 * 256) * 25);
				sum = 0;
			}
		}

	},

	updateVertexColor: function(geometry , j){
		var colorIndex = normalize(geometry.vertices[j].y, 25) >= 1 ? colorArray.length - 1 : Math.floor(normalize(geometry.vertices[j].y, 25)*colorArray.length);
		geometry.colors[j] = colorArray[colorIndex];
	},

	updateVertices: function(){
		for(var i = 0; i < parameters.lines.length; i++){
			var geometry = parameters.lines[i].geometry;
			for(var j = geometry.vertices.length - 1; j >= 0; j--){
				if(j === 0){
					geometry.vertices[j].y = parameters.newHeights[parameters.lines.length - i];
				}
				else{
					geometry.vertices[j].y = geometry.vertices[j-1].y;
				}
				this.updateVertexColor(geometry, j);
			}
			geometry.verticesNeedUpdate = true;
			geometry.colorsNeedUpdate = true;
		}
	},

	render: function() {
		this.update(source);
		this.updateVertices();
	//geometry.verticesNeedUpdate = true;
	//geometry.colorsNeedUpdate = true;

	//console.log(camera.position.x+","+ camera.position.y+","+ camera.position.z);
	parameters.time += 1;
	if(parameters.time > 10000000) parameters.time = 0;
	renderer.render( scene, camera );
}

};