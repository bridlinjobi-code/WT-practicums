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

// ===== Dynamic device manager (DOM manipulation) =====
const deviceInput = document.getElementById('device-input');
const addDeviceBtn = document.getElementById('btn-add-device');
const deviceList = document.getElementById('device-list');
const deviceCount = document.getElementById('device-count');
const emptyMessage = document.getElementById('empty-message');
const deviceMessage = document.getElementById('device-message');
let deviceMessageTimer;

// Shows a short feedback message, then clears it
function showDeviceMessage(text) {
    deviceMessage.textContent = text;
    clearTimeout(deviceMessageTimer);
    deviceMessageTimer = setTimeout(function () {
        deviceMessage.textContent = '';
    }, 3000);
}

// Updates the total count and shows or hides the empty-state message
function updateDeviceSummary() {
    const total = deviceList.querySelectorAll('li').length;
    deviceCount.textContent = total;
    emptyMessage.classList.toggle('hidden', total > 0);
}

// Creates a new list item with createElement, fills it with innerHTML, and adds it with appendChild
function createDevice(name) {
    const item = document.createElement('li');
    item.className = 'device-item';
    item.setAttribute('data-status', 'online');

    item.innerHTML =
        '<span class="device-name"></span>' +
        '<span class="device-status"></span>' +
        '<div class="device-actions">' +
            '<button type="button" class="btn-toggle">Toggle status</button>' +
            '<button type="button" class="btn-remove">Remove</button>' +
        '</div>';

    item.querySelector('.device-name').textContent = name;
    item.querySelector('.device-status').textContent = 'Online';

    deviceList.appendChild(item);
    updateDeviceSummary();
    return item;
}

// Add a device when the button is clicked or Enter is pressed
addDeviceBtn.addEventListener('click', function () {
    const name = deviceInput.value.trim();

    if (name === '') {
        showDeviceMessage('Please enter a sensor name.');
        deviceInput.focus();
        return;
    }

    createDevice(name);
    deviceInput.value = '';
    showDeviceMessage('Added "' + name + '".');
});

deviceInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addDeviceBtn.click();
    }
});

// One listener on the list handles the buttons of every device item
deviceList.addEventListener('click', function (event) {
    const item = event.target.closest('li');
    if (!item) {
        return;
    }

    // Modify: switch the device between online and offline
    if (event.target.classList.contains('btn-toggle')) {
        const isOnline = item.getAttribute('data-status') === 'online';
        item.setAttribute('data-status', isOnline ? 'offline' : 'online');
        item.querySelector('.device-status').textContent = isOnline ? 'Offline' : 'Online';
        item.classList.toggle('is-offline', isOnline);
    }

    // Remove: delete the device from the list
    if (event.target.classList.contains('btn-remove')) {
        const name = item.querySelector('.device-name').textContent;
        item.remove();
        updateDeviceSummary();
        showDeviceMessage('Removed "' + name + '".');
    }
});

// Starting devices so the list is not empty on first load
createDevice('Soil Moisture Sensor 02');
createDevice('Irrigation Valve 01');
