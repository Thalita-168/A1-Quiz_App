// Load available quizzes for user
function loadAvailableQuizzes() {
  const quizzes = JSON.parse(localStorage.getItem(STORAGE.QUIZZES)) || [];
  const container = document.getElementById("quizzesListUser");

  if (!container) return;

  if (quizzes.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary);">No quizzes available at the moment.</p>';
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

    const startBtn = document.createElement("button");
    startBtn.textContent = "Start Quiz";
    startBtn.className = "start-quiz-btn";
    startBtn.onclick = function () {
      startQuiz(quiz.id);
    };

    actions.appendChild(startBtn);

    // Append all to card
    card.append(title, meta, actions);
    container.appendChild(card);
  });
}

// Start quiz
function startQuiz(quizId) {
  const quizzes = JSON.parse(localStorage.getItem(STORAGE.QUIZZES)) || [];
  currentQuiz = quizzes.find((q) => q.id === quizId);

  if (!currentQuiz) {
    Swal.fire({
      icon: "error",
      title: "Quiz Not Found",
      text: "The quiz you are trying to access does not exist.",
    });
    return;
  }

  currentQuestionIndex = 0;
  userAnswers = new Array(currentQuiz.questions.length).fill(null);
  timeRemaining = currentQuiz.timeLimit * 60; // Convert to seconds

  showScreen("quizTakingScreen");
  document.getElementById("quizTitleDisplay").textContent = currentQuiz.title;

  startTimer();
  displayQuestion();
}

// Start timer
function startTimer() {
  clearInterval(timerInterval); // Clear any existing timer

  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

// Update timer display
function updateTimerDisplay() {
  const timerElement = document.getElementById("timer");
  if (timerElement) {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }
}

// Display question
function displayQuestion() {
  const question = currentQuiz.questions[currentQuestionIndex];
  const container = document.getElementById("questionContainer");

  if (!container || !question) return;

  document.getElementById("questionProgress").textContent = `Question ${
    currentQuestionIndex + 1
  } of ${currentQuiz.questions.length}`;

  // Clear container
  container.innerHTML = "";

  // Question title
  const h3 = document.createElement("h3");
  h3.textContent = question.question;
  container.appendChild(h3);

  // Options container
  const optionsContainer = document.createElement("div");
  optionsContainer.className = "answer-options";

  question.options.forEach((option, index) => {
    const isSelected = userAnswers[currentQuestionIndex] === index;

    const label = document.createElement("label");
    label.className = "answer-option";
    if (isSelected) label.classList.add("selected");

    label.onclick = () => selectAnswer(index);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = index;
    input.checked = isSelected;

    const span = document.createElement("span");
    span.textContent = option;

    label.append(input, span);
    optionsContainer.appendChild(label);
  });

  container.appendChild(optionsContainer);

  // Navigation buttons
  document.getElementById("prevBtn").disabled = currentQuestionIndex === 0;

  if (currentQuestionIndex === currentQuiz.questions.length - 1) {
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("submitBtn").style.display = "block";
  } else {
    document.getElementById("nextBtn").style.display = "block";
    document.getElementById("submitBtn").style.display = "none";
  }
}

// Select answer
function selectAnswer(optionIndex) {
  userAnswers[currentQuestionIndex] = optionIndex;

  document.querySelectorAll(".answer-option").forEach((opt, idx) => {
    opt.classList.toggle("selected", idx === optionIndex);
    const input = opt.querySelector("input");
    if (input) {
      input.checked = idx === optionIndex;
    }
  });
}

// Previous question
function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion();
  }
}

// Next question
function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  }
}

// Submit quiz
function submitQuiz() {
  clearInterval(timerInterval);

  let correctCount = 0;
  const reviewItems = [];

  currentQuiz.questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.correctAnswer;

    if (isCorrect) correctCount++;

    let userAnswerText;

    // Check if user answered
    if (userAnswer !== null && userAnswer !== undefined) {
      userAnswerText = question.options[userAnswer];
    } else {
      userAnswerText = "Not answered";
    }

    // Add item to review list
    reviewItems.push({
      question: question.question,
      userAnswer: userAnswerText,
      correctAnswer: question.options[question.correctAnswer],
      isCorrect: isCorrect,
    });
  });

  const score = correctCount;
  const total = currentQuiz.questions.length;
  const percentage = Math.round((score / total) * 100);

  // Save result - Get userEmail from localStorage
  const result = {
    quizId: currentQuiz.id,
    quizTitle: currentQuiz.title,
    userEmail: localStorage.getItem("userEmail"), // Changed from sessionStorage
    score: score,
    total: total,
    percentage: percentage,
    date: new Date().toISOString(),
    answers: reviewItems,
  };

  const results = JSON.parse(localStorage.getItem(STORAGE.RESULTS)) || [];
  results.push(result);
  localStorage.setItem(STORAGE.RESULTS, JSON.stringify(results));

  // Show results
  showResults(result);
}

// Show results
function showResults(result) {
  showScreen("resultsScreen");

  document.getElementById(
    "scorePercentage"
  ).textContent = `${result.percentage}%`;
  document.getElementById(
    "scoreText"
  ).textContent = `You scored ${result.score} out of ${result.total}`;

  const reviewContainer = document.getElementById("answerReview");
  reviewContainer.innerHTML =
    '<h3 style="margin-bottom: 1rem;">Answer Review</h3>';

  result.answers.forEach((item, index) => {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = `review-item ${
      item.isCorrect ? "correct" : "incorrect"
    }`;

    // Question text
    const questionDiv = document.createElement("div");
    questionDiv.className = "review-question";
    questionDiv.textContent = `Q${index + 1}: ${item.question}`;

    // User answer
    const userAnswerDiv = document.createElement("div");
    userAnswerDiv.className = item.isCorrect
      ? "review-answer correct-answer"
      : "review-answer wrong-answer";
    userAnswerDiv.textContent = `Your answer: ${item.userAnswer}`;

    // Append question and user answer to reviewDiv
    reviewDiv.append(questionDiv, userAnswerDiv);

    // If answer is wrong, show correct answer
    if (!item.isCorrect) {
      const correctAnswerDiv = document.createElement("div");
      correctAnswerDiv.className = "review-answer correct-answer";
      correctAnswerDiv.textContent = `Correct answer: ${item.correctAnswer}`;
      reviewDiv.appendChild(correctAnswerDiv);
    }
    reviewContainer.appendChild(reviewDiv);
  });
}

// Back to quizzes
function backToQuizzes() {
  showScreen("userScreen");
  loadAvailableQuizzes();
}

// Show history
function showHistory() {
  const results = JSON.parse(localStorage.getItem(STORAGE.RESULTS)) || [];
  const container = document.getElementById("historyList");

  if (!container) return;

  if (results.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-secondary);">No quiz history yet.</p>';
  } else {
    container.innerHTML = "";
    results.reverse().forEach((result) => {
      const date = new Date(result.date);
      const historyDiv = document.createElement("div");
      historyDiv.className = "history-item";
      historyDiv.style.cursor = "pointer";

      historyDiv.onclick = () => {
        showHistoryDetails(result);
      };

      const infoDiv = document.createElement("div");
      infoDiv.className = "history-info";

      // Quiz title
      const title = document.createElement("h3");
      title.textContent = result.quizTitle;

      // Quiz date
      const dateP = document.createElement("p");
      dateP.className = "history-date";
      dateP.textContent = date.toLocaleString();

      // Append title and date to infoDiv
      infoDiv.append(title, dateP);

      // History score container
      const scoreDiv = document.createElement("div");
      scoreDiv.className = "history-score";

      // Percentage
      const percentageDiv = document.createElement("div");
      percentageDiv.className = "history-percentage";
      percentageDiv.textContent = result.percentage + "%";

      // Actual score
      const scoreTextDiv = document.createElement("div");
      scoreTextDiv.textContent = `${result.score}/${result.total}`;

      // Append percentage and score to scoreDiv
      scoreDiv.append(percentageDiv, scoreTextDiv);

      // Append infoDiv and scoreDiv to historyDiv
      historyDiv.append(infoDiv, scoreDiv);
      container.appendChild(historyDiv);
    });
  }

  showScreen("historyScreen");
}
function showHistoryDetails(result) {
  showScreen("historyDetailScreen");

  // Title & meta
  document.getElementById("historyQuizTitle").textContent = result.quizTitle;

  const date = new Date(result.date);
  document.getElementById("historyMeta").textContent = `Score: ${
    result.score
  }/${result.total} (${result.percentage}%) • ${date.toLocaleString()}`;

  const container = document.getElementById("historyAnswerReview");
  container.innerHTML = "";

  result.answers.forEach((item, index) => {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = `review-item ${
      item.isCorrect ? "correct" : "incorrect"
    }`;

    const questionDiv = document.createElement("div");
    questionDiv.className = "review-question";
    questionDiv.textContent = `Q${index + 1}: ${item.question}`;

    const userAnswerDiv = document.createElement("div");
    userAnswerDiv.className = item.isCorrect
      ? "review-answer correct-answer"
      : "review-answer wrong-answer";
    userAnswerDiv.textContent = `Your answer: ${item.userAnswer}`;

    reviewDiv.append(questionDiv, userAnswerDiv);

    if (!item.isCorrect) {
      const correctAnswerDiv = document.createElement("div");
      correctAnswerDiv.className = "review-answer correct-answer";
      correctAnswerDiv.textContent = `Correct answer: ${item.correctAnswer}`;
      reviewDiv.appendChild(correctAnswerDiv);
    }

    container.appendChild(reviewDiv);
  });
}
