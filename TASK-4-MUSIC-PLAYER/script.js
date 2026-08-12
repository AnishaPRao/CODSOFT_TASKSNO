/**
 * MELODYSTREAM MUSIC PLAYER APPLICATION
 * CodSoft Task 4 | Popular Songs Playlist Edition
 */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // 1. Initial State & Playlist Data (Real Popular Songs Metadata)
    // --------------------------------------------------------------------------
    const THEME_KEY = 'melodystream_theme';
    const FAVORITES_KEY = 'melodystream_favorites';

    const songs = [
        {
            id: 1,
            title: 'Die With A Smile',
            artist: 'Lady Gaga, Bruno Mars',
            album: 'MAYHEM',
            cover: 'images/cover1.svg',
            audio: 'songs/die_with_a_smile.mp3',
            duration: '4:11',
            seconds: 251,
            frequency: 440.00
        },
        {
            id: 2,
            title: 'BIRDS OF A FEATHER',
            artist: 'Billie Eilish',
            album: 'HIT ME HARD AND SOFT',
            cover: 'images/cover2.svg',
            audio: 'songs/birds_of_a_feather.mp3',
            duration: '3:18',
            seconds: 198,
            frequency: 523.25
        },
        {
            id: 3,
            title: 'APT.',
            artist: 'ROSÉ, Bruno Mars',
            album: 'rosie',
            cover: 'images/cover3.svg',
            audio: 'songs/apt.mp3',
            duration: '2:49',
            seconds: 169,
            frequency: 659.25
        },
        {
            id: 4,
            title: 'Golden',
            artist: 'HUNTR/X',
            album: 'KPop Demon Hunters Soundtrack',
            cover: 'images/cover4.svg',
            audio: 'songs/golden.mp3',
            duration: '3:32',
            seconds: 212,
            frequency: 392.00
        },
        {
            id: 5,
            title: 'Jo Tum Mere Ho',
            artist: 'Anuv Jain',
            album: 'Single',
            cover: 'images/cover5.svg',
            audio: 'songs/jo_tum_mere_ho.mp3',
            duration: '4:04',
            seconds: 244,
            frequency: 349.23
        },
        {
            id: 6,
            title: 'Sahiba',
            artist: 'Aditya Rikhari',
            album: 'Single',
            cover: 'images/cover6.svg',
            audio: 'songs/sahiba.mp3',
            duration: '3:15',
            seconds: 195,
            frequency: 587.33
        },
        {
            id: 7,
            title: 'Raanjhan',
            artist: 'Sachet-Parampara',
            album: 'Do Patti',
            cover: 'images/cover7.svg',
            audio: 'songs/raanjhan.mp3',
            duration: '3:52',
            seconds: 232,
            frequency: 493.88
        }
    ];

    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = 'off'; // 'off', 'one', 'all'
    let isMuted = false;
    let lastVolume = 0.8;
    let favorites = loadFavorites();
    let currentFilter = 'all';

    // HTML5 Audio Object
    const audio = new Audio();
    audio.volume = 0.8;

    // Web Audio Synthesizer Fallback Engine
    let audioCtx = null;
    let synthOscillator = null;
    let synthGain = null;
    let synthTimer = null;
    let synthTimeElapsed = 0;

    // --------------------------------------------------------------------------
    // 2. DOM Element Selectors
    // --------------------------------------------------------------------------
    const htmlElement = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');

    const playerCard = document.querySelector('.player-card');
    const albumArt = document.getElementById('album-art');
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    const trackAlbum = document.getElementById('track-album');
    const favoriteBtn = document.getElementById('favorite-btn');

    const currentTimeEl = document.getElementById('current-time');
    const totalDurationEl = document.getElementById('total-duration');
    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-fill');

    const shuffleBtn = document.getElementById('shuffle-btn');
    const prevBtn = document.getElementById('prev-btn');
    const playBtn = document.getElementById('play-btn');
    const nextBtn = document.getElementById('next-btn');
    const repeatBtn = document.getElementById('repeat-btn');

    const muteBtn = document.getElementById('mute-btn');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeBar = document.getElementById('volume-bar');
    const volumeFill = document.getElementById('volume-fill');

    const playlistTracksEl = document.getElementById('playlist-tracks');
    const trackCountBadge = document.getElementById('track-count');
    const filterTabs = document.querySelectorAll('.filter-tab');

    // --------------------------------------------------------------------------
    // 3. Initialize Music Player
    // --------------------------------------------------------------------------
    initTheme();
    loadSong(currentSongIndex);
    renderPlaylist();
    updateVolumeUI(audio.volume);

    // --------------------------------------------------------------------------
    // 4. Core Player Logic & Actions
    // --------------------------------------------------------------------------
    function loadSong(index) {
        if (index < 0 || index >= songs.length) return;

        currentSongIndex = index;
        const song = songs[currentSongIndex];

        trackTitle.innerText = song.title;
        trackArtist.innerText = song.artist;
        trackAlbum.innerText = song.album;
        albumArt.src = song.cover;
        totalDurationEl.innerText = song.duration;
        currentTimeEl.innerText = '0:00';
        progressBar.value = 0;
        progressFill.style.width = '0%';

        audio.src = song.audio;
        updateFavoriteBtnState(song.id);
        renderPlaylist();

        if (isPlaying) {
            playSong();
        }
    }

    function playSong() {
        isPlaying = true;
        playerCard?.classList.add('playing');
        playBtn.title = 'Pause';

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // If local MP3 file isn't present, launch Web Audio Synthesizer backup!
                startSynthBackup(songs[currentSongIndex]);
            });
        }

        renderPlaylist();
    }

    function pauseSong() {
        isPlaying = false;
        playerCard?.classList.remove('playing');
        playBtn.title = 'Play';

        audio.pause();
        stopSynthBackup();
        renderPlaylist();
    }

    function togglePlayPause() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    function prevSong() {
        if (isShuffle) {
            playRandomSong();
            return;
        }

        let newIndex = currentSongIndex - 1;
        if (newIndex < 0) {
            newIndex = songs.length - 1;
        }

        loadSong(newIndex);
        playSong();
    }

    function nextSong() {
        if (isShuffle) {
            playRandomSong();
            return;
        }

        let newIndex = currentSongIndex + 1;
        if (newIndex >= songs.length) {
            newIndex = 0;
        }

        loadSong(newIndex);
        playSong();
    }

    function playRandomSong() {
        if (songs.length <= 1) return;
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * songs.length);
        } while (randomIndex === currentSongIndex);

        loadSong(randomIndex);
        playSong();
    }

    // --------------------------------------------------------------------------
    // 5. Web Audio API Synthesizer Backup
    // --------------------------------------------------------------------------
    function startSynthBackup(song) {
        try {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContext();
            }

            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            stopSynthBackup();

            synthOscillator = audioCtx.createOscillator();
            synthGain = audioCtx.createGain();

            synthOscillator.type = 'sine';
            synthOscillator.frequency.setValueAtTime(song.frequency || 440, audioCtx.currentTime);

            synthGain.gain.setValueAtTime((audio.volume || 0.8) * 0.15, audioCtx.currentTime);

            synthOscillator.connect(synthGain);
            synthGain.connect(audioCtx.destination);

            synthOscillator.start();

            synthTimer = setInterval(() => {
                if (!isPlaying) return;
                synthTimeElapsed += 1;
                if (synthTimeElapsed >= song.seconds) {
                    synthTimeElapsed = 0;
                    handleSongEnded();
                    return;
                }

                const currentMins = Math.floor(synthTimeElapsed / 60);
                const currentSecs = Math.floor(synthTimeElapsed % 60);
                currentTimeEl.innerText = `${currentMins}:${currentSecs < 10 ? '0' : ''}${currentSecs}`;

                const progressPercent = (synthTimeElapsed / song.seconds) * 100;
                progressBar.value = progressPercent;
                progressFill.style.width = `${progressPercent}%`;
            }, 1000);

        } catch (e) {
            console.log('Synth player backup active');
        }
    }

    function stopSynthBackup() {
        if (synthTimer) {
            clearInterval(synthTimer);
            synthTimer = null;
        }
        if (synthOscillator) {
            try { synthOscillator.stop(); } catch (e) {}
            synthOscillator = null;
        }
    }

    // --------------------------------------------------------------------------
    // 6. Progress Seek & Time Update Listeners
    // --------------------------------------------------------------------------
    audio.addEventListener('timeupdate', () => {
        if (isNaN(audio.duration) || audio.duration === 0) return;

        const currentTime = audio.currentTime;
        const duration = audio.duration;

        const currentMins = Math.floor(currentTime / 60);
        const currentSecs = Math.floor(currentTime % 60);
        currentTimeEl.innerText = `${currentMins}:${currentSecs < 10 ? '0' : ''}${currentSecs}`;

        const durationMins = Math.floor(duration / 60);
        const durationSecs = Math.floor(duration % 60);
        totalDurationEl.innerText = `${durationMins}:${durationSecs < 10 ? '0' : ''}${durationSecs}`;

        const progressPercent = (currentTime / duration) * 100;
        progressBar.value = progressPercent;
        progressFill.style.width = `${progressPercent}%`;
    });

    progressBar?.addEventListener('input', (e) => {
        const seekPercent = parseFloat(e.target.value);
        progressFill.style.width = `${seekPercent}%`;

        if (audio.duration && !isNaN(audio.duration)) {
            audio.currentTime = (seekPercent / 100) * audio.duration;
        } else {
            const song = songs[currentSongIndex];
            synthTimeElapsed = Math.floor((seekPercent / 100) * song.seconds);
        }
    });

    audio.addEventListener('ended', handleSongEnded);

    function handleSongEnded() {
        if (isRepeat === 'one') {
            audio.currentTime = 0;
            synthTimeElapsed = 0;
            playSong();
        } else {
            nextSong();
        }
    }

    // --------------------------------------------------------------------------
    // 7. Volume & Mute Controls
    // --------------------------------------------------------------------------
    volumeBar?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        audio.volume = val;
        isMuted = val === 0;

        if (synthGain && audioCtx) {
            synthGain.gain.setValueAtTime(val * 0.15, audioCtx.currentTime);
        }

        updateVolumeUI(val);
    });

    muteBtn?.addEventListener('click', () => {
        if (isMuted) {
            audio.volume = lastVolume || 0.8;
            isMuted = false;
        } else {
            lastVolume = audio.volume;
            audio.volume = 0;
            isMuted = true;
        }
        volumeBar.value = audio.volume;
        updateVolumeUI(audio.volume);
    });

    function updateVolumeUI(val) {
        if (volumeFill) volumeFill.style.width = `${val * 100}%`;

        if (!volumeIcon) return;
        volumeIcon.className = 'fa-solid ';

        if (val === 0 || isMuted) {
            volumeIcon.className += 'fa-volume-xmark';
        } else if (val < 0.5) {
            volumeIcon.className += 'fa-volume-low';
        } else {
            volumeIcon.className += 'fa-volume-high';
        }
    }

    // --------------------------------------------------------------------------
    // 8. Shuffle & Repeat Mode Controls
    // --------------------------------------------------------------------------
    shuffleBtn?.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        shuffleBtn.title = `Toggle Shuffle (${isShuffle ? 'On' : 'Off'})`;
        showToast(`Shuffle mode ${isShuffle ? 'enabled' : 'disabled'}`, 'info');
    });

    repeatBtn?.addEventListener('click', () => {
        if (isRepeat === 'off') {
            isRepeat = 'all';
            repeatBtn.classList.add('active');
            repeatBtn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
            repeatBtn.title = 'Repeat All Tracks';
            showToast('Repeat all tracks enabled', 'info');
        } else if (isRepeat === 'all') {
            isRepeat = 'one';
            repeatBtn.classList.add('active');
            repeatBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i>';
            repeatBtn.title = 'Repeat Current Track';
            showToast('Repeat current track enabled', 'info');
        } else {
            isRepeat = 'off';
            repeatBtn.classList.remove('active');
            repeatBtn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
            repeatBtn.title = 'Repeat Off';
            showToast('Repeat mode disabled', 'info');
        }
    });

    playBtn?.addEventListener('click', togglePlayPause);
    prevBtn?.addEventListener('click', prevSong);
    nextBtn?.addEventListener('click', nextSong);

    // --------------------------------------------------------------------------
    // 9. Favorites Management
    // --------------------------------------------------------------------------
    function loadFavorites() {
        try {
            const data = localStorage.getItem(FAVORITES_KEY);
            return data ? JSON.parse(data) : [1, 3];
        } catch (e) {
            return [1, 3];
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        } catch (e) {}
    }

    function toggleFavorite(songId) {
        if (favorites.includes(songId)) {
            favorites = favorites.filter(id => id !== songId);
            showToast('Removed from Favorites', 'info');
        } else {
            favorites.push(songId);
            showToast('Added to Favorites', 'info');
        }

        saveFavorites();
        updateFavoriteBtnState(songs[currentSongIndex].id);
        renderPlaylist();
    }

    function updateFavoriteBtnState(songId) {
        if (!favoriteBtn) return;
        const isFav = favorites.includes(songId);
        favoriteBtn.classList.toggle('active', isFav);
    }

    favoriteBtn?.addEventListener('click', () => {
        toggleFavorite(songs[currentSongIndex].id);
    });

    // --------------------------------------------------------------------------
    // 10. Render Playlist & Filter Tabs
    // --------------------------------------------------------------------------
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            currentFilter = tab.getAttribute('data-filter') || 'all';
            renderPlaylist();
        });
    });

    function renderPlaylist() {
        if (!playlistTracksEl) return;

        const filteredSongs = songs.filter(song => {
            if (currentFilter === 'favorites') {
                return favorites.includes(song.id);
            }
            return true;
        });

        if (trackCountBadge) {
            trackCountBadge.innerText = `${filteredSongs.length} Track${filteredSongs.length === 1 ? '' : 's'}`;
        }

        playlistTracksEl.innerHTML = '';

        if (filteredSongs.length === 0) {
            playlistTracksEl.innerHTML = `
                <div class="empty-state" style="padding: 30px 10px;">
                    <i class="fa-regular fa-heart" style="font-size: 2rem; color: var(--text-muted);"></i>
                    <p style="font-size: 0.9rem; color: var(--text-secondary);">No favorite tracks yet!</p>
                </div>
            `;
            return;
        }

        filteredSongs.forEach((song, idx) => {
            const originalIndex = songs.findIndex(s => s.id === song.id);
            const isActive = originalIndex === currentSongIndex;
            const isFav = favorites.includes(song.id);

            const li = document.createElement('li');
            li.className = `playlist-item ${isActive ? 'active' : ''} ${isActive && isPlaying ? 'playing' : ''}`;

            li.innerHTML = `
                <div class="item-left">
                    <span class="track-index">${originalIndex + 1}</span>
                    <div class="playing-eq-icon">
                        <span></span><span></span><span></span>
                    </div>
                    <img src="${song.cover}" alt="${song.title}" class="thumb-img">
                    <div class="item-info">
                        <span class="item-title">${escapeHTML(song.title)}</span>
                        <span class="item-artist">${escapeHTML(song.artist)}</span>
                    </div>
                </div>
                <div class="item-right">
                    <span class="item-duration">${song.duration}</span>
                    <button type="button" class="item-fav-btn ${isFav ? 'active' : ''}" aria-label="Toggle Favorite">
                        <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                </div>
            `;

            li.addEventListener('click', (e) => {
                if (e.target.closest('.item-fav-btn')) {
                    toggleFavorite(song.id);
                    return;
                }

                loadSong(originalIndex);
                playSong();
            });

            playlistTracksEl.appendChild(li);
        });
    }

    // --------------------------------------------------------------------------
    // 11. Theme & Utility Helpers
    // --------------------------------------------------------------------------
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
        htmlElement.setAttribute('data-theme', savedTheme);

        themeToggleBtn?.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(THEME_KEY, newTheme);
            showToast(`Switched to ${newTheme} theme`, 'info');
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <i class="fa-solid fa-music toast-icon"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-30px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
