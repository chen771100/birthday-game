/* ========================================
   音樂與音效系統
   ======================================== */

// 音訊上下文
let audioContext = null;
let isMuted = false;
let bgmGain = null;
let sfxGain = null;
let currentBgm = null;

// 初始化音訊系統
function initAudio() {
    if (audioContext) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 建立音量控制節點
        bgmGain = audioContext.createGain();
        bgmGain.gain.value = 0.3;
        bgmGain.connect(audioContext.destination);
        
        sfxGain = audioContext.createGain();
        sfxGain.gain.value = 0.5;
        sfxGain.connect(audioContext.destination);
        
        console.log('🎵 音訊系統已初始化');
    } catch (e) {
        console.warn('無法初始化音訊系統:', e);
    }
}

// 切換靜音
function toggleMute() {
    isMuted = !isMuted;
    if (bgmGain) bgmGain.gain.value = isMuted ? 0 : 0.3;
    if (sfxGain) sfxGain.gain.value = isMuted ? 0 : 0.5;
    
    // 更新按鈕圖示
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
    }
    
    return isMuted;
}

// 播放音符
function playNote(frequency, duration, type = 'sine', gainNode = sfxGain) {
    if (!audioContext || isMuted) return;
    
    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    noteGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(noteGain);
    noteGain.connect(gainNode);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    return oscillator;
}

// 音效：點擊
function playSfxClick() {
    if (!audioContext) initAudio();
    playNote(800, 0.1, 'sine');
}

// 音效：成功
function playSfxSuccess() {
    if (!audioContext) initAudio();
    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
        setTimeout(() => playNote(freq, 0.2, 'sine'), i * 100);
    });
}

// 音效：完成
function playSfxComplete() {
    if (!audioContext) initAudio();
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047]; // C大調音階
    notes.forEach((freq, i) => {
        setTimeout(() => playNote(freq, 0.15, 'sine'), i * 80);
    });
}

// 音效：吹氣
function playSfxBlow() {
    if (!audioContext) initAudio();
    
    // 模擬吹氣聲（白噪音 + 濾波）
    const bufferSize = audioContext.sampleRate * 0.2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    const gain = audioContext.createGain();
    gain.gain.value = isMuted ? 0 : 0.3;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    source.start();
}

// 音效：氣球爆破
function playSfxPop() {
    if (!audioContext) initAudio();
    playNote(300, 0.05, 'square');
    setTimeout(() => playNote(150, 0.08, 'sawtooth'), 30);
}

// 音效：許願
function playSfxWish() {
    if (!audioContext) initAudio();
    const notes = [392, 440, 494, 523, 587, 659]; // G4 到 E5
    notes.forEach((freq, i) => {
        setTimeout(() => playNote(freq, 0.3, 'triangle'), i * 150);
    });
}

// 生日快樂歌旋律
const birthdaySongNotes = [
    // Happy birthday to you
    { note: 264, duration: 0.3 }, // C4
    { note: 264, duration: 0.3 }, // C4
    { note: 297, duration: 0.6 }, // D4
    { note: 264, duration: 0.6 }, // C4
    { note: 352, duration: 0.6 }, // F4
    { note: 330, duration: 1.0 }, // E4
    
    // Happy birthday to you
    { note: 264, duration: 0.3 }, // C4
    { note: 264, duration: 0.3 }, // C4
    { note: 297, duration: 0.6 }, // D4
    { note: 264, duration: 0.6 }, // C4
    { note: 396, duration: 0.6 }, // G4
    { note: 352, duration: 1.0 }, // F4
    
    // Happy birthday dear [name]
    { note: 264, duration: 0.3 }, // C4
    { note: 264, duration: 0.3 }, // C4
    { note: 528, duration: 0.6 }, // C5
    { note: 440, duration: 0.6 }, // A4
    { note: 352, duration: 0.6 }, // F4
    { note: 330, duration: 0.6 }, // E4
    { note: 297, duration: 0.8 }, // D4
    
    // Happy birthday to you
    { note: 466, duration: 0.3 }, // Bb4
    { note: 466, duration: 0.3 }, // Bb4
    { note: 440, duration: 0.6 }, // A4
    { note: 352, duration: 0.6 }, // F4
    { note: 396, duration: 0.6 }, // G4
    { note: 352, duration: 1.2 }, // F4
];

// 播放生日快樂歌
let birthdaySongPlaying = false;
let birthdaySongTimeouts = [];

function playBirthdaySong() {
    if (!audioContext) initAudio();
    if (birthdaySongPlaying) return;
    
    birthdaySongPlaying = true;
    let time = 0;
    
    birthdaySongNotes.forEach((noteData, index) => {
        const timeout = setTimeout(() => {
            playNote(noteData.note, noteData.duration * 0.9, 'sine', bgmGain);
        }, time * 1000);
        birthdaySongTimeouts.push(timeout);
        time += noteData.duration;
    });
    
    // 結束後重置
    const endTimeout = setTimeout(() => {
        birthdaySongPlaying = false;
    }, time * 1000);
    birthdaySongTimeouts.push(endTimeout);
}

function stopBirthdaySong() {
    birthdaySongTimeouts.forEach(t => clearTimeout(t));
    birthdaySongTimeouts = [];
    birthdaySongPlaying = false;
}

// 播放背景音樂（簡單旋律循環）
let bgmPlaying = false;
let bgmInterval = null;

function playBgm() {
    if (!audioContext) initAudio();
    if (bgmPlaying || isMuted) return;
    
    bgmPlaying = true;
    
    // 簡單的歡快旋律
    const melody = [
        { note: 523, duration: 0.2 }, // C5
        { note: 587, duration: 0.2 }, // D5
        { note: 659, duration: 0.2 }, // E5
        { note: 523, duration: 0.2 }, // C5
        { note: 659, duration: 0.3 }, // E5
        { note: 784, duration: 0.4 }, // G5
        { note: 659, duration: 0.2 }, // E5
        { note: 523, duration: 0.3 }, // C5
        { note: 0, duration: 0.5 },   // 休止
    ];
    
    let noteIndex = 0;
    
    function playNextNote() {
        if (!bgmPlaying || isMuted) return;
        
        const noteData = melody[noteIndex];
        if (noteData.note > 0) {
            playNote(noteData.note, noteData.duration * 0.8, 'triangle', bgmGain);
        }
        
        noteIndex = (noteIndex + 1) % melody.length;
    }
    
    // 每個音符的間隔
    let time = 0;
    melody.forEach((noteData, i) => {
        setTimeout(() => {
            if (bgmPlaying && !isMuted) {
                if (noteData.note > 0) {
                    playNote(noteData.note, noteData.duration * 0.8, 'triangle', bgmGain);
                }
            }
        }, time * 1000);
        time += noteData.duration;
    });
    
    // 循環播放
    const totalDuration = melody.reduce((sum, n) => sum + n.duration, 0) * 1000;
    bgmInterval = setInterval(() => {
        if (!bgmPlaying || isMuted) {
            clearInterval(bgmInterval);
            return;
        }
        let t = 0;
        melody.forEach((noteData, i) => {
            setTimeout(() => {
                if (bgmPlaying && !isMuted) {
                    if (noteData.note > 0) {
                        playNote(noteData.note, noteData.duration * 0.8, 'triangle', bgmGain);
                    }
                }
            }, t * 1000);
            t += noteData.duration;
        });
    }, totalDuration);
}

function stopBgm() {
    bgmPlaying = false;
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

// 歡慶音效（結束畫面）
function playCelebration() {
    if (!audioContext) initAudio();
    
    // 先播放成功音效
    playSfxComplete();
    
    // 1秒後播放生日快樂歌
    setTimeout(() => {
        playBirthdaySong();
    }, 1000);
}

// 頁面載入時添加靜音按鈕
document.addEventListener('DOMContentLoaded', () => {
    // 創建靜音按鈕
    const muteBtn = document.createElement('button');
    muteBtn.id = 'mute-btn';
    muteBtn.className = 'mute-btn';
    muteBtn.textContent = '🔊';
    muteBtn.title = '切換音樂';
    muteBtn.addEventListener('click', toggleMute);
    document.body.appendChild(muteBtn);
    
    // 第一次互動時初始化音訊
    document.addEventListener('click', () => {
        if (!audioContext) {
            initAudio();
        }
    }, { once: true });
});
