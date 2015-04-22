var started = false;
var paused = false;
var source;

var xhr;



function audioInit(){
	freqByteData = new Uint8Array(analyser.frequencyBinCount);
	timeByteData = new Uint8Array(analyser.frequencyBinCount);
}

$('#enter-link').click(function(){
	$('#prompt').html("<input id='youtube' type='text' placeholder='Enter a Youtube URL here...'>").show();
	fadePrompt();

});

var timer;
$(document).mousemove(function() {
	if (timer) {
		clearTimeout(timer);
		timer = 0;
	}

	$("#tools").fadeIn();
	timer = setTimeout(function() {
		$('#tools').fadeOut()
	}, 1500)
})

function fadePrompt(){
	setTimeout(function() {
		$('#prompt').fadeOut('slow');
	}, 10000);
}

function getURLParameter(url, name) {
	return (RegExp(name + '=' + '(.+?)(&|$)').exec(url)||[,null])[1];
}

function loading(){
	$('#prompt').text("loading").show();
	var i = 0;
	var interval = setInterval(function() {
		if($('#prompt').is(':hidden')) clearInterval(interval);
		if(i === 5){
			$('#prompt').text('loading');
			i = 0;
		}
		else{
			$('#prompt').append('.');
			i++;
		}
	}, 750);
}


function youtubeEntered(link){
	loading();
	window.location.href = link;

}

function youtubeEntered2(link){
	loading();
	var request = new XMLHttpRequest();
	request.open("GET", link, true);
	request.responseType = "arraybuffer";
	request.send();

	request.onload = function() {
		loadYoutube(getURLParameter(link, 'v'));
	};
}

function loadYoutube(link) {
	loading();
	var url = "public/" + link + ".mp4";
	console.log(url);
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";
	request.send();
	request.onload = function() {
		audioContext.decodeAudioData(request.response, function(buffer) {
			audioBuffer = buffer;
			startSound();
		}, function(e) {
			console.log(e);
		});
	};
};

function loadSampleAudio() {
	loading();
	var audioURL = "public/cohkka.mp3";

	/* Load asynchronously */
	var request = new XMLHttpRequest();
	request.open("GET", audioURL, true);
	request.responseType = "arraybuffer";

	request.onload = function() {
		audioContext.decodeAudioData(request.response, function(buffer) {
			audioBuffer = buffer;
			startSound();
		}, function(e) {
			$('#prompt').text("error loading mp3").show();
			console.log(e);
		});
	};
	request.send();
}

function onDocumentDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	return false;
}

function onDroppedMP3Loaded(data) {
	audioContext.decodeAudioData(data, function(buffer) {
		audioBuffer = buffer;
		startSound();
	}, function(e) {
		$('#prompt').text("cannot decode mp3").show();
		console.log(e);
	});
}

function onMP3Drop(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	loading();

	var droppedFiles = evt.dataTransfer.files;
	var reader = new FileReader();
	reader.onload = function(fileEvent) {
		var data = fileEvent.target.result;
		onDroppedMP3Loaded(data);
	};
	reader.readAsArrayBuffer(droppedFiles[0]);
}

function startSound() {

	if (source){
		source.stop(0.0);
		source.disconnect();
	}

	/* Connect audio processing graph */
	source = audioContext.createBufferSource();	
	source.connect(audioContext.destination);
	source.connect(analyser);

	$('#prompt').fadeOut('slow');
	source.buffer = audioBuffer;
	source.loop = false;
	source.start(0.0);
	started = true;
	console.log(source);
	/*startViz();*/
}

function pause(){
	paused = true;
	console.log(source);
	source.stop();
}

function play(){
	paused = false;
	source.start();
}
