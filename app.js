// Podcast Player - Complete JavaScript Application

class PodcastApp {
    constructor() {
        this.currentEpisode = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 1;
        this.playbackRate = 1;
        this.isAdminLoggedIn = false;
        this.theme = 'dark';
        this.episodes = [];
        this.bookmarks = [];
        this.downloads = [];
        this.searchHistory = [];
        this.analytics = {
            totalPlays: 0,
            totalTime: 0,
            sessions: []
        };
        
        this.audio = new Audio();
        this.setupAudioEvents();
        this.loadData();
        this.loadEpisodes();
        this.init();
    }

    init() {
        this.hideLoading();
        this.loadEpisodes();
        this.showSection('home');
        this.setupEventListeners();
        this.startAnalytics();
        console.log('🎧 Podcast Player initialized');
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1500);
    }

    setupAudioEvents() {
        this.audio.addEventListener('loadedmetadata', () => {
            this.duration = this.audio.duration;
            this.updateProgress();
        });

        this.audio.addEventListener('timeupdate', () => {
            this.currentTime = this.audio.currentTime;
            this.updateProgress();
            this.saveProgress();
        });

        this.audio.addEventListener('ended', () => {
            this.handleEpisodeEnd();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.showNotification('Error al cargar el audio', 'error');
        });
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    this.skipBackward();
                    break;
                case 'ArrowRight':
                    this.skipForward();
                    break;
            }
        });

        // Click outside to close dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').classList.remove('show');
            }
        });
    }

    loadEpisodes() {
        // Sample episodes with real audio URLs
        this.episodes = [
            {
                id: 1,
                title: "Introducción al Desarrollo Web Moderno",
                description: "Exploramos las últimas tendencias en desarrollo web, desde frameworks hasta herramientas de build. Una guía completa para desarrolladores que quieren mantenerse actualizados.",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                artwork: "https://picsum.photos/300/300?random=1",
                duration: 2700, // 45 minutes
                publishDate: new Date('2024-01-15'),
                playCount: 1250,
                category: "Tecnología"
            },
            {
                id: 2,
                title: "El Futuro de la Inteligencia Artificial",
                description: "Conversamos con expertos sobre el impacto de la IA en diferentes industrias y cómo prepararnos para los cambios que vienen.",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                artwork: "https://picsum.photos/300/300?random=2",
                duration: 3600, // 60 minutes
                publishDate: new Date('2024-01-10'),
                playCount: 980,
                category: "Tecnología"
            },
            {
                id: 3,
                title: "Productividad Personal: Técnicas Avanzadas",
                description: "Métodos probados para mejorar tu productividad personal y profesional. Desde la gestión del tiempo hasta la organización de tareas.",
                audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                artwork: "https://picsum.photos/300/300?random=3",
                duration: 2100, // 35 minutes
                publishDate: new Date('2024-01-05'),
                playCount: 1450,
                category: "Productividad"
            }
        ];
    }

    showSection(section) {
        console.log('Showing section:', section);
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Find and activate the clicked nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const onclick = item.getAttribute('onclick');
            if (onclick && onclick.includes(`'${section}'`)) {
                item.classList.add('active');
            }
        });

        // Generate content based on section
        const content = document.querySelector('.content');
        
        try {
            switch(section) {
                case 'home':
                    content.innerHTML = this.generateHomeContent();
                    break;
                case 'episodes':
                    content.innerHTML = this.generateEpisodesContent();
                    break;
                case 'player':
                    content.innerHTML = this.generatePlayerContent();
                    break;
                case 'search':
                    content.innerHTML = this.generateSearchContent();
                    break;
                case 'bookmarks':
                    content.innerHTML = this.generateBookmarksContent();
                    break;
                case 'downloads':
                    content.innerHTML = this.generateDownloadsContent();
                    break;
                case 'settings':
                    content.innerHTML = this.generateSettingsContent();
                    break;
                default:
                    content.innerHTML = this.generateHomeContent();
            }
        } catch (error) {
            console.error('Error generating content:', error);
            content.innerHTML = `<div class="error-state"><h2>Error</h2><p>No se pudo cargar el contenido</p></div>`;
        }
    }

    generateHomeContent() {
        const recentEpisodes = this.episodes.slice(0, 3);
        
        return `
            <div class="home-section">
                <h2>🎧 Bienvenido al Podcast Player</h2>
                <div class="stats-overview">
                    <div class="stat-card">
                        <div class="stat-number">${this.episodes.length}</div>
                        <div class="stat-label">Episodios disponibles</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.analytics.totalPlays}</div>
                        <div class="stat-label">Reproducciones</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.bookmarks.length}</div>
                        <div class="stat-label">Marcadores</div>
                    </div>
                </div>
                
                <h3>📻 Episodios Destacados</h3>
                <div class="episode-grid">
                    ${recentEpisodes.map(episode => this.generateEpisodeCard(episode)).join('')}
                </div>
                
                <div class="welcome-message">
                    <h3>🚀 Funcionalidades</h3>
                    <ul>
                        <li>🎵 Reproductor de audio completo</li>
                        <li>🔖 Sistema de marcadores</li>
                        <li>🔍 Búsqueda avanzada</li>
                        <li>📊 Panel de administrador</li>
                        <li>🌙 Temas claro/oscuro</li>
                        <li>📱 PWA instalable</li>
                    </ul>
                </div>
            </div>
        `;
    }

    generateEpisodesContent() {
        return `
            <div class="episodes-section">
                <div class="section-header">
                    <h2>Todos los Episodios</h2>
                    <div class="filters">
                        <select onchange="app.filterEpisodes(this.value)">
                            <option value="all">Todos</option>
                            <option value="recent">Más recientes</option>
                            <option value="popular">Más populares</option>
                            <option value="technology">Tecnología</option>
                            <option value="productivity">Productividad</option>
                        </select>
                    </div>
                </div>
                <div class="episode-grid">
                    ${this.episodes.map(episode => this.generateEpisodeCard(episode)).join('')}
                </div>
            </div>
        `;
    }

    generateEpisodeCard(episode) {
        const progress = this.getEpisodeProgress(episode.id);
        const isDownloaded = this.downloads.includes(episode.id);
        
        return `
            <div class="episode-card" onclick="app.selectEpisode(${episode.id})">
                <div class="episode-header">
                    <img class="episode-artwork" src="${episode.artwork}" alt="${episode.title}">
                    <div class="episode-info">
                        <div class="episode-title">${episode.title}</div>
                        <div class="episode-meta">
                            <span>${this.formatDate(episode.publishDate)}</span>
                            <span>${this.formatTime(episode.duration)}</span>
                            <span>${episode.playCount} reproducciones</span>
                        </div>
                    </div>
                </div>
                <div class="episode-description">${episode.description}</div>
                ${progress > 0 ? `<div class="progress-indicator" style="width: ${(progress / episode.duration) * 100}%"></div>` : ''}
                <div class="episode-actions">
                    <button class="btn" onclick="event.stopPropagation(); app.playEpisode(${episode.id})">
                        ${this.currentEpisode?.id === episode.id && this.isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
                    </button>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); app.toggleBookmark(${episode.id})">
                        🔖 Marcar
                    </button>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); app.toggleDownload(${episode.id})">
                        ${isDownloaded ? '✅ Descargado' : '⬇️ Descargar'}
                    </button>
                </div>
            </div>
        `;
    }

    playEpisode(episodeId) {
        const episode = this.episodes.find(e => e.id === episodeId);
        if (!episode) return;

        this.currentEpisode = episode;
        this.audio.src = episode.audioUrl;
        
        // Restore progress if exists
        const progress = this.getEpisodeProgress(episodeId);
        if (progress > 0) {
            this.audio.currentTime = progress;
        }
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updateMiniPlayer();
            this.showMiniPlayer();
            this.trackPlay(episode);
            this.showNotification(`Reproduciendo: ${episode.title}`);
        }).catch(e => {
            console.error('Playback failed:', e);
            this.showNotification('Error al reproducir el episodio', 'error');
        });
    }

    togglePlayPause() {
        if (!this.currentEpisode) return;

        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            this.audio.play().then(() => {
                this.isPlaying = true;
            });
        }
        
        this.updateMiniPlayer();
    }

    skipForward() {
        if (this.audio.currentTime) {
            this.audio.currentTime = Math.min(this.audio.currentTime + 30, this.duration);
        }
    }

    skipBackward() {
        if (this.audio.currentTime) {
            this.audio.currentTime = Math.max(this.audio.currentTime - 15, 0);
        }
    }

    updateMiniPlayer() {
        if (!this.currentEpisode) return;

        document.getElementById('miniTitle').textContent = this.currentEpisode.title;
        document.getElementById('miniPodcast').textContent = 'Podcast Player';
        document.getElementById('miniArtwork').src = this.currentEpisode.artwork;
        document.getElementById('miniPlayBtn').textContent = this.isPlaying ? '⏸️' : '▶️';
    }

    showMiniPlayer() {
        document.getElementById('miniPlayer').style.display = 'block';
        document.querySelector('.content').style.paddingBottom = '120px';
    }

    updateProgress() {
        if (this.duration > 0) {
            const progress = (this.currentTime / this.duration) * 100;
            document.getElementById('miniProgressBar').style.width = `${progress}%`;
        }
    }

    // Utility functions
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? 'var(--error)' : 'var(--accent)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            zIndex: '1000',
            animation: 'slideIn 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Data persistence
    saveData() {
        const data = {
            bookmarks: this.bookmarks,
            downloads: this.downloads,
            analytics: this.analytics,
            theme: this.theme,
            episodes: this.episodes.map(e => ({
                id: e.id,
                progress: this.getEpisodeProgress(e.id),
                lastPlayed: e.lastPlayed
            }))
        };
        localStorage.setItem('podcastAppData', JSON.stringify(data));
    }

    loadData() {
        const data = localStorage.getItem('podcastAppData');
        if (data) {
            const parsed = JSON.parse(data);
            this.bookmarks = parsed.bookmarks || [];
            this.downloads = parsed.downloads || [];
            this.analytics = parsed.analytics || { totalPlays: 0, totalTime: 0, sessions: [] };
            this.theme = parsed.theme || 'dark';
        }
    }

    // More methods will be added in the next part...
}

// Initialize the app
const app = new PodcastApp();

// Global functions for HTML onclick events
window.app = app;    g
eneratePlayerContent() {
        if (!this.currentEpisode) {
            return `
                <div class="player-empty">
                    <div class="empty-state">
                        <h2>🎧 Reproductor</h2>
                        <p>Selecciona un episodio para comenzar a escuchar</p>
                        <button class="btn" onclick="app.showSection('episodes')">Ver Episodios</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="player-full">
                <div class="player-header">
                    <img class="player-artwork" src="${this.currentEpisode.artwork}" alt="${this.currentEpisode.title}">
                    <div class="player-info">
                        <h2 class="player-title">${this.currentEpisode.title}</h2>
                        <p class="player-description">${this.currentEpisode.description}</p>
                        <div class="player-meta">
                            <span>${this.formatDate(this.currentEpisode.publishDate)}</span>
                            <span>${this.formatTime(this.currentEpisode.duration)}</span>
                            <span>${this.currentEpisode.category}</span>
                        </div>
                    </div>
                </div>
                
                <div class="player-controls-full">
                    <div class="playback-controls">
                        <button class="control-btn" onclick="app.skipBackward()">⏪ 15s</button>
                        <button class="control-btn play-btn-large" onclick="app.togglePlayPause()">
                            ${this.isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <button class="control-btn" onclick="app.skipForward()">⏩ 30s</button>
                    </div>
                    
                    <div class="progress-section">
                        <div class="time-display">
                            <span>${this.formatTime(this.currentTime)}</span>
                            <span>${this.formatTime(this.duration)}</span>
                        </div>
                        <div class="progress-bar-full">
                            <div class="progress-fill" style="width: ${this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="player-actions">
                    <button class="btn btn-secondary" onclick="app.addBookmark()">🔖 Añadir Marcador</button>
                    <button class="btn btn-secondary" onclick="app.shareEpisode()">📤 Compartir</button>
                    <button class="btn btn-secondary" onclick="app.toggleDownload(${this.currentEpisode.id})">
                        ${this.downloads.includes(this.currentEpisode.id) ? '✅ Descargado' : '⬇️ Descargar'}
                    </button>
                </div>
            </div>
        `;
    }

    generateSearchContent() {
        return `
            <div class="search-section">
                <div class="search-header">
                    <h2>🔍 Buscar Episodios</h2>
                    <div class="search-box">
                        <input type="text" placeholder="Buscar por título, descripción o categoría..." 
                               oninput="app.performSearch(this.value)" class="search-input">
                        <button class="search-btn">🔍</button>
                    </div>
                </div>
                
                <div class="search-filters">
                    <button class="filter-tag active" onclick="app.setSearchFilter('all', this)">Todos</button>
                    <button class="filter-tag" onclick="app.setSearchFilter('technology', this)">Tecnología</button>
                    <button class="filter-tag" onclick="app.setSearchFilter('productivity', this)">Productividad</button>
                </div>
                
                <div id="searchResults" class="search-results">
                    <div class="search-suggestions">
                        <h3>Todos los Episodios</h3>
                        <div class="episode-grid">
                            ${this.episodes.map(episode => this.generateEpisodeCard(episode)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateBookmarksContent() {
        if (this.bookmarks.length === 0) {
            return `
                <div class="bookmarks-empty">
                    <h2>🔖 Marcadores</h2>
                    <div class="empty-state">
                        <p>No tienes marcadores guardados</p>
                        <p>Añade marcadores mientras escuchas episodios para guardar momentos importantes</p>
                        <button class="btn" onclick="app.showSection('episodes')">Explorar Episodios</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="bookmarks-section">
                <h2>🔖 Mis Marcadores</h2>
                <div class="bookmarks-list">
                    ${this.bookmarks.map(bookmark => this.generateBookmarkCard(bookmark)).join('')}
                </div>
            </div>
        `;
    }

    generateDownloadsContent() {
        const downloadedEpisodes = this.episodes.filter(ep => this.downloads.includes(ep.id));
        
        if (downloadedEpisodes.length === 0) {
            return `
                <div class="downloads-empty">
                    <h2>⬇️ Descargas</h2>
                    <div class="empty-state">
                        <p>No tienes episodios descargados</p>
                        <p>Descarga episodios para escucharlos sin conexión</p>
                        <button class="btn" onclick="app.showSection('episodes')">Ver Episodios</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="downloads-section">
                <h2>⬇️ Episodios Descargados</h2>
                <div class="episode-grid">
                    ${downloadedEpisodes.map(episode => this.generateEpisodeCard(episode)).join('')}
                </div>
            </div>
        `;
    }

    generateSettingsContent() {
        return `
            <div class="settings-section">
                <h2>⚙️ Configuración</h2>
                
                <div class="settings-group">
                    <h3>Apariencia</h3>
                    <div class="setting-item">
                        <span>Tema</span>
                        <select onchange="app.changeTheme(this.value)">
                            <option value="dark" ${this.theme === 'dark' ? 'selected' : ''}>Oscuro</option>
                            <option value="light" ${this.theme === 'light' ? 'selected' : ''}>Claro</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>Reproducción</h3>
                    <div class="setting-item">
                        <span>Velocidad de reproducción</span>
                        <select onchange="app.setPlaybackRate(this.value)">
                            <option value="0.5">0.5x</option>
                            <option value="0.75">0.75x</option>
                            <option value="1" ${this.playbackRate === 1 ? 'selected' : ''}>1x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>Datos</h3>
                    <div class="setting-item">
                        <button class="btn btn-secondary" onclick="app.exportData()">📊 Exportar Datos</button>
                        <button class="btn btn-secondary" onclick="app.clearData()">🗑️ Limpiar Datos</button>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>Administración</h3>
                    <div class="setting-item">
                        <button class="btn" onclick="app.showAdminLogin()">🔐 Panel de Administrador</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Missing utility functions
    selectEpisode(episodeId) {
        const episode = this.episodes.find(e => e.id === episodeId);
        if (episode) {
            this.currentEpisode = episode;
            this.showSection('player');
        }
    }

    getEpisodeProgress(episodeId) {
        const saved = localStorage.getItem(`episode_progress_${episodeId}`);
        return saved ? parseInt(saved) : 0;
    }

    saveProgress() {
        if (this.currentEpisode && this.currentTime > 0) {
            localStorage.setItem(`episode_progress_${this.currentEpisode.id}`, this.currentTime.toString());
        }
    }

    handleEpisodeEnd() {
        this.isPlaying = false;
        this.analytics.totalPlays++;
        this.saveData();
        this.showNotification('Episodio terminado');
    }

    trackPlay(episode) {
        this.analytics.totalPlays++;
        this.analytics.totalTime += episode.duration;
        this.saveData();
    }

    toggleBookmark(episodeId) {
        const episode = this.episodes.find(e => e.id === episodeId);
        if (!episode) return;

        const bookmark = {
            id: Date.now(),
            episodeId: episodeId,
            episodeTitle: episode.title,
            timestamp: this.currentTime || 0,
            note: '',
            createdAt: new Date()
        };

        this.bookmarks.push(bookmark);
        this.saveData();
        this.showNotification('Marcador añadido');
    }

    toggleDownload(episodeId) {
        const index = this.downloads.indexOf(episodeId);
        if (index > -1) {
            this.downloads.splice(index, 1);
            this.showNotification('Descarga eliminada');
        } else {
            this.downloads.push(episodeId);
            this.showNotification('Episodio descargado');
        }
        this.saveData();
        
        // Refresh current view if needed
        const content = document.querySelector('.content');
        if (content.innerHTML.includes('downloads-section')) {
            this.showSection('downloads');
        }
    }

    performSearch(query) {
        if (!query.trim()) {
            document.getElementById('searchResults').innerHTML = `
                <div class="search-suggestions">
                    <h3>Todos los Episodios</h3>
                    <div class="episode-grid">
                        ${this.episodes.map(episode => this.generateEpisodeCard(episode)).join('')}
                    </div>
                </div>
            `;
            return;
        }

        const results = this.episodes.filter(episode => 
            episode.title.toLowerCase().includes(query.toLowerCase()) ||
            episode.description.toLowerCase().includes(query.toLowerCase()) ||
            episode.category.toLowerCase().includes(query.toLowerCase())
        );

        document.getElementById('searchResults').innerHTML = `
            <div class="search-results-list">
                <h3>Resultados para "${query}" (${results.length})</h3>
                ${results.length > 0 ? 
                    `<div class="episode-grid">${results.map(episode => this.generateEpisodeCard(episode)).join('')}</div>` :
                    '<p class="no-results">No se encontraron episodios</p>'
                }
            </div>
        `;
    }

    changeTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.saveData();
        this.showNotification(`Tema cambiado a ${theme === 'dark' ? 'oscuro' : 'claro'}`);
    }

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.changeTheme(newTheme);
    }

    setPlaybackRate(rate) {
        this.playbackRate = parseFloat(rate);
        this.audio.playbackRate = this.playbackRate;
        this.showNotification(`Velocidad: ${rate}x`);
    }

    addBookmark() {
        if (!this.currentEpisode) return;
        
        const bookmark = {
            id: Date.now(),
            episodeId: this.currentEpisode.id,
            episodeTitle: this.currentEpisode.title,
            timestamp: this.currentTime,
            note: prompt('Añadir nota al marcador (opcional):') || '',
            createdAt: new Date()
        };
        
        this.bookmarks.push(bookmark);
        this.saveData();
        this.showNotification('Marcador añadido');
    }

    generateBookmarkCard(bookmark) {
        return `
            <div class="bookmark-card">
                <div class="bookmark-info">
                    <h4>${bookmark.episodeTitle}</h4>
                    <p>Tiempo: ${this.formatTime(bookmark.timestamp)}</p>
                    ${bookmark.note ? `<p class="bookmark-note">"${bookmark.note}"</p>` : ''}
                    <small>${this.formatDate(bookmark.createdAt)}</small>
                </div>
                <div class="bookmark-actions">
                    <button class="btn" onclick="app.playFromBookmark(${bookmark.id})">▶️ Reproducir</button>
                    <button class="btn btn-secondary" onclick="app.deleteBookmark(${bookmark.id})">🗑️</button>
                </div>
            </div>
        `;
    }

    playFromBookmark(bookmarkId) {
        const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
        if (!bookmark) return;
        
        const episode = this.episodes.find(e => e.id === bookmark.episodeId);
        if (!episode) return;
        
        this.playEpisode(episode.id);
        setTimeout(() => {
            this.audio.currentTime = bookmark.timestamp;
        }, 500);
    }

    deleteBookmark(bookmarkId) {
        const index = this.bookmarks.findIndex(b => b.id === bookmarkId);
        if (index > -1) {
            this.bookmarks.splice(index, 1);
            this.saveData();
            this.showSection('bookmarks'); // Refresh view
            this.showNotification('Marcador eliminado');
        }
    }

    shareEpisode() {
        if (!this.currentEpisode) return;
        
        if (navigator.share) {
            navigator.share({
                title: this.currentEpisode.title,
                text: this.currentEpisode.description,
                url: window.location.href
            });
        } else {
            // Fallback
            const text = `${this.currentEpisode.title} - ${window.location.href}`;
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Enlace copiado al portapapeles');
            });
        }
    }

    exportData() {
        const data = {
            bookmarks: this.bookmarks,
            downloads: this.downloads,
            analytics: this.analytics,
            theme: this.theme
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'podcast-data.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Datos exportados');
    }

    clearData() {
        if (confirm('¿Estás seguro de que quieres limpiar todos los datos?')) {
            this.bookmarks = [];
            this.downloads = [];
            this.analytics = { totalPlays: 0, totalTime: 0, sessions: [] };
            localStorage.clear();
            this.showNotification('Datos limpiados');
            this.showSection('home');
        }
    }

    // Admin functions
    showAdminLogin() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content admin-login-modal">
                <h3>🔐 Acceso de Administrador</h3>
                <input type="text" id="adminUser" placeholder="Usuario" value="admin">
                <input type="password" id="adminPass" placeholder="Contraseña" value="admin123">
                <div class="modal-actions">
                    <button class="btn" onclick="app.adminLogin()">Iniciar Sesión</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                </div>
                <p class="demo-note">Demo: admin / admin123</p>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    adminLogin() {
        const user = document.getElementById('adminUser').value;
        const pass = document.getElementById('adminPass').value;
        
        if (user === 'admin' && pass === 'admin123') {
            this.isAdminLoggedIn = true;
            document.querySelector('.modal-overlay').remove();
            this.showAdminDashboard();
        } else {
            this.showNotification('Credenciales incorrectas', 'error');
        }
    }

    showAdminDashboard() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay admin-dashboard';
        modal.innerHTML = `
            <div class="modal-content admin-dashboard-content">
                <div class="admin-header">
                    <h2>📊 Panel de Administrador</h2>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                
                <div class="admin-stats">
                    <div class="stat-card">
                        <div class="stat-number">1,247</div>
                        <div class="stat-label">Usuarios Totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${this.analytics.totalPlays}</div>
                        <div class="stat-label">Reproducciones</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">2,156</div>
                        <div class="stat-label">Horas Totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">892</div>
                        <div class="stat-label">Activos Hoy</div>
                    </div>
                </div>
                
                <div class="admin-actions">
                    <button class="btn" onclick="app.exportData()">📊 Exportar Analytics</button>
                    <button class="btn btn-secondary" onclick="alert('Función de gestión de contenido')">📝 Gestionar Contenido</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">🚪 Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // User menu functions
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('show');
    }

    toggleNotifications() {
        this.showNotification('Notificaciones activadas');
    }

    showProfile() {
        this.showNotification('Función de perfil en desarrollo');
    }

    showSubscriptions() {
        this.showNotification('Función de suscripciones en desarrollo');
    }

    showHistory() {
        this.showNotification('Función de historial en desarrollo');
    }
}