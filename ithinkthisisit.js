var audioContext = new AudioContext();
		var isPlaying = false;
		var sourceNode = null;
		var analyser = null;
		var peaks = new Array();

		window.onload = function() {

			detectorElem = document.getElementById( "detector" );

			detectorElem.ondragenter = function () { 
				this.classList.add("droptarget"); 
				return false; };
			detectorElem.ondragleave = function () { this.classList.remove("droptarget"); return false; };
			detectorElem.ondrop = function (e) {
		  		this.classList.remove("droptarget");
		  		e.preventDefault();
				theBuffer = null;

		  	var reader = new FileReader();
		  	reader.onload = function (event) {
		  		audioContext.decodeAudioData( event.target.result, function(buffer) {
		    		theBuffer = buffer;
		  		}, function(){alert("Error loading!");} ); 

		  	};

		  	reader.onerror = function (event) {
		  		alert("Error: " + reader.error );
			};
		  	reader.readAsArrayBuffer(e.dataTransfer.files[0]);
		  	return false;
			};

		}

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

		}