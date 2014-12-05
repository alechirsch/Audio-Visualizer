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
		horizontalStretch2: 1,
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
		color4: 1
	};
	var min = 0;
	var max = 75000;
	function init() {

		////////INIT audio in
		freqByteData = new Uint8Array(analyser.frequencyBinCount);
		timeByteData = new Uint8Array(analyser.frequencyBinCount);

		

		onParamsChange();

	}

	function onParamsChange() {

		/* when a parameter is changed, change it */

	}

	function normalize(value){
		return (value - min) / (max - min);
	}

	function update() {

		
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

		var sum = 0;
		for(var i = 0; i < BIN_COUNT; i++) {
			sum += freqByteData[i];
		}
		if(sum > 75000){
			sum = 75000;
		}

		parameters.lineDistortion = normalize(sum) * 800;
		parameters.circles = (normalize(sum) * 200) + 8;
	}

	return {
		init:init,
		update:update,
		parameters:parameters
	};
}());