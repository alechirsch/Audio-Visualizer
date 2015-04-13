var LoopVisualizer = (function() {


	var SEGMENTS = 512;
	var BIN_COUNT = 512;


	var freqByteData;
	var timeByteData;

	//Vizualizer Params
	var vizParams = {
		gain:1,
		separation: 0.05,
		scale: 1,
		zbounce: 1,
		autoTilt: false
	};
	var parameters = {
		leftOffset: 1,
		horizontalStretch: 1,
		horizontalStretch2: 2,
		verticalStretch: 1,
		verticalStretch2: 1,
		bottomOffset: 1,
		speed: 1,
		speed2: 1,
		curve: 1,
		colorInversion: 1,
		size: 1,
		lineDistortion: 1,
		horizontalPulse: 1,
		verticalWaveDistortion: 1,
		curveIntensity: 1,
		circles: 1,
		unknown: 1,
		color1: 1,
		color2: 1,
		color3: 1,
		color4: 1,
		sphereScaleX: 1,
		sphereScaleY: 1,
		sphereScaleZ: 1,
	};
	var min = 0;
	var max = 255 * 20;
	function init() {

		////////INIT audio in
		freqByteData = new Uint8Array(analyser.frequencyBinCount);
		timeByteData = new Uint8Array(analyser.frequencyBinCount);

		

		onParamsChange();

	}

	function onParamsChange() {
		console.log("I got here");
		/* when a parameter is changed, change it */

	}

	function normalize(value){
		return (value - min) / (max - min);
	}
	function update() {

		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

		var sum = 0;
		var j = 0;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.horizontalStretch2 = ((1 - normalize(sum)) * 0.4) + 1.6;
		sum = 0;
		j = 20
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.curve = (1-normalize(sum)) * 300;
		sum = 0;
		j = 40;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.lineDistortion = normalize(sum) * 300;
		
		sum = 0;
		j = 0;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.sphereScaleX = normalize(sum) * 0.1;
		
		sum = 0;
		j = 20;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.sphereScaleY = normalize(sum) * 0.1;
		
		sum = 0;
		j = 40;
		for(var i = j; i < j+20; i++) {
			sum += freqByteData[i];
		}
		parameters.sphereScaleZ = normalize(sum) * 0.1;
	}

	return {
		init:init,
		update:update,
		parameters:parameters
	};
}());