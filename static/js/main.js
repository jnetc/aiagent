// Enhanced JavaScript functionality for Zora AI Agent

document.addEventListener('DOMContentLoaded', function() {
  // Auto-hide notifications after 5 seconds
  const notifications = document.querySelectorAll('.notification');
  notifications.forEach(notification => {
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Enhanced loading states for forms
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        submitBtn.disabled = true;

        // Re-enable after 10 seconds as fallback
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 10000);
      }
    });
  });

  // Enhanced analytics card interactions
  const analyticsCards = document.querySelectorAll('.analytics-card');
  analyticsCards.forEach(card => {
    // Add hover effects
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
      this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.4)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(-4px)';
      this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
    });

    // Click analytics tracking
    card.addEventListener('click', function(e) {
      if (!e.target.closest('a') && !e.target.closest('button')) {
        // Track card view
        trackEvent('card_view', {
          cardId: this.dataset.cardId,
          platform: this.dataset.platform,
          risk: this.dataset.risk,
          trending: this.dataset.trending
        });
      }
    });

    // Lazy load card images
    const images = card.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });
      observer.observe(img);
    });
  });

  // Real-time updates (WebSocket simulation)
  if (window.location.pathname === '/analytics') {
    initializeRealTimeUpdates();
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Escape to clear search
    if (e.key === 'Escape') {
      const searchInput = document.getElementById('search-input');
      if (searchInput && searchInput === document.activeElement) {
        searchInput.value = '';
        searchInput.blur();
        if (typeof applyFilters === 'function') {
          applyFilters();
        }
      }
    }
  });

  // Initialize tooltips
  initializeTooltips();

  // Initialize infinite scroll for analytics page
  if (window.location.pathname === '/analytics') {
    initializeInfiniteScroll();
  }
});

// Copy to clipboard functionality
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Copied to clipboard!', 'success');
  });
};

// Enhanced toast notifications
window.showToast = function(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `notification ${type}`;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <i class="fas fa-${getToastIcon(type)}"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out';
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, duration);
};

function getToastIcon(type) {
  switch (type) {
    case 'success': return 'check-circle';
    case 'error': return 'exclamation-circle';
    case 'warning': return 'exclamation-triangle';
    default: return 'info-circle';
  }
}

// Real-time updates simulation
function initializeRealTimeUpdates() {
  console.log('🔄 Real-time updates initialized');

  // Simulate periodic updates every 30 seconds
  setInterval(() => {
    updateAnalyticsCards();
  }, 30000);

  // Simulate WebSocket connection status
  let isConnected = true;
  const statusIndicator = createConnectionStatus();

  // Simulate connection issues occasionally
  setInterval(() => {
    isConnected = Math.random() > 0.1; // 90% uptime
    updateConnectionStatus(statusIndicator, isConnected);
  }, 10000);
}

function createConnectionStatus() {
  const indicator = document.createElement('div');
  indicator.id = 'connection-status';
  indicator.style.cssText = `
    position: fixed;
    top: 80px;
    left: 20px;
    padding: 0.5rem 1rem;
    background: var(--success-color);
    color: white;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    z-index: 1000;
    transition: all 0.3s;
  `;
  indicator.innerHTML = '<i class="fas fa-wifi"></i> Connected';
  document.body.appendChild(indicator);
  return indicator;
}

function updateConnectionStatus(indicator, isConnected) {
  if (isConnected) {
    indicator.style.background = 'var(--success-color)';
    indicator.innerHTML = '<i class="fas fa-wifi"></i> Connected';
  } else {
    indicator.style.background = 'var(--error-color)';
    indicator.innerHTML = '<i class="fas fa-wifi"></i> Reconnecting...';
  }
}

function updateAnalyticsCards() {
  const cards = document.querySelectorAll('.analytics-card');
  cards.forEach((card, index) => {
    // Simulate data updates with a small delay
    setTimeout(() => {
      const metrics = card.querySelectorAll('.metric-value');
      metrics.forEach(metric => {
        // Add subtle pulse animation
        metric.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
          metric.style.animation = '';
        }, 500);
      });

      // Randomly update some values
      if (Math.random() > 0.8) {
        const changeElements = card.querySelectorAll('.change');
        changeElements.forEach(changeEl => {
          const currentValue = parseFloat(changeEl.textContent.replace(/[^-0-9.]/g, ''));
          const newValue = currentValue + (Math.random() - 0.5) * 10;
          const isPositive = newValue >= 0;

          changeEl.textContent = `${isPositive ? '+' : ''}${newValue.toFixed(1)}%`;
          changeEl.className = `change ${isPositive ? 'positive' : 'negative'}`;
        });
      }
    }, index * 100);
  });
}

// Tooltips functionality
function initializeTooltips() {
  const elements = document.querySelectorAll('[data-tooltip]');

  elements.forEach(element => {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
  });
}

function showTooltip(e) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = e.target.dataset.tooltip;
  tooltip.style.cssText = `
    position: absolute;
    background: var(--dark-bg);
    color: var(--text-primary);
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    z-index: 1000;
    pointer-events: none;
    border: 1px solid var(--border-color);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  `;

  document.body.appendChild(tooltip);

  const updatePosition = (event) => {
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY - tooltip.offsetHeight - 10 + 'px';
  };

  updatePosition(e);
  e.target.addEventListener('mousemove', updatePosition);

  e.target._tooltip = tooltip;
  e.target._updatePosition = updatePosition;
}

function hideTooltip(e) {
  if (e.target._tooltip) {
    e.target._tooltip.remove();
    e.target.removeEventListener('mousemove', e.target._updatePosition);
    delete e.target._tooltip;
    delete e.target._updatePosition;
  }
}

// Infinite scroll for analytics
function initializeInfiniteScroll() {
  let isLoading = false;
  let hasMore = true;
  let currentOffset = 0;

  function loadMoreCards() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    showLoadingIndicator();

    // Get current filters
    const filters = getCurrentFilters();
    filters.offset = currentOffset;
    filters.limit = 10; // Load 10 more cards

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== 'all' && value !== false) {
        queryParams.append(key, value.toString());
      }
    });

    fetch('/analytics?' + queryParams.toString(), {
      headers: { 'Accept': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      appendCards(data.cards);
      currentOffset += data.cards.length;
      hasMore = data.cards.length === 10;
      isLoading = false;
      hideLoadingIndicator();
    })
    .catch(error => {
      console.error('Error loading more cards:', error);
      isLoading = false;
      hideLoadingIndicator();
    });
  }

  function getCurrentFilters() {
    return {
      platform: document.getElementById('platform-filter')?.value || 'all',
      risk: document.getElementById('risk-filter')?.value || 'all',
      sort: document.getElementById('sort-filter')?.value || 'trending',
      trending: document.getElementById('trending-only')?.checked || false,
      search: document.getElementById('search-input')?.value || ''
    };
  }

  function appendCards(cards) {
    const grid = document.getElementById('analytics-grid');
    cards.forEach(card => {
      const cardElement = createCardElement(card);
      grid.appendChild(cardElement);
    });
  }

  function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'loading-indicator';
    indicator.innerHTML = '<div class="loading-spinner"></div><p>Loading more cards...</p>';
    indicator.style.cssText = 'text-align: center; padding: 2rem; color: var(--text-muted);';

    const container = document.querySelector('.analytics-content .container');
    container.appendChild(indicator);
  }

  function hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Intersection Observer for infinite scroll
  const sentinel = document.createElement('div');
  sentinel.id = 'scroll-sentinel';
  document.querySelector('.analytics-content .container').appendChild(sentinel);

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMoreCards();
    }
  }, { threshold: 0.1 });

  observer.observe(sentinel);
}

// Event tracking
function trackEvent(eventName, data) {
  // This would integrate with analytics service like Google Analytics
  console.log('📊 Event tracked:', eventName, data);

  // Example integration:
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', eventName, data);
  // }
}

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('📱 Service Worker registered'))
      .catch(() => console.log('❌ Service Worker registration failed'));
  });
}

// CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .tooltip {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
