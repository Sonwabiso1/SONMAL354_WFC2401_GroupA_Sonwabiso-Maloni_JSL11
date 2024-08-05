// TASK: import helper functions from utils
// Import the functions from taskFunction.js
import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask
} from './utils/taskFunctions.js';
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  const tasks = JSON.parse(localStorage.getItem('tasks'));
  if (!tasks || tasks.length === 0) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true');
    console.log('Data initialized in localStorage');
  } else {
    console.log('Data already exists in localStorage');
    console.log(tasks);
  }
}


// TASK: Get elements from the DOM
// Selecting elements from the DOM and storing them in an object
const elements = {
  // Navigation Sidebar elements
  sideBar: document.querySelector(".side-bar"),
  logo: document.getElementById("logo"),
  boardsNavLinks: document.getElementById("boards-nav-links-div"),
  themeSwitch: document.getElementById("switch"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),

  // Header
  headerBoardName: document.getElementById("header-board-name"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),

  // Task Columns
  columnDivs: document.querySelectorAll(".column-div"),
  filterDiv: document.getElementById("filterDiv"),

  // New Task Modal
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  selectStatus: document.getElementById("select-status"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  newTaskModal: document.getElementById("new-task-modal-window"),
  modalWindow: document.getElementById("new-task-modal-window"),

  // Edit Task Modal
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),

  // Filter
  filterDiv: document.getElementById("filterDiv"),
};


let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
// Function to fetch tasks, extract unique board names, and display them along with tasks for the active board
function fetchAndDisplayBoardsAndTasks() {
  // Retrieve all tasks (assuming from a local storage or a similar service)
  const tasks = getTasks();

  // Extract unique board names from the tasks, filtering out any undefined or null values
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];

  // Display these boards as buttons in the UI
  displayBoards(boards);

  // Check if there are any boards available
  if (boards.length > 0) {
    // Attempt to retrieve the 'activeBoard' from local storage to maintain state across sessions
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));

    // Determine the active board; prefer the stored value, otherwise default to the first board
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];

    // Display the active board name in the UI
    elements.headerBoardName.textContent = activeBoard;

    // Apply specific styles and adjustments for the active board
    styleActiveBoard(activeBoard);

    // Refresh the task display UI, filtering tasks to only show those for the active board
    refreshTasksUI();
  }
}


// Creates different boards in the DOM
// TASK: Fix Bugs
// Function to display all the boards as buttons in the sidebar navigation
function displayBoards(boards) {
  // Access the container element for the boards
  const boardsContainer = elements.boardsNavLinks;
  // Clear the existing content in the boards container to avoid duplicates
  boardsContainer.innerHTML = '';

  // Iterate through each board name provided in the boards array
  boards.forEach(board => {
    // Create a new button element for each board
    const boardElement = document.createElement("button");
    // Set the button text to the board name
    boardElement.textContent = board; 

    boardElement.classList.add("board-btn");

    boardElement.addEventListener("click", () => { 

      elements.headerBoardName.textContent = board;  
      // Filter and display tasks associated with the clicked board
      filterAndDisplayTasksByBoard(board);
      // Update the active board variable
      activeBoard = board;
      // Save the new active board to local storage
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      // Apply styling specific to the active board
      styleActiveBoard(activeBoard);
    });
    
    // Append the newly created button to the boards container
    boardsContainer.appendChild(boardElement);
  });
}


// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); // Fix: Use strict equality operator (===) instead of assignment operator (=)

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { // Fix: Use strict equality operator (===) instead of assignment operator (=)
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click",() => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}



function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(); 
}



function setupEventListeners() {
  // Set up event listener to cancel editing a task
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Set up event listener to cancel adding a new task
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Set up event listener to close modal when clicking outside of it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Event listeners for showing and hiding the sidebar
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Event listener for switching themes
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Set up event listener to show the modal for adding a new task
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true, elements.newTaskModal); // Assuming you might want to specify which modal to show
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Set up event listener for the submission of the new task form
  elements.modalWindow.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from submitting traditionally
    addTask(event);
  });
}



// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: elements.titleInput.value,
      description: elements.descInput.value,
      status: elements.selectStatus.value,
      board: activeBoard
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  const sideBar = elements.sideBar;
  const showButton = elements.showSideBarBtn;
  const hideButton = elements.hideSideBarBtn;

  if (show) {
    sideBar.classList.add('show-sidebar');
    showButton.style.display = 'none';
    hideButton.style.display = 'block';
  } else {
    sideBar.classList.remove('show-sidebar');
    showButton.style.display = 'block';
    hideButton.style.display = 'none';
  }
}


function toggleTheme() {
  const isLightTheme = document.body.classList.contains('light-theme');
  
  if (isLightTheme) {
      document.body.classList.remove('light-theme');
      logo.src = './assets/logo-dark.svg'; // Set the src for dark theme
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark'); // Store theme preference in localStorage
  } else {
      document.body.classList.remove('dark-theme');
      logo.src = './assets/logo-light.svg'; // Set the src for light theme
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light'); // Store theme preference in localStorage
  }
}



function openEditTaskModal(task) {
  toggleModal(true, elements.editTaskModal); // Show the edit task modal

  // Set task details in modal inputs
  const titleInput = elements.editTaskTitleInput;
  const descriptionInput = elements.editTaskDescInput;
  const statusInput =   elements.editSelectStatus;

  titleInput.value = task.title;
  descriptionInput.value = task.description;
  statusInput.value = task.status;


  // Get button elements from the task modal
  const saveChangesButton = elements.saveTaskChangesBtn;
  const deleteButton = elements.deleteTaskBtn;


  // Call saveTaskChanges upon click of Save Changes button
  saveChangesButton.addEventListener('click', () => {
    saveTaskChanges(task.id);
    toggleModal(false, elements.editTaskModal); // hide the edit task modal
    refreshTasksUI()
  })

  // Delete task using a helper function and close the task modal

  deleteButton.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal); // hide the edit task modal
    refreshTasksUI();
  })

  
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const titleInput = elements.editTaskTitleInput.value;
  const descriptionInput = elements.editTaskDescInput.value;
  const updatedStatus = document.getElementById('edit-select-status').value;

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: titleInput,
    description: descriptionInput,
    status: updatedStatus,
    board: activeBoard
  };

  // Update task using a helper function
  putTask(taskId, updatedTask);
  
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false); // Hide the modal
  // refreshTasksUI();  Refresh the UI
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  
  // Toggle sidebar based on stored preference
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  
  // Toggle theme based on stored preference or default to light theme
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark') {
      document.body.classList.add('dark-theme');
  } else {
      document.body.classList.remove('dark-theme');
  }
  
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
