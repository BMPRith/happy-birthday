// Check microphone access and then show the Play Song button
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
        console.log("Microphone access granted");
        document.getElementById('playSongButton'); // Show button
    })
    .catch(function(error) {
        console.error("Microphone access denied", error);
    });

// Function to play the song
function playSong() {
    const audio = new Audio('happy_birthday_song.mp3'); // Replace with your audio file path
    audio.play().then(() => {
        console.log("Song is playing");
    }).catch((error) => {
        console.error("Error playing the song", error);
    });
}