// Extended features for Podcast App

// Add these methods to the PodcastApp class
PodcastApp.prototype.generatePlayerContent = function() {
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
                    <button class="control-btn" onclick="app.changePlaybackRate()">
                        ${this.playbackRate}x
                    </button>
                    <button class="control-btn" onclick="app.skipBackward()">⏪ 15s</button>
                    <button class="control-btn play-btn-large" onclick="app.togglePlayPause()">
                        ${this.isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <button class="control-btn" onclick="app.skipForward()">⏩ 30s</button>
                    <button class="control-btn" onclick="app.toggleMute()">
                        ${this.volume > 0 ? '🔊' : '🔇'}
                    </button>
                </div>
                
                <div class="progress-section">
                    <div class="time-display">
                        <span>${this.formatTime(this.currentTime)}</span>
                        <span>${this.formatTime(this.duration)}</span>
                    </div>
                    <div class="progress-bar-full" onclick="app.seekTo(event)">
                        <div class="progress-fill" style="width: ${(this.currentTime / this.duration) * 100}%"></div>
                        <div class="progress-handle" style="left: ${(this.currentTime / this.duration) * 100}%"></div>
                    </div>
                </div>
                
                <div class="volume-section">
                    <span>🔊</span>
                    <input type="range" min="0" max="1" step="0.1" value="${this.volume}" 
                           onchange="app.setVolume(this.value)" class="volume-slider">
                </div>
            </div>
            
            <div class="player-actions">
                <button class="btn btn-secondary" onclick="app.addBookmark()">🔖 Añadir Marcador</button>
                <button class="btn btn-secondary" onclick="app.shareEpisode()">📤 Compartir</button>
                <button class="btn btn-secondary" onclick="app.showTranscription()">📝 Transcripción</button>
                <button class="btn btn-secondary" onclick="app.toggleDownload(${this.currentEpisode.id})">
                    ${this.downloads.includes(this.currentEpisode.id) ? '✅ Descargado' : '⬇️ Descargar'}
                </button>
            </div>
        </div>
    `;
};

PodcastApp.prototype.generateSearchContent = function() {
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
                <button class="filter-tag" onclick="app.setSearchFilter('recent', this)">Recientes</button>
            </div>
            
            <div id="searchResults" class="search-results">
                <div class="search-suggestions">
                    <h3>Sugerencias</h3>
                    <div class="episode-grid">
                        ${this.episodes.slice(0, 2).map(episode => this.generateEpisodeCard(episode)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
};

PodcastApp.prototype.generateBookmarksContent = function() {
    if (this.bookmarks.length === 0) {
        return `
            <div class="bookmarks-empty">
                <h2>🔖 Marcadores</h2>
                <div class="empty-state">
                    <p>No tienes marcadores guardados</p>
                    <p>Añade marcadores mientras escuchas episodios para guardar momentos importantes</p>
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
};

PodcastApp.prototype.generateSettingsContent = function() {
    return `
        <div class="settings-section">
            <h2>⚙️ Configuración</h2>
            
            <div class="settings-group">
                <h3>Apariencia</h3>
                <div class="setting-item">
                    <span>Tema</span>
                    <select onchange="app.changeTheme(this.value)" value="${this.theme}">
                        <option value="dark" ${this.theme === 'dark' ? 'selected' : ''}>Oscuro</option>
                        <option value="light" ${this.theme === 'light' ? 'selected' : ''}>Claro</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-group">
                <h3>Reproducción</h3>
                <div class="setting-item">
                    <span>Velocidad de reproducción por defecto</span>
                    <select onchange="app.setDefaultPlaybackRate(this.value)">
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1" selected>1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>
                </div>
                <div class="setting-item">
                    <span>Salto hacia adelante</span>
                    <select onchange="app.setSkipForwardTime(this.value)">
                        <option value="15">15 segundos</option>
                        <option value="30" selected>30 segundos</option>
                        <option value="60">1 minuto</option>
                    </select>
                </div>
                <div class="setting-item">
                    <span>Salto hacia atrás</span>
                    <select onchange="app.setSkipBackwardTime(this.value)">
                        <option value="10">10 segundos</option>
                        <option value="15" selected>15 segundos</option>
                        <option value="30">30 segundos</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-group">
                <h3>Almacenamiento</h3>
                <div class="setting-item">
                    <span>Descargas automáticas</span>
                    <label class="toggle">
                        <input type="checkbox" onchange="app.toggleAutoDownload(this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <span>Calidad de descarga</span>
                    <select>
                        <option value="high">Alta (320kbps)</option>
                        <option value="medium" selected>Media (128kbps)</option>
                        <option value="low">Baja (64kbps)</option>
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
};

// Additional utility methods
PodcastApp.prototype.performSearch = function(query) {
    if (!query.trim()) {
        document.getElementById('searchResults').innerHTML = `
            <div class="search-suggestions">
                <h3>Sugerencias</h3>
                <div class="episode-grid">
                    ${this.episodes.slice(0, 2).map(episode => this.generateEpisodeCard(episode)).join('')}
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
};

PodcastApp.prototype.changeTheme = function(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.saveData();
    this.showNotification(`Tema cambiado a ${theme === 'dark' ? 'oscuro' : 'claro'}`);
};

PodcastApp.prototype.toggleTheme = function() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.changeTheme(newTheme);
};

PodcastApp.prototype.addBookmark = function() {
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
};

PodcastApp.prototype.generateBookmarkCard = function(bookmark) {
    const episode = this.episodes.find(e => e.id === bookmark.episodeId);
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
};

PodcastApp.prototype.playFromBookmark = function(bookmarkId) {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return;
    
    const episode = this.episodes.find(e => e.id === bookmark.episodeId);
    if (!episode) return;
    
    this.playEpisode(episode.id);
    setTimeout(() => {
        this.audio.currentTime = bookmark.timestamp;
    }, 500);
};

// Admin functionality
PodcastApp.prototype.showAdminLogin = function() {
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
};

PodcastApp.prototype.adminLogin = function() {
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    
    if (user === 'admin' && pass === 'admin123') {
        this.isAdminLoggedIn = true;
        document.querySelector('.modal-overlay').remove();
        this.showAdminDashboard();
    } else {
        this.showNotification('Credenciales incorrectas', 'error');
    }
};

PodcastApp.prototype.showAdminDashboard = function() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay admin-dashboard';
    modal.innerHTML = this.generateAdminDashboard();
    document.body.appendChild(modal);
};

PodcastApp.prototype.generateAdminDashboard = function() {
    const stats = this.getAnalytics();
    return `
        <div class="modal-content admin-dashboard-content">
            <div class="admin-header">
                <h2>📊 Panel de Administrador</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            
            <div class="admin-stats">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalUsers}</div>
                    <div class="stat-label">Usuarios Totales</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.totalPlays}</div>
                    <div class="stat-label">Reproducciones</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.formatTime(stats.totalListeningTime)}</div>
                    <div class="stat-label">Tiempo Total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.activeToday}</div>
                    <div class="stat-label">Activos Hoy</div>
                </div>
            </div>
            
            <div class="admin-charts">
                <div class="chart-container">
                    <h4>Episodios Más Populares</h4>
                    ${this.generatePopularityChart()}
                </div>
            </div>
            
            <div class="admin-actions">
                <button class="btn" onclick="app.exportAnalytics()">📊 Exportar Analytics</button>
                <button class="btn btn-secondary" onclick="app.manageContent()">📝 Gestionar Contenido</button>
                <button class="btn btn-secondary" onclick="app.adminLogout()">🚪 Cerrar Sesión</button>
            </div>
        </div>
    `;
};

// Initialize extended features
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS for new components
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: var(--bg-secondary);
            padding: 2rem;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .admin-dashboard-content {
            max-width: 800px;
        }
        
        .admin-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .stat-card {
            background: var(--bg-tertiary);
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: var(--accent);
        }
        
        .stat-label {
            color: var(--text-muted);
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
});