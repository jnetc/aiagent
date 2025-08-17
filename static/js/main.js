// Enhanced JavaScript functionality for Zora AI Agent
// File: static/js/main.js

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

  // Initialize tooltips
  initializeTooltips();

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput && !searchInput.disabled) {
        searchInput.focus();
      }
    }

    // Escape to clear search
    if (e.key === 'Escape') {
      const searchInput = document.getElementById('search-input');
      if (searchInput && searchInput === document.activeElement) {
        searchInput.value = '';
        searchInput.blur();
        // Trigger filter update if function exists
        if (typeof applyFilters === 'function') {
          applyFilters();
        }
      }
    }
  });
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
      .catch(() => console.log('⚠ Service Worker registration failed'));
  });
}

// Utility functions for data handling
window.utils = {
  // Format numbers with appropriate suffixes
  formatNumber: function(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Format currency
  formatCurrency: function(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Format date
  formatDate: function(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  },

  // Debounce function for search inputs
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll events
  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Check if user is on mobile
  isMobile: function() {
    return window.innerWidth <= 768;
  },

  // Get URL parameters
  getURLParam: function(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Update URL without page reload
  updateURL: function(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.replaceState({}, '', url);
  }
};

// Global error handler
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);

  // Only show user-friendly errors in production
  if (process?.env?.NODE_ENV === 'production') {
    showToast('Something went wrong. Please try again.', 'error');
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);

  if (process?.env?.NODE_ENV === 'production') {
    showToast('Network error. Please check your connection.', 'error');
  }
});

// CSS for animations (if not already included)
if (!document.querySelector('#main-animations')) {
  const style = document.createElement('style');
  style.id = 'main-animations';
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

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
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

    /* Fade in animation for cards */
    .analytics-card {
      animation: fadeInUp 0.5s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}
