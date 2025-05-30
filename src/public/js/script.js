const socket = io();

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const username = getCookie("username");
if (!username) {
  window.location.href = "register.html";
}

const send = document.querySelector("#send-message");
const allMessages = document.querySelector("#all-messages");

send.addEventListener("click", () => {
  const message = document.querySelector("#message").value.trim();
  if (message) {
    socket.emit("message", { user: username, message });
    document.querySelector("#message").value = "";
  }
});

socket.on("message", ({ user, message }) => {
  const isOwn = user === username;
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("d-flex", "mb-3");

  // Alineación según usuario
  if (isOwn) {
    msgDiv.classList.add("justify-content-end");
  } else {
    msgDiv.classList.add("justify-content-start");
  }

  msgDiv.innerHTML = `
    <div class="message-bubble p-3 rounded" style="
      max-width: 60%;
      background-color: ${isOwn ? '#a3c4f3' : '#2a2a2a'};
      color: ${isOwn ? 'black' : 'white'};
      border-radius: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      ">
      <div class="fw-bold mb-1">${user}</div>
      <div>${escapeHtml(message)}</div>
    </div>
  `;

  allMessages.appendChild(msgDiv);
  allMessages.scrollTop = allMessages.scrollHeight;
});

socket.emit("new-user", username);

socket.on("user-list", (users) => {
  const usersContainer = document.getElementById("users-container");
  if (!usersContainer) return;

  usersContainer.innerHTML = '';

  users.forEach(({ user, connected }) => {
    const userDiv = document.createElement("div");
    userDiv.textContent = user;

    // Color verde si activo, rojo si desconectado
    userDiv.style.color = connected ? "#28a745" : "#dc3545";
    userDiv.style.fontWeight = connected ? "bold" : "normal";
    userDiv.classList.add("mb-2");

    // Indicador pequeño al lado del nombre
    const statusDot = document.createElement("span");
    statusDot.style.width = "10px";
    statusDot.style.height = "10px";
    statusDot.style.borderRadius = "50%";
    statusDot.style.display = "inline-block";
    statusDot.style.marginLeft = "8px";
    statusDot.style.backgroundColor = connected ? "#28a745" : "#dc3545";
    userDiv.appendChild(statusDot);

    usersContainer.appendChild(userDiv);
  });
});

// Tema toggle (igual que antes)
const toggleThemeBtn = document.getElementById("toggle-theme");
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    location.reload();
  });
}

window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
});

// Función para evitar inyección HTML en mensajes
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
