$( document ).ready(function(){	

		document.getElementById ("startInput").addEventListener ("click", toggleLiveInput, false);

		var contextClass = (window.AudioContext || 
			window.webkitAudioContext || 
			window.mozAudioContext || 
			window.oAudioContext || 
			window.msAudioContext);

		if (contextClass) {
		  var audioContext = new contextClass();
		} else {
		  console.log("Web Audio API is not available. Use a supported browser.")
		}
		
		var isPlaying = false;
		var sourceNode = null;
		var analyser = null;
		var peaks = new Array();

		function gotStream(stream) {
	    	// Create an AudioNode from the stream.
	    	var mediaStreamSource = audioContext.createMediaStreamSource(stream);

	    	// Connect it to the destination.
	    	analyser = audioContext.createAnalyser();
	    	analyser.fftSize = 2048;
	    	mediaStreamSource.connect( analyser );
	    	updateRoughPeakBinary();
		}

		function error() {
    		alert('Stream generation failed.');
		}	

		function getUserMedia(){
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
			navigator.getUserMedia( {audio:true}, gotStream );
		}

		// console.log("shit gets here");

		function toggleLiveInput() {
    		getUserMedia({audio:true}, gotStream);
		}

		function getUserMedia(dictionary, callback) {
		    try {
		        navigator.getUserMedia = 
		        	navigator.getUserMedia ||
		        	navigator.webkitGetUserMedia ||
		        	navigator.mozGetUserMedia;
		        navigator.getUserMedia(dictionary, callback, error);
		    } catch (e) {
		        alert('getUserMedia threw exception :' + e);
		    }
		}

		var buflen = 2048;
		var buf = new Uint8Array( buflen );
		var MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.
		var amp_th = 0;


		function updateRoughPeakBinary(){
			analyser.getByteTimeDomainData( buf );
			var MIN_SAMPLES = 4;	// corresponds to an 11kHz signal
			var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
			var SIZE = 1000;

			var tmpArr = new Array();

			if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
				return;  // Not enough data

			for (var i = 0; i < buf.length; i++){
				if (Math.abs(buf[i]) >= amp_th)
					if (!(tmpArr[i-1])||(tmpArr[i-1] != 1))
						tmpArr[i] = 1;
				else
					tmpArr[i] = 0;
			}

			peaks = peaks.concat(tmpArr);
			arrOut = peaks.toString();
			console.log(arrOut);

		}

});