/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - Raw text to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHtml(text) {
  if (!text) return '';
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char]);
}

/**
 * Formats a date object to Spanish locale string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('es-ES');
}

/**
 * Shows a notification banner
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
export function showNotification(message, type) {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

  notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in`;
  notification.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Shows a success notification
 * @param {string} message - Message to display
 */
export function showSuccess(message) {
  showNotification(message, 'success');
}

/**
 * Shows an error notification
 * @param {string} message - Message to display
 */
export function showError(message) {
  showNotification(message, 'error');
}
