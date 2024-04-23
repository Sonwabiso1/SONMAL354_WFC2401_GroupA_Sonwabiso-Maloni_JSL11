// TASK: import helper functions from utils
// Import the functions from taskFunction.js
import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask
} from './utils/taskFunction.js';
import initialData from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
// Selecting elements from the DOM and storing them in an object
const elements = {
  sideBarDiv: document.getElementById('side-bar-div'),
  logo: document.getElementById('logo'),
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
  switchInput: document.getElementById('switch'),
  labelCheckboxTheme: document.getElementById('label-checkbox-theme'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  headerBoardName: document.getElementById('header-board-name'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  deleteBoardBtn: document.getElementById('deleteBoardBtn'),
  todoTasksContainer: document.querySelector('.column-div[data-status="todo"] .tasks-container'),
  doingTasksContainer: document.querySelector('.column-div[data-status="doing"] .tasks-container'),
  doneTasksContainer: document.querySelector('.column-div[data-status="done"] .tasks-container'),
  newTaskModalWindow: document.getElementById('new-task-modal-window'),
  newTaskTitleInput: document.getElementById('title-input'),
  newTaskDescInput: document.getElementById('desc-input'),
  newTaskSelectStatus: document.getElementById('select-status'),
  editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editTaskSelectStatus: document.getElementById('edit-select-status')
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
  const boardsContainer = elements.boardsNavLinksDiv;
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
  const filteredTasks = tasks.filter(task => task.board = boardName);

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

    filteredTasks.filter(task => task.status = status).forEach(task => { 
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
  document.querySelectorAll('.edit-board-btn').foreach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.add('active') 
    }
    else {
      btn.remove('active'); 
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
  elements.createNewTaskBtn.addEventListener('click', () => {
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
 
}

function toggleTheme() {
 
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  

  // Get button elements from the task modal


  // Call saveTaskChanges upon click of Save Changes button
 

  // Delete task using a helper function and close the task modal


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  

  // Create an object with the updated task details


  // Update task using a hlper functoin
 

  // Close the modal and refresh the UI to reflect the changes

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}