import { db } from "./firebase.js";
import {
  onValue,
  push,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const mainLocationSelect = document.getElementById("headerLocationSelect");
const seatCards = [...document.querySelectorAll(".seat-card")];
const seatInputs = seatCards.map(card => card.querySelector("input"));
const seatButtons = seatCards.map(card => card.querySelector(".seat-call-button"));
let stopSeatsListener = null;
let stopQueueListener = null;

function getLocationPaths() {
  const location = mainLocationSelect?.value || "";
  if (!location || location === "Testing") return null;
  const locationKey = encodeURIComponent(location);
  return {
    location,
    seatsPath: `locations/${locationKey}/seats`,
    queuePath: `locations/${locationKey}/queue`
  };
}

function getSeatNumber(input) {
  return seatInputs.indexOf(input) + 1;
}

function setButtonState(seat, called) {
  const button = seatButtons[seat - 1];
  if (!button) return;
  button.classList.toggle("called", called);
  button.textContent = called ? "CALLED ✓" : "CALL";
}

function clearSeatManager() {
  seatInputs.forEach(input => { input.value = ""; });
  seatButtons.forEach((_, index) => setButtonState(index + 1, false));
}

function subscribeToLocation() {
  stopSeatsListener?.();
  stopQueueListener?.();
  stopSeatsListener = null;
  stopQueueListener = null;

  const paths = getLocationPaths();
  if (!paths) {
    clearSeatManager();
    return;
  }

  stopSeatsListener = onValue(ref(db, paths.seatsPath), snapshot => {
    const values = snapshot.val() || {};
    seatInputs.forEach((input, index) => {
      const value = values[index + 1];
      input.value = value === undefined || value === 0 ? "" : String(value);
    });
  });

  stopQueueListener = onValue(ref(db, paths.queuePath), snapshot => {
    const queue = snapshot.val() || {};
    const activeSeats = new Set(Object.values(queue).map(call => Number(call.seat)));
    seatButtons.forEach((_, index) => setButtonState(index + 1, activeSeats.has(index + 1)));
  });
}

seatInputs.forEach(input => {
  input.addEventListener("change", async () => {
    const paths = getLocationPaths();
    if (!paths) return;
    const seat = getSeatNumber(input);
    await set(ref(db, `${paths.seatsPath}/${seat}`), input.value.trim());
  });
});

seatButtons.forEach((button, index) => {
  button.addEventListener("click", async () => {
    const paths = getLocationPaths();
    const value = seatInputs[index].value.trim();
    if (!value) return;
    if (!paths) {
      mainLocationSelect?.focus();
      alert("Please select Iloilo City, Quezon City, Alabang, or Bohol first.");
      return;
    }

    const seat = index + 1;
    await set(ref(db, `${paths.seatsPath}/${seat}`), value);
    await set(push(ref(db, paths.queuePath)), {
      seat,
      id: value,
      location: paths.location,
      timestamp: Date.now()
    });
    setButtonState(seat, true);
  });
});

document.querySelector(".clear-data-action")?.addEventListener("click", async () => {
  const paths = getLocationPaths();
  if (!paths) return;
  await Promise.all(seatInputs.map((input, index) => {
    input.value = "";
    return set(ref(db, `${paths.seatsPath}/${index + 1}`), "");
  }));
  seatButtons.forEach((_, index) => setButtonState(index + 1, false));
});

document.querySelector(".view-display-action")?.addEventListener("click", () => {
  window.open("display.html", "_blank", "noopener");
});

mainLocationSelect?.addEventListener("change", subscribeToLocation);
subscribeToLocation();
