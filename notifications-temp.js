// Professional Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    notification.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function showConfirmDialog(title, message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <img src="https://api.iconify.design/mdi:close.svg?color=%23a0a0a0" width="24" height="24" alt="Close">
                </button>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">${message}</p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button class="btn" id="cancelBtn" style="background: #6c757d;">Cancel</button>
                    <button class="btn btn-primary" id="confirmBtn">Confirm</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#confirmBtn').onclick = () => {
        modal.remove();
        if (onConfirm) onConfirm();
    };
    
    modal.querySelector('#cancelBtn').onclick = () => {
        modal.remove();
        if (onCancel) onCancel();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    };
}
