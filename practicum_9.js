// Send alert: slides in a notification, then hides it after 3 seconds
const notifyBtn = document.getElementById('btn-notify');
const notification = document.getElementById('notification');
let notifyTimer;

notifyBtn.addEventListener('click', function () {
    notification.classList.add('show');
    clearTimeout(notifyTimer);
    notifyTimer = setTimeout(function () {
        notification.classList.remove('show');
    }, 3000);
});

// Show / hide device details: toggles the open class on the info card
const toggleBtn = document.getElementById('btn-toggle-card');
const deviceCard = document.getElementById('device-card');

toggleBtn.addEventListener('click', function () {
    const isOpen = deviceCard.classList.toggle('open');
    toggleBtn.textContent = isOpen ? 'Hide sensor details' : 'Show sensor details';
    toggleBtn.setAttribute('aria-expanded', isOpen);
});

// Ping sensor: plays a short animation on the status dot, then resets the text
const pingBtn = document.getElementById('btn-ping');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

pingBtn.addEventListener('click', function () {
    statusDot.classList.add('ping');
    statusText.textContent = 'Ping sent';

    setTimeout(function () {
        statusDot.classList.remove('ping');
    }, 600);

    setTimeout(function () {
        statusText.textContent = 'Online';
    }, 1500);
});
