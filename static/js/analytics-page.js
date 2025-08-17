// Client-side JavaScript for Analytics page
// File: static/js/analytics-page.js

document.addEventListener('DOMContentLoaded', function () {
  // Get configuration from data attributes
  const body = document.body;
  const config = {
    isPro: body.dataset.isPro === 'true',
    isGuest: body.dataset.isGuest === 'true',
    itemsPerPage: parseInt(body.dataset.itemsPerPage) || 5,
    currentPage: 1,
    isLoading: false
  };

  // DOM elements
  const elements = {
    filterSelects: document.querySelectorAll('.filter-select'),
    trendingToggle: document.getElementById('trending-only'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    exportBtn: document.getElementById('export-btn'),
    viewButtons: document.querySelectorAll('.view-btn'),
    analyticsGrid: document.getElementById('analytics-grid'),
    currentPageEl: document.getElementById('current-page'),
    totalPagesEl: document.getElementById('total-pages'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn')
  };

  // Initialize the page
  init();

  function init() {
    setupEventListeners();
    setupProFeatureRestrictions();
  }

  function setupEventListeners() {
    // Filter change events - only for non-guest users
    if (!config.isGuest) {
      elements.filterSelects.forEach(select => {
        if (!select.disabled) {
          select.addEventListener('change', () => applyFilters());
        }
      });

      if (elements.trendingToggle && config.isPro) {
        elements.trendingToggle.addEventListener('change', () => applyFilters());
      }

      if (elements.searchBtn && config.isPro) {
        elements.searchBtn.addEventListener('click', () => applyFilters());
      }

      if (elements.searchInput && config.isPro) {
        elements.searchInput.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') {
            applyFilters();
          }
        });
      }

      // Export functionality
      if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', function () {
          window.location.href = '/analytics/export';
        });
      }

      // View toggle - Pro only
      if (config.isPro) {
        elements.viewButtons.forEach(btn => {
          btn.addEventListener('click', function () {
            elements.viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const view = this.dataset.view;
            const grid = elements.analyticsGrid;

            if (view === 'list') {
              grid.classList.add('list-view');
            } else {
              grid.classList.remove('list-view');
            }
          });
        });
      }
    }
  }

  function setupProFeatureRestrictions() {
    // Disable pro features for non-pro users
    if (!config.isPro && !config.isGuest) {
      // Show upgrade prompts for disabled features
      elements.filterSelects.forEach(select => {
        if (select.disabled) {
          select.addEventListener('click', function() {
            showToast('Upgrade to Pro to access advanced filtering', 'info');
          });
        }
      });

      if (elements.searchInput && elements.searchInput.disabled) {
        elements.searchInput.addEventListener('click', function() {
          showToast('Upgrade to Pro to use search', 'info');
        });
      }
    }
  }

  function applyFilters(resetPage = true) {
    if (config.isGuest || config.isLoading) return;

    config.isLoading = true;

    if (resetPage) config.currentPage = 1;

    const filters = getCurrentFilters();

    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== 'all' && value !== false) {
        queryParams.append(key, value.toString());
      }
    });

    // Update URL without page reload
    const newUrl = `/analytics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    window.history.pushState({}, '', newUrl);

    // Fetch filtered data
    fetch('/analytics?' + queryParams.toString(), {
      headers: { 'Accept': 'application/json' }
    })
      .then(response => response.json())
      .then(data => {
        updateAnalyticsGrid(data.cards);
        updatePagination(data.total);
        updateStats(data.stats);
        config.isLoading = false;
      })
      .catch(error => {
        console.error('Error fetching analytics:', error);
        showToast('Error loading data', 'error');
        config.isLoading = false;
      });
  }

  function getCurrentFilters() {
    const platformFilter = document.getElementById('platform-filter');
    const riskFilter = document.getElementById('risk-filter');
    const sortFilter = document.getElementById('sort-filter');

    return {
      platform: config.isPro && platformFilter ? platformFilter.value : 'all',
      risk: config.isPro && riskFilter ? riskFilter.value : 'all',
      sort: sortFilter ? sortFilter.value : 'trending',
      trending: config.isPro && elements.trendingToggle ? elements.trendingToggle.checked : false,
      search: config.isPro && elements.searchInput ? elements.searchInput.value : '',
      offset: (config.currentPage - 1) * config.itemsPerPage,
      limit: config.itemsPerPage
    };
  }

  function updateAnalyticsGrid(cards) {
    if (!elements.analyticsGrid) return;

    if (cards.length === 0) {
      elements.analyticsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>No analytics cards found</h3>
          <p>Try adjusting your filters or check back later for new data.</p>
          ${config.isPro ? '<button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>' : ''}
        </div>
      `;
      return;
    }

    elements.analyticsGrid.innerHTML = cards.map(card => createCardHTML(card)).join('');
  }

  function createCardHTML(card) {
    const proFeature = (content, fallback = '<span class="pro-feature">🔒 Pro</span>') => {
      return config.isPro ? content : fallback;
    };

    return `
      <div class="analytics-card" data-platform="${card.collection.platform}" data-risk="${card.riskLevel}" data-trending="${card.trending}">
        <div class="card-header">
          <div class="artist-info">
            <img src="https://via.placeholder.com/48?text=${card.artist.displayName.charAt(0)}" alt="${card.artist.displayName}" class="artist-avatar">
            <div class="artist-details">
              <h4>${card.artist.displayName}</h4>
              <p>@${card.artist.username}</p>
            </div>
          </div>
          <div class="card-badges">
            <span class="platform-badge platform-${card.collection.platform}">
              <i class="fas fa-cube"></i> ${card.collection.platform}
            </span>
            ${card.trending ? '<span class="trending-badge"><i class="fas fa-fire"></i> Trending</span>' : ''}
          </div>
        </div>
        <div class="card-content">
          <h3 class="collection-name">${card.collection.name}</h3>

          <div class="metrics-grid">
            <div class="metric">
              <span class="metric-label">
                <i class="fas fa-chart-line"></i> Market Cap
              </span>
              <span class="metric-value">
                ${proFeature(
                  card.metrics.marketCap > 0 ?
                    `$${card.metrics.marketCap.toLocaleString()} <small class="change ${card.metrics.marketCapChange24h >= 0 ? 'positive' : 'negative'}">${card.metrics.marketCapChange24h >= 0 ? '+' : ''}${card.metrics.marketCapChange24h.toFixed(1)}%</small>`
                    : '<span class="pro-feature">🔒 Pro</span>'
                )}
              </span>
            </div>

            <div class="metric">
              <span class="metric-label">
                <i class="fas fa-exchange-alt"></i> Volume 24h
              </span>
              <span class="metric-value">
                ${proFeature(
                  card.metrics.volume24h > 0 ?
                    `$${card.metrics.volume24h.toLocaleString()}`
                    : '<span class="pro-feature">🔒 Pro</span>'
                )}
              </span>
            </div>

            <div class="metric">
              <span class="metric-label">
                <i class="fas fa-users"></i> Followers
              </span>
              <span class="metric-value">
                ${card.metrics.followers.toLocaleString()}
                <small class="change ${card.metrics.followersChange24h >= 0 ? 'positive' : 'negative'}">
                  ${card.metrics.followersChange24h >= 0 ? '+' : ''}${card.metrics.followersChange24h}
                </small>
              </span>
            </div>

            <div class="metric">
              <span class="metric-label">
                <i class="fas fa-star"></i> Smart Followers
              </span>
              <span class="metric-value">
                ${proFeature(
                  card.metrics.smartFollowers > 0 ?
                    card.metrics.smartFollowers.toString()
                    : '<span class="pro-feature">🔒 Pro</span>'
                )}
              </span>
            </div>
          </div>

          <div class="ai-recommendation">
            <div class="ai-header">
              <i class="fas fa-robot"></i>
              <span>AI Recommendation</span>
              <span class="risk-badge risk-${card.riskLevel}">${card.riskLevel.toUpperCase()} RISK</span>
            </div>
            <p>${card.aiRecommendation}</p>
          </div>

          ${config.isPro ? `
            <div class="card-tags">
              ${card.tags.map(tag => `<span class="tag tag-${tag.replace(/[^a-z0-9]/gi, '')}">${tag}</span>`).join('')}
            </div>
          ` : ''}

          <div class="card-actions">
            <a href="${card.artist.profileUrl}" target="_blank" class="btn btn-outline btn-small">
              <i class="fas fa-external-link-alt"></i> View Profile
            </a>
            ${card.artist.twitterUrl ? `
              <a href="${card.artist.twitterUrl}" target="_blank" class="btn btn-outline btn-small">
                <i class="fab fa-twitter"></i> Twitter
              </a>
            ` : ''}
            ${config.isPro ? `
              <button class="btn btn-outline btn-small" onclick="shareCard('${card.id}')">
                <i class="fas fa-share"></i> Share
              </button>
              <button class="btn btn-primary btn-small" onclick="addToWatchlist('${card.id}')">
                <i class="fas fa-bookmark"></i> Watch
              </button>
            ` : ''}
          </div>
        </div>

        <div class="card-footer">
          <span class="timestamp">
            <i class="fas fa-clock"></i>
            Updated ${new Date(card.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>
    `;
  }

  function updatePagination(total) {
    const totalPages = Math.ceil(total / config.itemsPerPage);

    if (elements.currentPageEl) elements.currentPageEl.textContent = config.currentPage;
    if (elements.totalPagesEl) elements.totalPagesEl.textContent = totalPages;

    if (elements.prevBtn) elements.prevBtn.disabled = config.currentPage <= 1;
    if (elements.nextBtn) elements.nextBtn.disabled = config.currentPage >= totalPages;
  }

  function updateStats(stats) {
    // Update header stats if needed
    // This could update the dashboard stats dynamically
  }

  // Global functions for card interactions
  window.changePage = function (direction) {
    if (!config.isPro) return;
    config.currentPage += direction;
    applyFilters(false);
  };

  window.clearFilters = function () {
    if (!config.isPro) return;

    const platformFilter = document.getElementById('platform-filter');
    const riskFilter = document.getElementById('risk-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (platformFilter) platformFilter.value = 'all';
    if (riskFilter) riskFilter.value = 'all';
    if (sortFilter) sortFilter.value = 'trending';
    if (elements.trendingToggle) elements.trendingToggle.checked = false;
    if (elements.searchInput) elements.searchInput.value = '';

    applyFilters();
  };

  window.shareCard = function (cardId) {
    if (!config.isPro) {
      showToast('Upgrade to Pro to share cards', 'info');
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: 'NFT Analytics',
        text: 'Check out this trending NFT project',
        url: window.location.href + '?card=' + cardId
      });
    } else {
      navigator.clipboard.writeText(window.location.href + '?card=' + cardId);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  window.addToWatchlist = function (cardId) {
    if (!config.isPro) {
      showToast('Upgrade to Pro to use watchlist', 'info');
      return;
    }

    // Implement watchlist functionality
    showToast('Added to watchlist!', 'success');
  };

  // Utility function for toast notifications
  function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
    } else {
      // Fallback
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
});
