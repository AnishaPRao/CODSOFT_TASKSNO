=============================================================================
CODSOFT TASK 4 - MUSIC PLAYER AUDIO DIRECTORY
=============================================================================

This folder ("songs/") is designed to store royalty-free MP3 audio files for the Music Player application.

HOW TO ADD YOUR OWN CUSTOM MP3 SONGS:
1. Place your royalty-free .mp3 files inside this folder (e.g. `songs/track1.mp3`, `songs/track2.mp3`).
2. Open `script.js` in a code editor.
3. Update the `songs` array in `script.js` with your filename:

   {
       id: 1,
       title: "Your Song Title",
       artist: "Your Artist Name",
       album: "Your Album Name",
       cover: "images/cover1.svg",
       audio: "songs/track1.mp3",
       duration: "3:45"
   }

NOTE:
By default, the application is pre-configured with working online royalty-free audio streams AND an automatic Web Audio API sound synthesizer backup! This ensures the player works, plays real sound, and updates progress instantly when opened locally in any browser even before custom MP3 files are added.
