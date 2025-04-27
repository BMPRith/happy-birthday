// Access the microphone
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const microphone = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        microphone.connect(analyser);

        // Function to play the happy birthday song
        const audio = new Audio('happy_birthday_song.mp3');
        audio.play();

        function detectBlow() {
            analyser.getByteTimeDomainData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += Math.abs(dataArray[i] - 128);
            }
            const average = sum / bufferLength;

            if (average > 20) { // Adjust the threshold as needed
                document.querySelectorAll('.fuego').forEach(flame => {
                    flame.style.display = 'none';
                });

                // Set a timeout to light the candle again after 2 seconds
                setTimeout(() => {
                    document.querySelectorAll('.fuego').forEach(flame => {
                        flame.style.display = 'block';
                    });
                }, 2000);
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    })
    .catch(err => {
        console.error('Microphone access denied', err);
    });
