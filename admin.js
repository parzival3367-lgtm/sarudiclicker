import { createAdminPasswordPrompt } from "./admin-auth.js";

const adminContent = document.getElementById("admin-content");
const promptForAdminPassword = createAdminPasswordPrompt(
  () => {
    adminContent.hidden = false;
  },
  () => {
    window.location.assign("/");
  },
);

const hasVerifiedEntry = sessionStorage.getItem("adminEntryVerified") === "true";
sessionStorage.removeItem("adminEntryVerified");

if (hasVerifiedEntry) {
  adminContent.hidden = false;
} else {
  promptForAdminPassword();
}

document.getElementById("admin-back-button").addEventListener("click", () => {
  window.location.assign("/");
});
