"use strict";

const countdown = document.querySelector(".countdown");
const eventDate = document.querySelector(".event-date");
const timeFields = ["days", "hours", "minutes", "seconds"].map((id) => document.getElementById(id));
const bahiaUtcOffset = 3 * 60 * 60 * 1000;
const eventDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Bahia",
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
});
let eventTime = 0;

function getNextEventTime(now) {
  const bahiaNow = new Date(now - bahiaUtcOffset);
  for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
    const candidate = new Date(Date.UTC(
      bahiaNow.getUTCFullYear(),
      bahiaNow.getUTCMonth(),
      bahiaNow.getUTCDate() + daysAhead,
      19, 30,
    ));
    const weekday = candidate.getUTCDay();
    const candidateTime = candidate.getTime() + bahiaUtcOffset;
    if ((weekday === 1 || weekday === 4) && candidateTime > now) return candidateTime;
  }
}

function updateEventDate() {
  const parts = eventDateFormatter.formatToParts(new Date(eventTime));
  const part = (type) => parts.find((entry) => entry.type === type).value;
  const weekday = part("weekday").split("-")[0];
  const label = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  eventDate.textContent = `${label} · ${part("day")}/${part("month")} · 19h30 · Evento Online`;
  countdown.dataset.eventDate = new Date(eventTime).toISOString();
}

function updateCountdown() {
  const now = Date.now();
  if (eventTime <= now) {
    eventTime = getNextEventTime(now);
    updateEventDate();
  }
  const remaining = Math.max(0, Math.ceil((eventTime - now) / 1000));
  const values = [Math.floor(remaining / 86400), Math.floor((remaining % 86400) / 3600), Math.floor((remaining % 3600) / 60), remaining % 60];
  values.forEach((value, index) => { timeFields[index].textContent = String(value).padStart(2, "0"); });
  countdown.setAttribute("aria-label", `${values[0]} dias, ${values[1]} horas, ${values[2]} minutos e ${values[3]} segundos para o evento`);
  return remaining;
}

updateCountdown();
setInterval(updateCountdown, 1000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateCountdown();
});

const video = document.getElementById("masterclass-video");
const cover = document.querySelector(".video-cover");

video.addEventListener("playing", () => {
  cover.hidden = true;
});

video.muted = true;
video.play().catch(() => {
  cover.hidden = false;
});

cover.addEventListener("click", async () => {
  cover.hidden = true;
  video.muted = false;
  try {
    await video.play();
  } catch {
    cover.hidden = false;
  }
});

const registerButton = document.querySelector(".register-button");
const registrationDialog = document.getElementById("registration-dialog");
const registrationForm = document.getElementById("registration-form");
const closeDialogButton = registrationDialog.querySelector(".dialog-close");
const submitButton = registrationForm.querySelector(".form-submit");
const registrationStatus = document.getElementById("registration-status");
const nameInput = document.getElementById("registration-name");
const emailInput = document.getElementById("registration-email");
const whatsappInput = document.getElementById("registration-whatsapp");
const registrationInputs = [nameInput, emailInput, whatsappInput];
let isSubmitting = false;

registerButton.addEventListener("click", () => registrationDialog.showModal());
closeDialogButton.addEventListener("click", () => registrationDialog.close());
registrationDialog.addEventListener("cancel", (event) => {
  if (isSubmitting) event.preventDefault();
});
registrationDialog.addEventListener("click", (event) => {
  if (event.target !== registrationDialog || isSubmitting) return;
  const bounds = registrationDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) registrationDialog.close();
});
registrationDialog.addEventListener("close", () => registerButton.focus());

registrationInputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.setCustomValidity("");
    registrationStatus.textContent = "";
  });
});

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting) return;

  nameInput.value = nameInput.value.trim();
  emailInput.value = emailInput.value.trim();
  nameInput.setCustomValidity(nameInput.value.length < 2 ? "Informe seu nome com pelo menos 2 caracteres." : "");
  const hasCountryCode = whatsappInput.value.trim().startsWith("+");
  let whatsapp = whatsappInput.value.replace(/\D/g, "");
  if (!hasCountryCode && (whatsapp.length === 10 || whatsapp.length === 11)) whatsapp = `55${whatsapp}`;
  const validWhatsapp = hasCountryCode ? /^[1-9]\d{7,14}$/.test(whatsapp) : /^55[1-9]{2}\d{8,9}$/.test(whatsapp);
  whatsappInput.setCustomValidity(validWhatsapp ? "" : "Informe um WhatsApp válido com DDD. Para outros países, inclua + e o código do país.");
  if (!registrationForm.reportValidity()) return;

  const payload = { nome: nameInput.value, email: emailInput.value, whatsapp, origem: registerButton.id };
  isSubmitting = true;
  submitButton.disabled = true;
  closeDialogButton.disabled = true;
  registrationInputs.forEach((input) => { input.readOnly = true; });
  registrationForm.setAttribute("aria-busy", "true");
  submitButton.textContent = "ENVIANDO...";
  registrationStatus.dataset.state = "pending";
  registrationStatus.textContent = "Estamos confirmando sua inscrição...";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let isRedirecting = false;
  try {
    const response = await fetch(registrationForm.action, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Registration failed");
    registrationStatus.dataset.state = "success";
    registrationStatus.textContent = "Inscrição enviada! Abrindo o grupo do WhatsApp...";
    window.location.assign(registrationForm.dataset.whatsappUrl);
    isRedirecting = true;
  } catch (error) {
    registrationStatus.dataset.state = "error";
    registrationStatus.textContent = error.name === "AbortError"
      ? "O envio demorou mais que o esperado. Seus dados continuam aqui; tente novamente."
      : "Não foi possível confirmar sua inscrição. Confira sua conexão e tente novamente.";
  } finally {
    clearTimeout(timeout);
    if (!isRedirecting) {
      isSubmitting = false;
      submitButton.disabled = false;
      closeDialogButton.disabled = false;
      registrationInputs.forEach((input) => { input.readOnly = false; });
      registrationForm.removeAttribute("aria-busy");
      submitButton.textContent = "ENVIAR E ENTRAR NO GRUPO";
    }
  }
});

