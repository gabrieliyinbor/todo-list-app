document.addEventListener('DOMContentLoaded', () => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', loginUser);
    }

    if (document.getElementById('signupForm')) {
        document.getElementById('signupForm').addEventListener('submit', signUpUser);
    }

    if (document.getElementById('taskForm')) {
        document.getElementById('taskForm').addEventListener('submit', addTask);
        document.getElementById('logout').addEventListener('click', logoutUser);
        renderTasks();
    }

    function validateInput(input) {
        if (!input || input.trim() === '') {
            return false;
        }
        return true;
    }

    function validateDate(date) {
        const parsedDate = Date.parse(date);
        return !isNaN(parsedDate);
    }

    function loginUser(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!validateInput(username) || !validateInput(password)) {
            alert('Fields cannot be empty or contain only spaces.');
            return;
        }

        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'todo.html';
        } else {
            alert('Invalid username or password');
        }
    }

    function signUpUser(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!validateInput(username) || !validateInput(password)) {
            alert('Fields cannot be empty or contain only spaces.');
            return;
        }

        if (username.length < 3) {
            alert('Username must be at least 3 characters long.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        const user = { username, password };
        if (users.find(user => user.username === username)) {
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

    function addTask(event) {
        event.preventDefault();
        const taskName = document.getElementById('taskName').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;
        const tags = document.getElementById('tags').value;
        const dueDate = document.getElementById('dueDate').value;
        
        if (!validateInput(taskName) || !validateInput(description) || !validateDate(dueDate)) {
            alert('Please fill in all fields correctly.');
            return;
        }

        const task = {
            id: Date.now(),
            user: currentUser.username,
            taskName,
            description,
            priority,
            tags,
            dueDate,
            completed: false
        };
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
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
            document.getElementById('taskName').value = task.taskName;
            document.getElementById('description').value = task.description;
            document.getElementById('priority').value = task.priority;
            document.getElementById('tags').value = task.tags;
            document.getElementById('dueDate').value = task.dueDate;
            deleteTask(taskId);
        }
    };

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
