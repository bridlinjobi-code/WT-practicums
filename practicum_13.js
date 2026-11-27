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

// ===== API data management (fetch, async/await, try/catch/finally) =====
const PARTNER_API_URL = 'https://jsonplaceholder.typicode.com/users';
const loadBtn = document.getElementById('btn-load');
const retryBtn = document.getElementById('btn-retry');
const loader = document.getElementById('loader');
const partnerError = document.getElementById('partner-error');
const partnerErrorText = document.getElementById('partner-error-text');
const partnerBody = document.getElementById('partner-body');
const partnerEmpty = document.getElementById('partner-empty');
const partnerCount = document.getElementById('partner-count');
const partnerUpdated = document.getElementById('partner-updated');

// Shows the loading indicator and disables the buttons while a request is running
function setLoading(isLoading) {
    loader.classList.toggle('hidden', !isLoading);
    loadBtn.disabled = isLoading;
    retryBtn.disabled = isLoading;
}

function showPartnerError(message) {
    partnerErrorText.textContent = message;
    partnerError.classList.remove('hidden');
}

function clearPartnerError() {
    partnerErrorText.textContent = '';
    partnerError.classList.add('hidden');
}

// Builds one table row per record using createElement(), textContent and appendChild()
function renderPartners(partners) {
    partnerBody.textContent = '';

    partners.forEach(function (partner) {
        const row = document.createElement('tr');
        const values = [
            partner.name,
            partner.company?.name ?? '-',
            partner.address?.city ?? '-',
            partner.email,
            partner.phone
        ];

        values.forEach(function (value) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });

        partnerBody.appendChild(row);
    });

    partnerCount.textContent = partners.length;
    partnerUpdated.textContent = new Date().toLocaleTimeString();
    partnerEmpty.classList.toggle('hidden', partners.length > 0);
}

// Fetches the data, handles HTTP and network errors, and always hides the loader at the end
async function loadPartners() {
    setLoading(true);
    clearPartnerError();

    try {
        const response = await fetch(PARTNER_API_URL);

        if (!response.ok) {
            throw new Error('The server responded with status ' + response.status + '.');
        }

        const partners = await response.json();
        renderPartners(partners);
    } catch (error) {
        showPartnerError('Could not load partner data. Check your connection and try again. (' + error.message + ')');
    } finally {
        setLoading(false);
    }
}

loadBtn.addEventListener('click', loadPartners);
retryBtn.addEventListener('click', loadPartners);

// Load the data when the page opens
loadPartners();

// ===== Task manager (CRUD with localStorage) =====
const TASK_STORAGE_KEY = 'smart-agri-task-manager';
const STATUS_LABELS = { todo: 'To do', progress: 'In progress', done: 'Done' };

const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskStatus = document.getElementById('task-status');
const saveTaskBtn = document.getElementById('btn-save-task');
const cancelEditBtn = document.getElementById('btn-cancel-edit');
const taskMessage = document.getElementById('task-message');
const taskBody = document.getElementById('task-body');
const taskEmpty = document.getElementById('task-empty');
const countTodo = document.getElementById('count-todo');
const countProgress = document.getElementById('count-progress');
const countDone = document.getElementById('count-done');

let tasks = [];
let editingId = null;
let taskMessageTimer;

// Reads saved tasks from Local Storage, or starts with two sample tasks the first time
function loadTasks() {
    const saved = localStorage.getItem(TASK_STORAGE_KEY);

    if (saved === null) {
        return [
            { id: Date.now(), title: 'Calibrate soil moisture sensor', description: 'Check the North Field sensor against a manual soil moisture test.', status: 'todo' },
            { id: Date.now() + 1, title: 'Update field gateway firmware', description: 'Install the latest firmware on the field gateway.', status: 'progress' }
        ];
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        return [];
    }
}

// Writes the current task list to Local Storage
function saveTasks() {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

function showTaskMessage(text) {
    taskMessage.textContent = text;
    clearTimeout(taskMessageTimer);
    taskMessageTimer = setTimeout(function () {
        taskMessage.textContent = '';
    }, 3000);
}

// Clears the form and returns it to "add" mode
function resetTaskForm() {
    taskForm.reset();
    editingId = null;
    saveTaskBtn.textContent = 'Add task';
    cancelEditBtn.classList.add('hidden');
}

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

// Builds the status dropdown inside a row (update)
function createStatusSelect(task) {
    const select = document.createElement('select');
    select.className = 'task-status-select';
    select.setAttribute('aria-label', 'Status for ' + task.title);

    Object.keys(STATUS_LABELS).forEach(function (value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = STATUS_LABELS[value];
        option.selected = task.status === value;
        select.appendChild(option);
    });

    select.addEventListener('change', function () {
        updateTaskStatus(task.id, select.value);
    });

    return select;
}

// Builds the Edit and Delete buttons inside a row
function createActionButtons(task) {
    const wrapper = document.createElement('div');
    wrapper.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () {
        startEditing(task.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function () {
        deleteTask(task.id);
    });

    wrapper.appendChild(editBtn);
    wrapper.appendChild(deleteBtn);
    return wrapper;
}

// Read: redraws the table and summary from the tasks array
function renderTasks() {
    taskBody.querySelectorAll('tr').forEach(function (row) {
        row.remove();
    });

    tasks.forEach(function (task) {
        const row = document.createElement('tr');
        row.className = 'task-row status-' + task.status;
        row.classList.toggle('is-editing', task.id === editingId);

        const statusCell = document.createElement('td');
        statusCell.appendChild(createStatusSelect(task));

        const actionCell = document.createElement('td');
        actionCell.appendChild(createActionButtons(task));

        row.appendChild(createCell(task.title));
        row.appendChild(createCell(task.description || '-'));
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        taskBody.appendChild(row);
    });

    countTodo.textContent = tasks.filter(function (t) { return t.status === 'todo'; }).length;
    countProgress.textContent = tasks.filter(function (t) { return t.status === 'progress'; }).length;
    countDone.textContent = tasks.filter(function (t) { return t.status === 'done'; }).length;
    taskEmpty.classList.toggle('hidden', tasks.length > 0);
}

// Create: adds a new task to the array with push(), then saves and redraws
function addTask(title, description, status) {
    tasks.push({
        id: Date.now(),
        title: title,
        description: description,
        status: status
    });
    saveTasks();
    renderTasks();
    showTaskMessage('Task added.');
}

// Update: finds a task with find() and changes its fields
function updateTask(id, title, description, status) {
    const task = tasks.find(function (t) { return t.id === id; });
    if (!task) {
        return;
    }
    task.title = title;
    task.description = description;
    task.status = status;
    saveTasks();
    renderTasks();
    showTaskMessage('Task updated.');
}

// Update: changes only the status from the row dropdown
function updateTaskStatus(id, status) {
    const task = tasks.find(function (t) { return t.id === id; });
    if (!task) {
        return;
    }
    task.status = status;
    saveTasks();
    renderTasks();
    showTaskMessage('Status changed to ' + STATUS_LABELS[status] + '.');
}

// Edit: loads the chosen task into the form
function startEditing(id) {
    const task = tasks.find(function (t) { return t.id === id; });
    if (!task) {
        return;
    }
    editingId = id;
    taskTitle.value = task.title;
    taskDescription.value = task.description;
    taskStatus.value = task.status;
    saveTaskBtn.textContent = 'Save changes';
    cancelEditBtn.classList.remove('hidden');
    taskTitle.focus();
    renderTasks();
}

// Delete: removes the task with filter(), then saves and redraws
function deleteTask(id) {
    const task = tasks.find(function (t) { return t.id === id; });
    if (!task) {
        return;
    }
    tasks = tasks.filter(function (t) { return t.id !== id; });
    if (editingId === id) {
        resetTaskForm();
    }
    saveTasks();
    renderTasks();
    showTaskMessage('Deleted "' + task.title + '".');
}

taskForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const status = taskStatus.value;

    if (title === '') {
        showTaskMessage('Please enter a task title.');
        taskTitle.focus();
        return;
    }

    if (editingId === null) {
        addTask(title, description, status);
    } else {
        updateTask(editingId, title, description, status);
    }

    resetTaskForm();
});

cancelEditBtn.addEventListener('click', function () {
    resetTaskForm();
    renderTasks();
});

// Start: load tasks from Local Storage and draw them
tasks = loadTasks();
saveTasks();
renderTasks();

// ===== Form validation =====
const requestForm = document.getElementById('request-form');
const successMsg = document.getElementById('form-success');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');
const fileInput = document.getElementById('document');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
let submitAttempted = false;

// Clear, friendly messages for the rules that need more explanation
const friendlyMessages = {
    'full-name': 'Use 2 to 60 letters. Numbers are not allowed.',
    'phone': 'Enter exactly 10 digits, with no spaces or symbols.',
    'password': 'Use at least 8 characters, including a letter and a number.',
    'age': 'Age must be between 18 and 120.',
    'farm-size': 'Enter a farm size between 0.5 and 5000 acres.',
    'details': 'Please enter between 10 and 500 characters.',
    'document': 'Upload a PDF, JPG, or PNG file no larger than 5 MB.'
};

// All radio buttons in a group share one error message
function getErrorElement(field) {
    const id = field.type === 'radio' ? 'org-type-error' : field.id + '-error';
    return document.getElementById(id);
}

function getErrorText(field) {
    if (field.validity.customError) {
        return field.validationMessage;
    }
    if (field.validity.valueMissing) {
        return 'This field is required.';
    }
    if (friendlyMessages[field.id]) {
        return friendlyMessages[field.id];
    }
    return field.validationMessage;
}

// Checks one field, applies custom rules with setCustomValidity(), and shows or clears its error
function validateField(field) {
    field.setCustomValidity('');

    if (field === confirmInput && confirmInput.value !== passwordInput.value) {
        field.setCustomValidity('Passwords do not match.');
    }

    if (field === fileInput && fileInput.files.length > 0 && fileInput.files[0].size > MAX_FILE_SIZE) {
        field.setCustomValidity('File is too large.');
    }

    const isValid = field.checkValidity();
    const errorEl = getErrorElement(field);

    if (errorEl) {
        errorEl.textContent = isValid ? '' : getErrorText(field);
    }
    field.setAttribute('aria-invalid', String(!isValid));
    return isValid;
}

// Checks every field, skipping the second and later radio buttons in each group
function validateAllFields() {
    const checkedGroups = [];

    requestForm.querySelectorAll('input, select, textarea').forEach(function (field) {
        if (field.type === 'radio') {
            if (checkedGroups.includes(field.name)) {
                return;
            }
            checkedGroups.push(field.name);
        }
        validateField(field);
    });
}

// Submit: stop the page reload, validate, then show either the errors or the success message
requestForm.addEventListener('submit', function (event) {
    event.preventDefault();

    submitAttempted = true;
    requestForm.classList.add('was-submitted');
    successMsg.classList.add('hidden');

    validateAllFields();

    if (!requestForm.checkValidity()) {
        requestForm.reportValidity();
        const firstInvalid = requestForm.querySelector(':invalid');
        if (firstInvalid) {
            firstInvalid.focus();
        }
        return;
    }

    requestForm.reset();
    successMsg.classList.remove('hidden');
    successMsg.focus();
});

// After the first submit attempt, fields are re-checked as the user types or changes an answer
['input', 'change'].forEach(function (eventName) {
    requestForm.addEventListener(eventName, function (event) {
        successMsg.classList.add('hidden');

        if (submitAttempted) {
            validateField(event.target);
            if (event.target === passwordInput) {
                validateField(confirmInput);
            }
        }
    });
});

// Clear form: remove all error messages and reset the validation state
requestForm.addEventListener('reset', function () {
    submitAttempted = false;
    requestForm.classList.remove('was-submitted');
    successMsg.classList.add('hidden');
    requestForm.querySelectorAll('.error-message').forEach(function (el) {
        el.textContent = '';
    });
});
