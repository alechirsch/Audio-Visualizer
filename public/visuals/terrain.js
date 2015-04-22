
var Terrain = {

	SEGMENTS: 512,
	BIN_COUN: 512,
	min: 0, sum: 0, max: 255 * 20,
	counter: 0,
	colorArray: [0xfa1e34, 0xfa6171, 0xd4192c, 0xd47982, 0xfa1e4a, 0xfa7892, 0xe02f53, 0xed87a6, 0xe05881, 0xd42c5f, 0xfa1e76, 0xfa619e, 0xe06c9a, 0xd42c6f, 0xfa8ec4, 0xed1c85, 0xfa4bb4, 0xe01b91, 0xd466a8, 0xfa78d3, 0xd440a7, 0xe01bb9, 0xe080cd, 0xe058d3, 0xfa61fa, 0xed1ced, 0xed87ed, 0xc119d4, 0xba53d4, 0xc54bfa, 0xaf1ced, 0xc380e0, 0xc678fa, 0x912cd4, 0xa866d4, 0x9c58e0, 0xb98efa, 0x7034fa, 0x7243e0, 0x9479d4, 0x9278fa, 0x7c66d4, 0x341efa, 0x7161fa, 0x998efa, 0x2f2fe0, 0x6c77e0, 0x1e4afa, 0x4b6efa, 0x879ced, 0x2c4ed4, 0x2c5fd4, 0x7994d4, 0x619efa, 0x8eb9fa, 0x327ded, 0x407bd4, 0x669dd4, 0x34abfa, 0x5cb3ed, 0x80bae0, 0x1989d4, 0x47bbed, 0x80c3e0, 0x61dbfa, 0x80cde0, 0x19aed4, 0x61ebfa, 0x19c1d4, 0x34fafa, 0x80e0e0, 0x8efaef, 0x1cedd8, 0x53d4c7, 0x8efada, 0x47edbb, 0x79d4b8, 0x66d4a8, 0x34fa97, 0x8efac4, 0x43e092, 0x1efa60, 0x2fe064, 0x80e09d, 0x87ed91, 0x2cd42c, 0x7eed72, 0x60fa1e, 0x87d466, 0xb9fa8e, 0x8fed32, 0x8ad440, 0xbdfa61, 0xafd479, 0xafed1c, 0xadd453, 0xe0fa78, 0xb2d42c, 0xe6fa34, 0xcbd479, 0xe0e02f, 0xe0e06c, 0xfae41e, 0xd4c119, 0xfad234, 0xfadb61, 0xd4b22c, 0xd4c179, 0xfab81e, 0xfada8e, 0xedc25c, 0xd49c19, 0xd4b366, 0xfaab34, 0xfabd61, 0xedc487, 0xd48919, 0xfab978, 0xed8f32, 0xe0b080, 0xd48a3f, 0xfa761e, 0xfab98e, 0xe0762f, 0xe08e58, 0xfa8f61, 0xed6a32, 0xeda687, 0xd46c3f, 0xfa4a1e, 0xed6847, 0xed8b72, 0xd43f19, 0xd48b79, 0xfa998e, 0xe05343, 0xfa1e1e, 0xfa6161, 0xd41919, 0xd46666],
	circleArray: [],
	parameters: [],

	init: function() {
		try {
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			audioContext = new window.AudioContext();
		} catch(e) {
			return;
		}
		window.addEventListener('touchstart', function() {
			/* create empty buffer */
			var buffer = audioContext.createBuffer(1, 1, 22050);
			var source = audioContext.createBufferSource();
			source.buffer = buffer;
			/* connect to output (your speakers) */
			source.connect(audioContext.destination);
			/* play the file */
			source.noteOn(0);
		}, false);

		/* init audio */
		analyser = audioContext.createAnalyser();
		analyser.smoothingTimeConstant = 0.01;
		analyser.fftSize = 1024;

		/*start ThreeJS scene*/
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		this.camera.position.x = -60;
		this.camera.position.y = 80;
		this.camera.position.z = -140;
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));



		this.scene = new THREE.Scene();

		this.parameters = {
			lines: [],
			newHeights: [],
			time: 0
		};
		this.createLines();
		for(var i = 0; i < 257; i++){
			this.parameters.newHeights[i] = 0;
		}

		this.audioInit();
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
			this.parameters.lines[i] = line;
			this.scene.add(line);
		}
		console.log(this.parameters.lines[0]);
	},


	audioInit: function(){
		freqByteData = new Uint8Array(analyser.frequencyBinCount);
		timeByteData = new Uint8Array(analyser.frequencyBinCount);
		this.onParamsChange();
	},

	onParamsChange: function() {
		console.log("I got here");
		/* when a parameter is changed, change it */
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
				this.parameters.newHeights[i/2 - 1] = Math.floor(this.normalize(sum, 2 * 256) * 25);
				sum = 0;
			}
		}

	},

	updateVertexColor: function(geometry , j){
		var colorIndex = this.normalize(geometry.vertices[j].y, 25) >= 1 ? this.colorArray.length - 1 : Math.floor(this.normalize(geometry.vertices[j].y, 25)*this.colorArray.length);
		geometry.colors[j] = this.colorArray[colorIndex];
	},

	updateVertices: function(){
		for(var i = 0; i < this.parameters.lines.length; i++){
			var geometry = this.parameters.lines[i].geometry;
			for(var j = geometry.vertices.length - 1; j >= 0; j--){
				if(j === 0){
					geometry.vertices[j].y = this.parameters.newHeights[this.parameters.lines.length - i];
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
	this.parameters.time += 1;
	if(this.parameters.time > 10000000) this.parameters.time = 0;
	renderer.render( this.scene, this.camera );
}

};