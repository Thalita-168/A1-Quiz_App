document.addEventListener("DOMContentLoaded", function () {

  // ===============================
  // Clear inputs on page load
  // ===============================
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";

  // ===============================
  // Show / Hide Password
  // ===============================
  const togglePassword = document.getElementById("togglePassword");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const icon = this.querySelector("ion-icon");

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.setAttribute("name", "eye-outline");
      } else {
        passwordInput.type = "password";
        icon.setAttribute("name", "eye-off-outline");
      }
    });
  }

  // ===============================
  // Login Button
  // ===============================
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", function () {

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please type your email and password!",
        });
        return;
      }

      const roleElement = document.querySelector('input[name="role"]:checked');

      if (!roleElement) {
        Swal.fire({
          icon: "error",
          title: "Role Required",
          text: "Please choose Admin or User",
        });
        return;
      }

      const role = roleElement.value;

      // ===============================
      // Save login state
      // ===============================
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", role);

      // ===============================
      // Redirect
      // ===============================
      if (role === "admin") {
        window.location.href = "/roles/admin.html";
      } else {
        window.location.href = "/roles/user.html";
      }
    });
  }

});
