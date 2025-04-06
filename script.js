/**
         * 1. Render songs - Done
         * 2. Scroll top - Done
         * 3. Play / pause / seek - Done
         * 4. CD rotate - Done
         * 5. Next / prev - Done
         * 6. Random - Done
         * 7. Next / Repeat when ended - Done
         * 8. Active song - Done
         * 9. Scroll active song into view - Done
         * 10. Play song when click
         */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'CONMEL_PLAYER'

const playlist = $('.playlist')
const player = $('.player')
const cd = $('.cd')
const cdTitle = $('header h2')
const cdThumb = $('.cd .cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

audio.volume = 0.05

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'blue',
            singer: 'yung kai',
            path: './assets/music/blue - yung kai.mp3',
            image: './assets/img/blue - yung kai.jfif'
        },
        {
            name: 'Monody',
            singer: 'TheFatRat',
            path: './assets/music/Monody - TheFatRat.mp3',
            image: './assets/img/Monody - TheFatRat.jfif'
        },
        {
            name: 'love.',
            singer: 'wave to eart',
            path: './assets/music/love. - wave to earth.mp3',
            image: './assets/img/love. - wave to earth.jfif'
        },
        {
            name: 'Nandemonaiya - movie ver.',
            singer: 'RADWIMPS',
            path: './assets/music/Nandemonaiya - movie ver. - RADWIMPS.mp3',
            image: './assets/img/Nandemonaiya - movie ver. - RADWIMPS.jfif'
        },
        {
            name: 'Save Me',
            singer: 'DEAMN',
            path: './assets/music/Save Me - DEAMN.mp3',
            image: './assets/img/Save Me - DEAMN.jfif'
        },
        {
            name: 'The Beginning',
            singer: 'ONE OK ROCK',
            path: './assets/music/The Beginning - ONE OK ROCK.mp3',
            image: './assets/img/The Beginning - ONE OK ROCK.jfif'
        },
        {
            name: 'Dù có cách xa',
            singer: 'Đinh Mạnh Ninh',
            path: './assets/music/Dù có cách xa - Đinh Mạnh Ninh.mp3',
            image: './assets/img/Dù có cách xa - Đinh Mạnh Ninh.jfif'
        },
        {
            name: 'Wake Me Up',
            singer: 'Avicii',
            path: './assets/music/Wake Me Up - Avicii.mp3',
            image: './assets/img/Wake Me Up - Avicii.jfif'
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    playedSongs: [],
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        `
        })

        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this

        // Xu ly CD quay / dung
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })

        cdThumbAnimate.pause()

        // Xu ly phong to / thu nho CD
        const cdWidth = cd.offsetWidth

        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xu ly khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Khi song duoc play 
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');

            // xoay CD
            cdThumbAnimate.play()
        }
        // Khi song bi pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');

            // dung xoay CD
            cdThumbAnimate.pause()
        }

        // Khi tien do song thay doi
        audio.ontimeupdate = function () {
            if (audio.currentTime) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xu ly khi tua song
        progress.oninput = function (e) {
            const seekTime = e.target.value / 100 * audio.duration
            audio.currentTime = seekTime
        }

        // Xu ly khi next song / prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
        }

        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
        }

        // Xu ly bat / tat random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)

            if (!_this.isRandom) {
                _this.playedSongs = []
            } else {
                _this.playedSongs = [_this.currentIndex]
            }
        }

        // Xu ly bat / tat repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xu ly next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else
                nextBtn.click()
        }

        // Xử lý play song khi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')

            // Xử lý khi click vào song option
            if (optionNode) {

                return
            }
            // Xử lý khi click vào song
            if (songNode) {
                _this.currentIndex = Number(songNode.dataset.index)
                _this.loadCurrentSong()
                _this.updateActiveSong()
                _this.scrollToActiveSong()
                audio.play()
            }
        }
    },
    loadCurrentSong: function () {
        cdTitle.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) this.currentIndex = 0

        this.loadCurrentSong()
        this.updateActiveSong()
        this.scrollToActiveSong()
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) this.currentIndex = this.songs.length - 1

        this.loadCurrentSong()
        this.updateActiveSong()
        this.scrollToActiveSong()
    },
    playRandomSong: function () {
        let nextRandomSongIndex
        // Mảng chứa toàn bộ index của nhạc
        const allIndexes = this.songs.map((song, index) => index)

        if (this.playedSongs.length >= this.songs.length) {
            this.playedSongs = []
        }

        // Mảng chứa các index bài nhạc chưa phát
        const remainingIndexes = allIndexes.filter((songIndex) => {
            return !this.playedSongs.includes(songIndex) && songIndex !== this.currentIndex
        })

        // Random 1 bài nhạc từ mảng chứa các bài chưa phát
        nextRandomSongIndex = remainingIndexes[Math.floor(Math.random() * remainingIndexes.length)]

        this.currentIndex = nextRandomSongIndex
        this.playedSongs.push(nextRandomSongIndex) // Thêm vào danh sách bài đã hát
        this.loadCurrentSong()
        this.updateActiveSong()
        this.scrollToActiveSong()
    },
    updateActiveSong: function () {
        const songElements = $$('.song')
        // Thêm class active vào bài hát nếu === currentIndex 
        // Xóa class active nếu ko === currentIndex
        songElements.forEach((element, index) => {
            element.classList.toggle('active', index === this.currentIndex)
        })
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            const activeSong = $('.song.active')
            if (activeSong) {
                activeSong.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end' // có thể là 'nearest', 'center', 'start', 'end'
                })
            }
        }, 200)
    },
    start: function () {
        // Tải các cấu hình của người dùng từ config vào ứng dụng
        this.loadConfig()
        // Dinh nghia cac thuoc tinh cho Object 
        this.defineProperties()

        // Lang nghe / xu ly cac su kien (DOM events)
        this.handleEvents()

        // Phuong thuc tai bai hat hien tai vao UI khi chay ung dung
        this.loadCurrentSong()

        // Render danh sach bai hat (render)
        this.render()

        // Hiển thị theo config
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()