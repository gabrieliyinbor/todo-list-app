document.addEventListener('DOMContentLoaded', () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const taskBeingEdited = JSON.parse(localStorage.getItem('taskBeingEdited'));

    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', loginUser);
    }

    if (document.getElementById('signupForm')) {
        document.getElementById('signupForm').addEventListener('submit', signUpUser);
    }

    if (document.getElementById('taskForm')) {
        document.getElementById('taskForm').addEventListener('submit', addOrUpdateTask);
        document.getElementById('logout').addEventListener('click', logoutUser);
        renderTasks();
        if (taskBeingEdited) {
            populateTaskForm(taskBeingEdited);
        }
    }

    function validateInput(input) {
        return input && input.trim() !== '';
    }

    function validateDate(date) {
        const parsedDate = Date.parse(date);
        if (isNaN(parsedDate)) {
            return false;
        }
        const dateObj = new Date(date);
        const currentYear = new Date().getFullYear();
        const year = dateObj.getFullYear();
        return year >= currentYear && year <= currentYear + 100;
    }

    function showValidationError(element, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerText = message;
        element.classList.add('error');
        element.parentElement.appendChild(errorElement);
    }

    function clearValidationErrors() {
        const errors = document.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
        const errorFields = document.querySelectorAll('.error');
        errorFields.forEach(field => field.classList.remove('error'));
    }

    function loginUser(event) {
        event.preventDefault();
        clearValidationErrors();

        const username = document.getElementById('username');
        const password = document.getElementById('password');

        if (!validateInput(username.value)) {
            showValidationError(username, 'Username cannot be empty or spaces.');
        }

        if (!validateInput(password.value)) {
            showValidationError(password, 'Password cannot be empty or spaces.');
        }

        if (document.querySelectorAll('.error').length > 0) {
            return;
        }

        const user = users.find(user => user.username === username.value && user.password === password.value);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'todo.html';
        } else {
            alert('Invalid username or password');
        }
    }

    function signUpUser(event) {
        event.preventDefault();
        clearValidationErrors();

        const username = document.getElementById('username');
        const password = document.getElementById('password');

        if (!validateInput(username.value)) {
            showValidationError(username, 'Username cannot be empty or spaces.');
        } else if (username.value.length < 3) {
            showValidationError(username, 'Username must be at least 3 characters long.');
        }

        if (!validateInput(password.value)) {
            showValidationError(password, 'Password cannot be empty or spaces.');
        } else if (password.value.length < 6) {
            showValidationError(password, 'Password must be at least 6 characters long.');
        }

        if (document.querySelectorAll('.error').length > 0) {
            return;
        }

        const user = { username: username.value, password: password.value };
        if (users.find(user => user.username === username.value)) {
            alert('Username already exists');
            return;
        }

        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'todo.html';
    }

    function logoutUser() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    function addOrUpdateTask(event) {
        event.preventDefault();
        clearValidationErrors();

        const taskName = document.getElementById('taskName');
        const description = document.getElementById('description');
        const priority = document.getElementById('priority');
        const tags = document.getElementById('tags');
        const dueDate = document.getElementById('dueDate');

        if (!validateInput(taskName.value)) {
            showValidationError(taskName, 'Task name cannot be empty or spaces.');
        }

        if (!validateInput(description.value)) {
            showValidationError(description, 'Description cannot be empty or spaces.');
        }

        if (!validateDate(dueDate.value)) {
            showValidationError(dueDate, 'Please enter a valid date.');
        }

        if (document.querySelectorAll('.error').length > 0) {
            return;
        }

        const task = {
            id: taskBeingEdited ? taskBeingEdited.id : Date.now(),
            user: currentUser.username,
            taskName: taskName.value,
            description: description.value,
            priority: priority.value,
            tags: tags.value,
            dueDate: dueDate.value,
            completed: taskBeingEdited ? taskBeingEdited.completed : false
        };

        if (taskBeingEdited) {
            const index = tasks.findIndex(t => t.id === taskBeingEdited.id);
            tasks[index] = task;
            localStorage.removeItem('taskBeingEdited');
        } else {
            tasks.push(task);
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        document.getElementById('taskForm').reset();
    }

    function renderTasks(filteredTasks = null) {
        const taskList = document.getElementById('tasks');
        taskList.innerHTML = '';
        const userTasks = filteredTasks || tasks.filter(task => task.user === currentUser.username);

        if (userTasks.length === 0) {
            taskList.innerHTML = '<div class="no-tasks">No tasks available.</div>';
            return;
        }

        userTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `
                <div class="task-details">
                    <span>${task.taskName} - ${task.priority}</span>
                    <span>${task.description}</span>
                    <span>${task.tags}</span>
                    <span>Due: ${task.dueDate}</span>
                </div>
                <div class="task-actions">
                    <button class="btn btn-success" onclick="markTaskCompleted(${task.id})">Complete</button>
                    <button class="btn btn-primary" onclick="editTask(${task.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    window.markTaskCompleted = function (taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = true;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    };

    window.editTask = function (taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            populateTaskForm(task);
            localStorage.setItem('taskBeingEdited', JSON.stringify(task));
        }
    };

    function populateTaskForm(task) {
        document.getElementById('taskName').value = task.taskName;
        document.getElementById('description').value = task.description;
        document.getElementById('priority').value = task.priority;
        document.getElementById('tags').value = task.tags;
        document.getElementById('dueDate').value = task.dueDate;
    }

    window.deleteTask = function (taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex > -1) {
            tasks.splice(taskIndex, 1);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    };

    window.applyFilters = function () {
        const filterTag = document.getElementById('filterTag').value.toLowerCase();
        const filterPriority = document.getElementById('filterPriority').value;
        const filterStartDate = document.getElementById('filterStartDate').value;
        const filterEndDate = document.getElementById('filterEndDate').value;

        let filteredTasks = tasks.filter(task => task.user === currentUser.username);

        if (filterTag) {
            filteredTasks = filteredTasks.filter(task => task.tags.toLowerCase().includes(filterTag));
        }

        if (filterPriority) {
            filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
        }

        if (filterStartDate) {
            filteredTasks = filteredTasks.filter(task => new Date(task.dueDate) >= new Date(filterStartDate));
        }

        if (filterEndDate) {
            filteredTasks = filteredTasks.filter(task => new Date(task.dueDate) <= new Date(filterEndDate));
        }

        renderTasks(filteredTasks);
    };
});
