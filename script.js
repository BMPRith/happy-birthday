let audioContext;
let analyser;
let microphone;
let blowDetected = false;
let blowStartTime = null; // To track the duration of the blow
const MIN_BLOW_DURATION = 100; // Require blow to last at least 100ms (in milliseconds)

// Initialize microphone access and set up Web Audio API
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
        // Show the button
        const playButton = document.getElementById('playSongButton');
        playButton.style.display = 'flex';

        // Set up Web Audio API
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);

        // Create a bandpass filter to focus on blowing frequencies (100 Hz to 1000 Hz)
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 550; // Center frequency: (100 + 1000) / 2
        filter.Q.value = 1; // Bandwidth: roughly 100 Hz to 1000 Hz

        // Connect the microphone to the filter, then to the analyser
        microphone.connect(filter);
        filter.connect(analyser);

        analyser.fftSize = 256;

        // Start blow detection
        detectBlow();
    })
    .catch(function(error) {
        console.error("Microphone access denied:", error);
        alert("Microphone access is required to blow out the candle! Please allow microphone access and refresh the page.");
    });

// Function to detect blowing
function detectBlow() {
    if (!analyser || blowDetected) {
        requestAnimationFrame(detectBlow);
        return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += Math.abs(dataArray[i] - 128);
    }
    const average = sum / bufferLength;

    const BLOW_THRESHOLD = 5;
    if (average > BLOW_THRESHOLD) {
        if (!blowStartTime) {
            blowStartTime = Date.now(); // Start timing the blow
        } else {
            const blowDuration = Date.now() - blowStartTime;
            if (blowDuration >= MIN_BLOW_DURATION) {
                console.log("Blow detected");
                blowDetected = true;

                const flameGroup = document.getElementById('flame-group');
                const flame = document.getElementById('candle-flame');
                if (flameGroup && flame) {
                    flameGroup.style.display = 'none'; // Hide the group
                    flame.setAttribute('visibility', 'hidden'); // Fallback

                    // Make the flame reappear after 2 seconds
                    setTimeout(() => {
                        flameGroup.style.display = 'block'; // Show the group
                        flame.setAttribute('visibility', 'visible'); // Fallback
                        blowDetected = false; // Allow blowing again
                        blowStartTime = null; // Reset blow timing
                    }, 5000); // 2 seconds delay
                }
            }
        }
    } else {
        blowStartTime = null; // Reset if the signal drops below threshold
    }

    requestAnimationFrame(detectBlow);
}

// Function to play the song
function playSong() {
    const audio = new Audio('happy_birthday_song.mp3');
    audio.play().catch((error) => {
        console.error("Error playing the song:", error);
    });

    // Reset blow detection and flame visibility
    blowDetected = false;
    blowStartTime = null;
    const flameGroup = document.getElementById('flame-group');
    const flame = document.getElementById('candle-flame');
    if (flameGroup && flame) {
        flameGroup.style.display = 'block'; // Show the group
        flame.setAttribute('visibility', 'visible'); // Fallback
    }
}