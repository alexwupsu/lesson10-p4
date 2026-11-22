const setup = document.getElementById("setup");
const finishedPage = document.getElementById("finished-page");
const customizeForm = document.getElementById("customize-form");
const nameInput = document.getElementById("name-input");
const messageInput = document.getElementById("message-input");
const backgroundSelect = document.getElementById("background-select");
const greeting = document.getElementById("greeting");
const message = document.getElementById("message");
const backButton = document.getElementById("back-button");
const nextButton = document.getElementById("next-button");
const setupError = document.getElementById("setup-error");
let currentStep = 0;


function showStep() {
  for (let i = 0; i < 4; i++) {
    document.getElementById("step-" + i).hidden = i !== currentStep;
    const progressItem = document.getElementById("progress-" + i);
    progressItem.removeAttribute("aria-current");

    if (i === currentStep) {
      progressItem.className = "current";
      progressItem.setAttribute("aria-current", "step");
    } else if (i < currentStep) {
      progressItem.className = "complete";
    } else {
      progressItem.className = "";
    }
  }

  document.getElementById("step-count").textContent = "STEP " + (currentStep + 1) + " OF 4";
  backButton.hidden = currentStep === 0;
  nextButton.textContent = currentStep === 3 ? "Finish setup" : "Continue";
  setupError.textContent = "";
  nameInput.removeAttribute("aria-invalid");
  messageInput.removeAttribute("aria-invalid");

  if (currentStep === 3) {
    document.getElementById("review-greeting").textContent = "Hello " + nameInput.value.trim() + "!";
    document.getElementById("review-message").textContent = messageInput.value.trim();
    document.getElementById("review-color").textContent = backgroundSelect.options[backgroundSelect.selectedIndex].text;
  }

  document.getElementById("title-" + currentStep).focus();
}

customizeForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (currentStep === 0 && nameInput.value.trim() === "") {
    setupError.textContent = "Enter your name to continue.";
    nameInput.setAttribute("aria-invalid", "true");
    nameInput.focus();
    return;
  }

  if (currentStep === 1 && messageInput.value.trim() === "") {
    setupError.textContent = "Enter a message to continue.";
    messageInput.setAttribute("aria-invalid", "true");
    messageInput.focus();
    return;
  }

  if (currentStep < 3) {
    currentStep++;
    showStep();
    return;
  }

  
  greeting.textContent = "Hello " + nameInput.value.trim() + "!";
  message.textContent = messageInput.value.trim();
  document.body.style.backgroundColor = backgroundSelect.value;
  setup.hidden = true;
  finishedPage.hidden = false;
  greeting.focus();
});

backButton.addEventListener("click", function () {
  if (currentStep > 0) {
    currentStep--;
    showStep();
  }
});


backgroundSelect.addEventListener("change", function () {
  document.getElementById("color-swatch").style.backgroundColor = backgroundSelect.value;
  document.getElementById("color-name").textContent = backgroundSelect.options[backgroundSelect.selectedIndex].text;
});

document.getElementById("edit-button").addEventListener("click", function () {
  finishedPage.hidden = true;
  setup.hidden = false;
  document.body.style.backgroundColor = "#edf3ee";
  currentStep = 0;
  showStep();
});

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const emptyList = document.getElementById("empty-list");
const todoError = document.getElementById("todo-error");


todoForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const task = todoInput.value.trim();

  if (task === "") {
    todoError.textContent = "Enter a to-do before adding it.";
    todoInput.setAttribute("aria-invalid", "true");
    todoInput.focus();
    return;
  }

  const listItem = document.createElement("li");
  listItem.textContent = task;
  todoList.appendChild(listItem);
  emptyList.hidden = true;
  todoError.textContent = "";
  todoInput.removeAttribute("aria-invalid");
  todoInput.value = "";
  todoInput.focus();
});
