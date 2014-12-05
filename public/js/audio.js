var LoopVisualizer = (function() {

	var RINGCOUNT = 160;
	var SEPARATION = 30;
	var INIT_RADIUS = 50;
	var SEGMENTS = 512;
	var BIN_COUNT = 512;

	var rings = [];
	var levels = [];
	var colors = [];
	var loopHolder = new THREE.Object3D();
	var loopGeom;//one geom for all rings
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
		leftOffset: { type: "f", value: 200.0},
		horizontalStretch: { type: "f", value: 200.0},
		horizontalStretch2: { type: "f", value: 200.0},
		verticalStretch: { type: "f", value: 200.0},
		verticalStretch2: { type: "f", value: 200.0},
		bottomOffset: { type: "f", value: 200.0},
		speed: { type: "f", value: 0.0},
		speed2: { type: "f", value: 0.0},
		curve: { type: "f", value: 0.0},
		colorInversion: { type: "f", value: 0.0},
		size: { type: "f", value: 0.0},
		lineDistortion: { type: "f", value: 0.0},
		horizontalPulse: { type: "f", value: 0.0},
		verticalWaveDistortion: { type: "f", value: 0.0},
		curveIntensity: { type: "f", value: 0.0},
		circles: { type: "f", value: 0.0},
		unknown: { type: "f", value: 0.0},
		color1: { type: "f", value: 0.0},
		color2: { type: "f", value: 0.0},
		color3: { type: "f", value: 0.0},
		color4: { type: "f", value: 0.0}
	};

	function init() {

		////////INIT audio in
		freqByteData = new Uint8Array(analyser.frequencyBinCount);
		timeByteData = new Uint8Array(analyser.frequencyBinCount);

		

		onParamsChange();

	}

	function onParamsChange() {

		/* when a parameter is changed, change it */

	}

	function update() {

		
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

	}

	return {
		init:init,
		update:update,
		loopHolder:loopHolder,
		vizParams:vizParams
	};
}());