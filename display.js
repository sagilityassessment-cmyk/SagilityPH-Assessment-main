import { db } from "./firebase.js";
import {
  onValue,
  ref,
  remove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const popup = document.getElementById("popup");
const currentCall = document.getElementById("currentCall");
const callHistory = document.getElementById("callHistory");
const displayLocationSelect = document.getElementById("displayLocationSelect");
const chime = new Audio("./chime.mp3");
let queueEntries = [];
let allQueueEntries = [];
let processing = false;
let current = null;
const history = [];
let selectedVoice = null;
let stopQueueListener = null;
const savedLocation = localStorage.getItem("sagility-display-location") || localStorage.getItem("sagility-selected-location") || "";
if ([...displayLocationSelect.options].some(option => option.value === savedLocation)) {
  displayLocationSelect.value = savedLocation;
}

displayLocationSelect.addEventListener("change", () => {
  localStorage.setItem("sagility-display-location", displayLocationSelect.value);
  subscribeToLocation();
});

function getQueuePath() {
  return `locations/${encodeURIComponent(displayLocationSelect.value)}/queue`;
}

function subscribeToLocation() {
  stopQueueListener?.();
  stopQueueListener = null;
  queueEntries = [];
  allQueueEntries = [];
  current = null;
  processing = false;
  popup.classList.add("hidden");
  drawBoard();
  if (!displayLocationSelect.value) return;

  stopQueueListener = onValue(ref(db, getQueuePath()), snapshot => {
    const queue = snapshot.val() || {};
    allQueueEntries = Object.entries(queue)
      .sort((first, second) => Number(first[1].timestamp || 0) - Number(second[1].timestamp || 0));
    queueEntries = allQueueEntries;
    processNextCall();
  });
}

function loadVoice() {
  const voices = speechSynthesis.getVoices();
  selectedVoice = voices.find(voice => /jenny|aria|zira|samantha/i.test(voice.name)) || voices[0];
}

loadVoice();
speechSynthesis.onvoiceschanged = loadVoice;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function isNumeric(value) {
  return /^\d+$/.test(String(value).trim());
}

function drawBoard() {
  currentCall.classList.toggle("empty", !current);
  currentCall.innerHTML = current
    ? `<div class="call-location">SEAT ${current.seat}</div><div class="call-value ${isNumeric(current.id) ? "id-value" : "name-value"}">${escapeHtml(current.id)}</div>`
    : "";

  callHistory.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const call = history[index];
    return `<div class="history-call">${call ? `<div class="box-location">SEAT ${call.seat}</div><div class="box-value ${isNumeric(call.id) ? "id-value" : "name-value"}">${escapeHtml(call.id)}</div>` : "<div class=\"box-empty\">-</div>"}</div>`;
  }).join("");
}

function showPopup(call) {
  const numeric = isNumeric(call.id);
  const announcement = numeric
    ? `ID number ${call.id}. Seat ${call.seat}. Please proceed to Testing Room.`
    : `Applicant ${call.id}. Seat ${call.seat}. Please proceed to Testing Room.`;

  popup.innerHTML = `<div class="popup-seat">SEAT ${call.seat}</div><div class="popup-value ${numeric ? "id-value" : "name-value"}">${escapeHtml(call.id)}</div><div class="popup-instruction">PLEASE PROCEED TO TESTING ROOM</div>`;
  popup.classList.remove("hidden");

  const speak = () => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  chime.pause();
  chime.currentTime = 0;
  chime.play().then(() => window.setTimeout(speak, 1500)).catch(speak);
}

async function processNextCall() {
  if (processing || queueEntries.length === 0) return;
  processing = true;
  const [key, call] = queueEntries[0];
  const queuePath = getQueuePath();
  current = { seat: call.seat, id: String(call.id) };
  history.unshift(current);
  history.splice(12);
  drawBoard();
  showPopup(current);

  window.setTimeout(async () => {
    popup.classList.add("hidden");
    await remove(ref(db, `${queuePath}/${key}`));
    current = null;
    processing = false;
    drawBoard();
    processNextCall();
  }, 10000);
}

drawBoard();
subscribeToLocation();
