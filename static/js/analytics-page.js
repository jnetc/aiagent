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

    // Fetch filtered data as HTML (не JSON!)
    fetch('/analytics/cards?' + queryParams.toString(), {
      headers: { 'Accept': 'text/html' }
    })
      .then(response => response.text())
      .then(html => {
        updateAnalyticsGrid(html);
        updateStats(); // Можем отдельно получить статистику
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

  function updateAnalyticsGrid(html) {
    if (!elements.analyticsGrid) return;

    // Просто заменяем содержимое готовым HTML
    elements.analyticsGrid.innerHTML = html;

    // Переинициализируем обработчики событий для новых элементов
    reinitializeCardEvents();
  }

  function reinitializeCardEvents() {
    // Если есть специфичные обработчики для карточек, переинициализируем их
    const cards = elements.analyticsGrid.querySelectorAll('.analytics-card');
    cards.forEach(card => {
      // Добавляем анимацию появления
      card.style.animation = 'fadeInUp 0.5s ease-out';
    });
  }

  function updateStats() {
    // Получаем обновленную статистику отдельным запросом если нужно
    // Или обновляем из data-атрибутов
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

    showToast('Added to watchlist!', 'success');
  };

  // Utility function for toast notifications
  function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
});
