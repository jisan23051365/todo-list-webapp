/**
 * Todo List App
 * Features: add, edit, delete, toggle complete, localStorage persistence
 */

const STORAGE_KEY = "todo-list-items";

// ── State ──────────────────────────────────────────────────
let todos = loadFromStorage();

// ── DOM refs ───────────────────────────────────────────────
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyMsg = document.getElementById("empty-msg");

// ── Initialise ─────────────────────────────────────────────
renderAll();

// ── Event: add task ────────────────────────────────────────
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
  };

  todos.push(todo);
  saveToStorage();
  renderAll();
  input.value = "";
  input.focus();
});

// ── Render helpers ─────────────────────────────────────────

/** Re-render the entire list from the todos array. */
function renderAll() {
  list.innerHTML = "";

  todos.forEach(function (todo) {
    list.appendChild(createTodoElement(todo));
  });

  emptyMsg.classList.toggle("hidden", todos.length > 0);
}

/**
 * Build a list-item element for one todo.
 * @param {{ id: number, text: string, completed: boolean }} todo
 * @returns {HTMLLIElement}
 */
function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = todo.id;

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", "Mark task as complete");
  checkbox.addEventListener("change", function () {
    toggleComplete(todo.id);
  });

  // Text span
  const span = document.createElement("span");
  span.className = "todo-text" + (todo.completed ? " completed" : "");
  span.textContent = todo.text;

  // Actions wrapper
  const actions = document.createElement("div");
  actions.className = "todo-actions";

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-edit";
  editBtn.textContent = "Edit";
  editBtn.setAttribute("aria-label", "Edit task");
  editBtn.addEventListener("click", function () {
    startEditing(li, todo);
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-delete";
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute("aria-label", "Delete task");
  deleteBtn.addEventListener("click", function () {
    deleteTodo(todo.id);
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(actions);

  return li;
}

// ── CRUD operations ────────────────────────────────────────

/** Toggle the completed state of a todo. */
function toggleComplete(id) {
  todos = todos.map(function (t) {
    return t.id === id ? Object.assign({}, t, { completed: !t.completed }) : t;
  });
  saveToStorage();
  renderAll();
}

/**
 * Replace the text span + edit button with an inline edit input + save button.
 * @param {HTMLLIElement} li
 * @param {{ id: number, text: string, completed: boolean }} todo
 */
function startEditing(li, todo) {
  const span = li.querySelector(".todo-text");
  const actions = li.querySelector(".todo-actions");

  // Replace span with input
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-edit-input";
  editInput.value = todo.text;
  editInput.maxLength = 200;
  editInput.setAttribute("aria-label", "Edit task text");
  li.replaceChild(editInput, span);

  // Replace action buttons with Save button
  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-save";
  saveBtn.textContent = "Save";
  saveBtn.setAttribute("aria-label", "Save task");

  actions.innerHTML = "";
  actions.appendChild(saveBtn);

  editInput.focus();
  editInput.select();

  function commitEdit() {
    const newText = editInput.value.trim();
    if (!newText) {
      editInput.focus();
      return;
    }
    todos = todos.map(function (t) {
      return t.id === todo.id ? Object.assign({}, t, { text: newText }) : t;
    });
    saveToStorage();
    renderAll();
  }

  saveBtn.addEventListener("click", commitEdit);
  editInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") renderAll(); // cancel editing
  });
}

/** Remove a todo by id. */
function deleteTodo(id) {
  todos = todos.filter(function (t) {
    return t.id !== id;
  });
  saveToStorage();
  renderAll();
}

// ── localStorage helpers ───────────────────────────────────

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    // Storage unavailable – continue without persistence
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each entry
    return parsed.filter(function (item) {
      return (
        item &&
        typeof item.id === "number" &&
        typeof item.text === "string" &&
        typeof item.completed === "boolean"
      );
    });
  } catch (e) {
    return [];
  }
}
