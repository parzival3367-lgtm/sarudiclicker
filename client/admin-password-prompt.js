export function createAdminPasswordPrompt(onAuthenticated, onCancel) {
  const dialog = document.getElementById("admin-password-dialog");
  const form = document.getElementById("admin-password-form");
  const passwordInput = document.getElementById("admin-password");
  const errorMessage = document.getElementById("admin-password-error");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.hidden = true;
    submitButton.disabled = true;

    try {
      const response = await fetch("/api/verify-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.value }),
      });

      if (response.status === 401) {
        errorMessage.textContent = "Incorrect password. Please try again.";
        errorMessage.hidden = false;
        passwordInput.select();
        return;
      }

      if (!response.ok) {
        throw new Error(`Admin authentication failed (${response.status})`);
      }

      passwordInput.value = "";
      dialog.close();
      onAuthenticated();
    } catch (error) {
      console.error("Unable to authenticate admin:", error);
      errorMessage.textContent = "Unable to verify the password. Please try again.";
      errorMessage.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  });

  document.getElementById("admin-password-cancel").addEventListener("click", () => {
    dialog.close();
    onCancel?.();
  });

  return () => {
    form.reset();
    errorMessage.hidden = true;
    dialog.showModal();
    passwordInput.focus();
  };
}
