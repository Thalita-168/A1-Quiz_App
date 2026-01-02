// Load quizzes list for admin
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("userRole");

  if (isLoggedIn !== "true" || role !== "admin") {
    window.location.href = "/index.html";
  }
});
function loadQuizzesList() {
  const quizzes = JSON.parse(localStorage.getItem(STORAGE.QUIZZES)) || [];
  const container = document.getElementById("quizzesList");

  if (!container) return;

  if (quizzes.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary);">No quizzes created yet.</p>';
    return;
  }

  container.innerHTML = "";
  quizzes.forEach((quiz) => {
    const card = document.createElement("div");
    card.className = "quiz-card";

    // Title
    const title = document.createElement("h3");
    title.textContent = quiz.title;

    // Meta container
    const meta = document.createElement("div");
    meta.className = "quiz-meta";

    const questionsCount = document.createElement("span");
    questionsCount.textContent = quiz.questions.length + " questions";

    const timeLimit = document.createElement("span");
    timeLimit.textContent = quiz.timeLimit + " minutes";

    meta.append(questionsCount, timeLimit);

    // Actions container
    const actions = document.createElement("div");
    actions.className = "quiz-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-quiz-btn";
    editBtn.onclick = function () {
      editQuiz(quiz.id);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-quiz-btn";
    deleteBtn.onclick = function () {
      deleteQuiz(quiz.id);
    };

    actions.append(editBtn, deleteBtn);

    // Add everything to card
    card.append(title, meta, actions);
    container.appendChild(card);
  });
}

// Add Question
function addQuestion() {
  questionCount++;
  const container = document.getElementById("questionsContainer");

  const questionDiv = document.createElement("div");
  questionDiv.className = "question-item";

  /* ================= HEADER ================= */
  const header = document.createElement("div");
  header.className = "question-header";

  const title = document.createElement("span");
  title.textContent = `Question ${questionCount}`;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    questionDiv.remove();
  });

  header.append(title, removeBtn);

  /* ================= QUESTION TYPE ================= */
  const typeGroup = document.createElement("div");
  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Question Type";

  const select = document.createElement("select");
  select.innerHTML = `
        <option value="multiple">Multiple Choice</option>
        <option value="truefalse">True/False</option>
    `;

  typeGroup.append(typeLabel, select);

  /* ================= QUESTION TEXT ================= */
  const textGroup = document.createElement("div");
  const textLabel = document.createElement("label");
  textLabel.textContent = "Question Text";

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Enter your question";

  textGroup.append(textLabel, textarea);

  /* ================= OPTIONS ================= */
  const optionsContainer = document.createElement("div");
  const optionsLabel = document.createElement("label");
  optionsLabel.textContent = "Answer Options";

  const correctLabel = document.createElement("span");
  correctLabel.textContent = "Select the correct answer";

  const addOptionBtn = document.createElement("button");
  addOptionBtn.textContent = "+ Add Option";
  addOptionBtn.type = "button";

    addOptionBtn.style.backgroundColor = "blue";
  addOptionBtn.style.color = "white";
  addOptionBtn.style.border = "none";
  addOptionBtn.style.padding = "5px 10px";
  addOptionBtn.style.borderRadius = "7px";
  addOptionBtn.style.cursor = "pointer";
  addOptionBtn.style.fontSize = "14px";
  addOptionBtn.style.marginTop = "30px";
  addOptionBtn.style.marginRight = "85%";

  function createOption(text, index, removable = true) {
    const item = document.createElement("div");
    item.className = "option-item";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `correct-${questionCount}`;
    radio.value = index;
    if (index === 0) radio.checked = true;

    const input = document.createElement("input");
    input.type = "text";
    input.value = text || "";
    input.placeholder = `Option ${index + 1}`;
    input.className = "option-input";

    const remove = document.createElement("button");
    remove.textContent = "×";
    if (!removable) {
      remove.style.display = "none";
    }
    remove.addEventListener("click", () => {
      item.remove();
    });
    item.append(radio, input, remove);
    return item;
  }

  function loadMultipleChoice() {
    optionsContainer.innerHTML = "";
    optionsContainer.append(optionsLabel);

    optionsContainer.append(
      createOption("", 0),
      createOption("", 1),
      correctLabel,
      addOptionBtn
    );
  }

  function loadTrueFalse() {
    optionsContainer.innerHTML = "";
    optionsContainer.append(optionsLabel);

    optionsContainer.append(
      createOption("True", 0, false),
      createOption("False", 1, false),
      correctLabel
    );
  }

  addOptionBtn.addEventListener("click", (e) => {
    const index = optionsContainer.querySelectorAll(".option-item").length;
    optionsContainer.insertBefore(createOption("", index), correctLabel);
  });

  select.addEventListener("change", (e) => {
    if (e.target.value === "truefalse") {
      loadTrueFalse();
    } else {
      loadMultipleChoice();
    }
  });

  /* ================= DEFAULT LOAD ================= */
  loadMultipleChoice();

  /* ================= APPEND ================= */
  questionDiv.append(header, typeGroup, textGroup, optionsContainer);
  container.appendChild(questionDiv);
}

// Save quiz
function saveQuiz() {
  const title = document.getElementById("quizTitle").value.trim();
  const timeLimit = Number.parseInt(document.getElementById("quizTime").value);

  if (!title || !timeLimit) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please enter quiz title and time limit",
    });
    return;
  }

  const questionDivs = document.querySelectorAll(".question-item");
  if (questionDivs.length === 0) {
    Swal.fire({
      icon: "error",
      title: "No Questions",
      text: "Please add at least one question",
    });
    return;
  }

  const questions = [];
  let valid = true;

  questionDivs.forEach((div, index) => {
    const questionText = div.querySelector("textarea").value.trim();
    const type = div.querySelector("select").value;
    const optionInputs = div.querySelectorAll(".option-input");
    const correctRadio = div.querySelector('input[type="radio"]:checked');

    if (!questionText) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Question",
        text: `Please enter text for question ${index + 1}`,
      });
      valid = false;
      return;
    }

    const options = [];
    optionInputs.forEach((input) => {
      const optionText = input.value.trim();
      if (!optionText) {
        Swal.fire({
          icon: "error",
          title: "Incomplete Option",
          text: `Please fill all options for question ${index + 1}`,
        });
        valid = false;
        return;
      }
      options.push(optionText);
    });

    if (!valid) return;

    questions.push({
      question: questionText,
      type: type,
      options: options,
      correctAnswer: Number.parseInt(correctRadio.value),
    });
  });

  if (!valid) return;

  const quizzes = JSON.parse(localStorage.getItem(STORAGE.QUIZZES)) || [];

  if (editingQuizId) {
    // Update existing quiz
    const quizIndex = quizzes.findIndex((q) => q.id === editingQuizId);

    if (quizIndex !== -1) {
      quizzes[quizIndex].title = title;
      quizzes[quizIndex].timeLimit = timeLimit;
      quizzes[quizIndex].questions = questions;
      quizzes[quizIndex].updatedAt = new Date().toISOString();
    }

    Swal.fire({
      icon: "success",
      title: "Quiz Updated!",
      text: "Quiz updated successfully!",
      timer: 2000,
      showConfirmButton: false,
    });
  } else {
    // Create new quiz
    const quiz = {
      id: Date.now(),
      title: title,
      timeLimit: timeLimit,
      questions: questions,
      createdAt: new Date().toISOString(),
    };
    quizzes.push(quiz);
    Swal.fire({
      icon: "success",
      title: "Saved!",
      text: "Quiz saved successfully!",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  localStorage.setItem(STORAGE.QUIZZES, JSON.stringify(quizzes));

  // Reset form and editing state
  resetQuizForm();
  loadQuizzesList();
}

function resetQuizForm() {
  document.getElementById("quizTitle").value = "";
  document.getElementById("quizTime").value = "";
  document.getElementById("questionsContainer").innerHTML =
    "<h3>Questions</h3>";
  questionCount = 0;
  editingQuizId = null;

  // Hide edit header
  document.getElementById("formHeader").style.display = "none";

  // Reset save button
  const saveBtn = document.querySelector(".save-quiz-btn");
  if (saveBtn) {
    saveBtn.textContent = "Save Quiz";
    saveBtn.style.background = "";
  }
}

function cancelEdit() {
  Swal.fire({
    title: "Cancel Editing?",
    text: "Any unsaved changes will be lost.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, cancel it!",
  }).then((result) => {
    if (result.isConfirmed) {
      resetQuizForm();
    }
  });
}

function editQuiz(quizId) {
  const quizzes = JSON.parse(localStorage.getItem(STORAGE.QUIZZES)) || [];
  const quiz = quizzes.find((q) => q.id === quizId);

  if (!quiz) {
    Swal.fire({
      icon: "error",
      title: "Quiz Not Found",
      text: "The quiz you are trying to edit does not exist.",
    });
    return;
  }

  // Set editing mode
  editingQuizId = quizId;

  // Show edit header
  document.getElementById("formHeader").style.display = "flex";

  // Switch to create tab
  switchAdminTab("create");

  // Populate form with quiz data
  document.getElementById("quizTitle").value = quiz.title;
  document.getElementById("quizTime").value = quiz.timeLimit;

  // Clear existing questions
  document.getElementById("questionsContainer").innerHTML =
    "<h3>Questions</h3>";
  questionCount = 0;

  // Load each question
  quiz.questions.forEach((question, index) => {
    addQuestion();
    const questionDivs = document.querySelectorAll(".question-item");
    const currentQuestionDiv = questionDivs[questionDivs.length - 1];

    // Set question type
    const typeSelect = currentQuestionDiv.querySelector("select");
    typeSelect.value = question.type;

    // Trigger change event to update options
    typeSelect.dispatchEvent(new Event("change"));

    // Set question text
    currentQuestionDiv.querySelector("textarea").value = question.question;

    // Wait for DOM update then set options
    setTimeout(() => {
      const optionInputs = currentQuestionDiv.querySelectorAll(".option-input");
      const radioInputs = currentQuestionDiv.querySelectorAll(
        'input[type="radio"]'
      );

      // Set option values
      question.options.forEach((optionText, optIndex) => {
        if (optionInputs[optIndex]) {
          optionInputs[optIndex].value = optionText;
        }
        if (radioInputs[optIndex]) {
          radioInputs[optIndex].checked = optIndex === question.correctAnswer;
        }
      });
    }, 50);
  });

  // Change save button
  const saveBtn = document.querySelector(".save-quiz-btn");
  if (saveBtn) {
    saveBtn.textContent = "Update Quiz";
    saveBtn.style.background = "var(--warning)";
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Delete quiz
function deleteQuiz(quizId) {
  Swal.fire({
    title: "Are you sure?",
    text: "This quiz will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      let quizzes = JSON.parse(localStorage.getItem(STORAGE.QUIZZES)) || [];
      quizzes = quizzes.filter((q) => q.id !== quizId);
      localStorage.setItem(STORAGE.QUIZZES, JSON.stringify(quizzes));

      loadQuizzesList();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The quiz has been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  });
}

// Load scores for admin
function loadScores() {
  const results = JSON.parse(localStorage.getItem(STORAGE.RESULTS)) || [];
  const container = document.getElementById("scoresList");

  if (!container) return;

  if (results.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary);">No scores available yet.</p>';
    return;
  }

  container.innerHTML = "";

  // Create table
  const table = document.createElement("table");
  table.className = "scores-table";

  // Create header - ADDED "USER" COLUMN AND "ACTIONS" COLUMN
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = [
    "User",
    "Quiz Title",
    "Date",
    "Score",
    "Percentage",
    "Actions",
  ];
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement("tbody");

  results.reverse().forEach((result, index) => {
    const date = new Date(result.date);
    const row = document.createElement("tr");

    // User name/email - FALLBACK TO "Unknown" IF NOT AVAILABLE
    const userCell = document.createElement("td");
    userCell.textContent = result.userEmail || "Unknown";

    // Quiz title
    const titleCell = document.createElement("td");
    titleCell.textContent = result.quizTitle;

    // Date
    const dateCell = document.createElement("td");
    dateCell.textContent = date.toLocaleString();

    // Score
    const scoreCell = document.createElement("td");
    scoreCell.textContent = `${result.score}/${result.total}`;

    // Percentage
    const percentCell = document.createElement("td");
    percentCell.textContent = `${result.percentage}%`;

    // Actions cell with delete button
    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => {
      deleteScore(results.length - 1 - index);
    });
    actionsCell.appendChild(deleteButton);

    row.append(
      userCell,
      titleCell,
      dateCell,
      scoreCell,
      percentCell,
      actionsCell
    );
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// New function to delete a score
function deleteScore(index) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      const results = JSON.parse(localStorage.getItem(STORAGE.RESULTS)) || [];

      if (index >= 0 && index < results.length) {
        // Remove the item at the specified index
        results.splice(index, 1);

        // Save back to localStorage
        localStorage.setItem(STORAGE.RESULTS, JSON.stringify(results));

        // Reload the scores
        loadScores();

        // Show success message
        Swal.fire(
          'Deleted!',
          'Score has been deleted successfully.',
          'success'
        );
      } else {
        Swal.fire(
          'Error!',
          'Invalid index provided.',
          'error'
        );
      }
    }
  });
}
// Add CSS for the delete button
const style = document.createElement("style");
style.innerHTML = `
  .delete-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  
  .delete-btn:hover {
    background-color: #c82333;
  }
  
  .delete-btn:active {
    background-color: #bd2130;
  }
`;
document.head.appendChild(style);
