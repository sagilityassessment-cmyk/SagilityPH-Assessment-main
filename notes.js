const firebaseConfig = {
  apiKey: 'AIzaSyBZVAXmgE-24AVUFB_7xS4GQi4OwkIvptQ',
  authDomain: 'sagility-assessment.firebaseapp.com',
  projectId: 'sagility-assessment',
  storageBucket: 'sagility-assessment.firebasestorage.app',
  messagingSenderId: '879192858532',
  appId: '1:879192858532:web:39e190eb2b130998df6b31',
  measurementId: 'G-QHND2XY4ZR'
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const notesCollection = firestore.collection('sagiNotes');
const notesTableBody = document.getElementById('notesTableBody');
const notesStatus = document.getElementById('notesStatus');
const addNoteButton = document.getElementById('addNoteButton');
const notesSearchInput = document.getElementById('notesSearchInput');
const firebaseAuthReady = firebase.auth().signInAnonymously();

let notes = [];
const savedNoteIds = new Set();
let searchQuery = '';

function isSavedNote(note) {
  return Boolean(note.savedAt || (note.title && note.link && note.updatedAt > note.createdAt));
}

function setStatus(message, isError = false) {
  notesStatus.textContent = message;
  notesStatus.className = `notes-status${isError ? ' error' : ''}`;
}

function renderNotes() {
  const visibleNotes = notes
    .map((note, index) => ({ note, index }))
    .filter(({ note }) => `${note.title || ''} ${note.link || ''}`.toLowerCase().includes(searchQuery));
  const activeElement = document.activeElement;
  const activeRow = activeElement && activeElement.closest('tr[data-note-id]');
  const activeField = activeElement && activeElement.classList.contains('note-title-input')
    ? 'title'
    : activeElement && activeElement.classList.contains('note-link-input')
      ? 'link'
      : null;
  const activeValue = activeField ? activeElement.value : null;
  notesTableBody.innerHTML = visibleNotes.length
    ? visibleNotes.map(({ note, index }) => `
      <tr data-note-id="${note.id}">
        <td>${index + 1}</td>
        <td><input class="note-title-input" type="text" value="${escapeAttribute(note.title)}" aria-label="Note title"></td>
        <td><input class="note-link-input" type="url" value="${escapeAttribute(note.link)}" aria-label="Note link"></td>
        <td class="notes-column-action"><button class="notes-click-button" type="button"${note.link ? '' : ' disabled'}>Click Here</button></td>
        <td class="notes-column-action"><button class="notes-save-button${savedNoteIds.has(note.id) || isSavedNote(note) ? ' is-saved' : ''}" type="button">${savedNoteIds.has(note.id) || isSavedNote(note) ? 'Saved' : 'Save'}</button></td>
        <td class="notes-column-action"><button class="notes-delete-button" type="button">Delete</button></td>
      </tr>`).join('')
    : `<tr><td colspan="6">${notes.length ? 'No matching notes found.' : 'No notes yet. Click Add Note to create one.'}</td></tr>`;

  notesTableBody.querySelectorAll('tr[data-note-id]').forEach(row => {
    row.querySelector('.notes-click-button').addEventListener('click', () => openNoteLink(row));
    row.querySelector('.notes-save-button').addEventListener('click', () => saveNote(row));
    row.querySelector('.notes-delete-button').addEventListener('click', () => deleteNote(row));
    row.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
      savedNoteIds.delete(row.dataset.noteId);
      const saveButton = row.querySelector('.notes-save-button');
      saveButton.textContent = 'Save';
      saveButton.classList.remove('is-saved');
    }));
  });

  if (activeRow && activeField) {
    const restoredRow = notesTableBody.querySelector(`tr[data-note-id="${activeRow.dataset.noteId}"]`);
    const restoredInput = restoredRow && restoredRow.querySelector(`.note-${activeField}-input`);
    if (restoredInput) {
      restoredInput.value = activeValue;
      restoredInput.focus();
      restoredInput.setSelectionRange(restoredInput.value.length, restoredInput.value.length);
    }
  }

  function openNoteLink(row) {
    const link = row.querySelector('.note-link-input').value.trim();
    try {
      const url = new URL(link);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported link protocol');
      window.open(url.href, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setStatus('Enter and save a valid http or https link first.', true);
    }
  }
}

function escapeAttribute(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

async function addNote() {
  addNoteButton.disabled = true;
  try {
    await firebaseAuthReady;
    const createdAt = Date.now();
    await notesCollection.add({
      title: '',
      link: '',
      createdAt,
      updatedAt: createdAt
    });
    setStatus('New note added. Enter a title and link, then click Save.');
  } catch (error) {
    console.error('Unable to add note:', error);
    setStatus('Unable to add the note. Publish the updated Firestore rules first.', true);
  } finally {
    addNoteButton.disabled = false;
  }
}

async function saveNote(row) {
  const noteId = row.dataset.noteId;
  const title = row.querySelector('.note-title-input').value.trim();
  const link = row.querySelector('.note-link-input').value.trim();
  if (!title || !link) {
    setStatus('Enter both a title and a link before saving.', true);
    return;
  }

  const saveButton = row.querySelector('.notes-save-button');
  saveButton.disabled = true;
  try {
    await firebaseAuthReady;
    await notesCollection.doc(noteId).update({
      title,
      link,
      updatedAt: Date.now()
    });
    savedNoteIds.add(noteId);
    saveButton.textContent = 'Saved';
    saveButton.classList.add('is-saved');
    setStatus('Note saved and synchronized across devices.');
  } catch (error) {
    console.error('Unable to save note:', error);
    setStatus('Unable to save the note. Check the Firestore rules.', true);
  } finally {
    saveButton.disabled = false;
  }
}

async function deleteNote(row) {
  if (!window.confirm('Delete this note?')) return;
  try {
    await firebaseAuthReady;
    await notesCollection.doc(row.dataset.noteId).delete();
    savedNoteIds.delete(row.dataset.noteId);
    setStatus('Note deleted.');
  } catch (error) {
    console.error('Unable to delete note:', error);
    setStatus('Unable to delete the note. Check the Firestore rules.', true);
  }
}

addNoteButton.addEventListener('click', addNote);
notesSearchInput.addEventListener('input', event => {
  searchQuery = event.target.value.trim().toLowerCase();
  renderNotes();
});

firebaseAuthReady
  .then(() => notesCollection.orderBy('createdAt', 'asc').onSnapshot(snapshot => {
    notes = snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
    renderNotes();
    if (!notesStatus.classList.contains('error')) {
      setStatus(notes.length ? 'Changes sync automatically across devices.' : 'No notes yet.');
    }
  }, error => {
    console.error('Unable to load notes:', error);
    setStatus('Notes unavailable. Publish the updated Firestore rules first.', true);
  }))
  .catch(error => {
    console.error('Firebase authentication failed:', error);
    setStatus('Notes unavailable. Firebase authentication failed.', true);
  });
