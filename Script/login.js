// Clear email and password when page opens
window.addEventListener("load", function () {
  setTimeout(function () {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    if (emailInput) emailInput.value = "";
    if (passwordInput) passwordInput.value = "";
  }, 100);
});
// When click Login button
document.getElementById("loginBtn").addEventListener("click", function () {
  // Get email and password
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  // Check if email and password are not empty
  if (email === "" || password === "") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please type your email and password!",
    });
    return;
  }

  // Get selected role (Admin or User)
  let roleElement = document.querySelector('input[name="role"]:checked');
  if (!roleElement) {
    Swal.fire({
      icon: "error",
      title: "Role Required",
      text: "Please choose Admin or User",
    });
    return;
  }
  let role = roleElement.value;

  // Save the email and role to localStorage (NOT sessionStorage)
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userRole", role);

  // Go to the correct page
  if (role === "admin") {
    window.location.href = "roles/admin.html";
  } else {
    window.location.href = "roles/user.html";
  }
});
