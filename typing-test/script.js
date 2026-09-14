// App JS for app.html (overlay typing)
let startTime, timerInterval, testCompleted = false; let typedTextRaw = '';
const displayTextEl = document.getElementById('displayText');
const displayText = displayTextEl.innerText;
const typingShell = document.getElementById('typingShell');
const typingInput = document.getElementById('typingInput');

typingInput.addEventListener('paste', (e) => e.preventDefault());
typingInput.addEventListener('copy', (e) => e.preventDefault());
typingInput.addEventListener('cut', (e) => e.preventDefault());
const typingOverlay = document.getElementById('typingOverlay');
const timeEl = document.getElementById('time');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const retakeBtn = document.getElementById('retakeBtn');
const newApplicantBtn = document.getElementById('newApplicantBtn');
const downloadBtn = document.getElementById('downloadBtn');
const rTime = document.getElementById('rTime');
const rWpm = document.getElementById('rWpm');
const rAcc = document.getElementById('rAcc');
const historyList = document.getElementById('historyList');

const wordBounds = getWordBoundaries(displayText);

typingShell.addEventListener('click', () => {
    if (!testCompleted) typingInput.focus();
});

document.addEventListener('keydown', (event) => {
    if (testCompleted || event.ctrlKey || event.altKey || event.metaKey) return;
    const activeElement = document.activeElement;
    if (activeElement === typingInput || activeElement instanceof HTMLButtonElement || activeElement instanceof HTMLInputElement) return;
    typingInput.focus();
});

function startTimer(){ startTime = Date.now(); timerInterval = setInterval(updateTimeAndStats, 1000); }
function updateTimeAndStats(){ const elapsed = Math.floor((Date.now()-startTime)/1000); const m = Math.floor(elapsed/60); const s = elapsed%60; timeEl.textContent = m>0?`${m}m ${s}s`:`${s}s`; calculateStats(); }

function scrollToLatestInput(){
    requestAnimationFrame(() => {
        typingInput.scrollTop = typingInput.scrollHeight;
        syncTypingScroll();
    });
}

function keepCursorAtEnd(){
    const value = typingInput.value;
    if (typingInput.selectionStart !== value.length || typingInput.selectionEnd !== value.length) {
        typingInput.setSelectionRange(value.length, value.length);
    }
    scrollToLatestInput();
}

typingInput.addEventListener('mousedown', () => {
    const value = typingInput.value;
    if (typingInput.selectionStart < value.length || typingInput.selectionEnd < value.length) {
        typingInput.setSelectionRange(value.length, value.length);
    }
    scrollToLatestInput();
});

typingInput.addEventListener('select', keepCursorAtEnd);
typingInput.addEventListener('click', keepCursorAtEnd);

typingInput.addEventListener('input', () => {
    if (testCompleted) return;

    if (!startTime) startTimer();

    const value = typingInput.value;
    const caretPos = typingInput.selectionStart;

    if (caretPos !== value.length) {
        typingInput.value = value.slice(0, caretPos);
        typingInput.setSelectionRange(typingInput.value.length, typingInput.value.length);
        return;
    }

    // Allow typing through mistakes. Wrong letters stay red; users can manually backspace and fix the latest typed section.
    typedTextRaw = value;

    renderOverlay();
    renderDisplayFollowingCaret();
    calculateStats();
    typingInput.setSelectionRange(value.length, value.length);
    scrollToLatestInput();

    if (typedTextRaw.length >= displayText.length) {
        finishTest();
    }
});

typingInput.addEventListener('scroll', ()=>{ typingOverlay.scrollTop = typingInput.scrollTop; typingOverlay.scrollLeft = typingInput.scrollLeft; });

function syncTypingScroll(){
    typingOverlay.scrollTop = typingInput.scrollTop;
    typingOverlay.scrollLeft = typingInput.scrollLeft;
}

typingInput.addEventListener('scroll', syncTypingScroll);

function renderOverlay(){
    let html = '';
    for (let index = 0; index < displayText.length; index += 1) {
        if (index === typedTextRaw.length) html += '<span class="typing-caret" aria-hidden="true"></span>';
        const character = index < typedTextRaw.length ? typedTextRaw[index] : displayText[index];
        const type = index >= typedTextRaw.length
            ? 'untyped'
            : character === displayText[index] ? 'correct' : 'incorrect';
        html += `<span class="${type}">${escapeHtml(character)}</span>`;
    }
    if (typedTextRaw.length >= displayText.length) html += '<span class="typing-caret" aria-hidden="true"></span>';
    typingOverlay.innerHTML = html;
    syncMobileTypingHeight();
}

function syncMobileTypingHeight(){
    if (!window.matchMedia('(max-width: 600px)').matches) return;
    requestAnimationFrame(() => {
        const contentHeight = typingOverlay.scrollHeight;
        typingInput.style.height = `${contentHeight}px`;
        typingShell.style.height = `${contentHeight}px`;
    });
}

function renderDisplayFollowingCaret(){ const pos = typedTextRaw.length; if(pos>=displayText.length){ displayTextEl.innerText = displayText; return; } let idx=0; for(let i=0;i<wordBounds.length;i++){ const {start,end}=wordBounds[i]; if(pos<start){ idx=i; break; } if(pos>=start && pos<end){ idx=i; break; } if(pos===end){ idx=Math.min(i+1,wordBounds.length-1); break; } if(i===wordBounds.length-1) idx=i; } let html=''; for(let i=0;i<wordBounds.length;i++){ const wb=wordBounds[i]; const w=escapeHtml(displayText.slice(wb.start,wb.end)); const t=escapeHtml(displayText.slice(wb.end,wb.nextStart)); html += (i===idx)?`<span class="current">${w}</span>${t}`:`${w}${t}`; } displayTextEl.innerHTML = html; }

function calculateStats(){ if(!startTime){ wpmEl.textContent='0'; accuracyEl.textContent='0%'; return; } const words = typedTextRaw.trim().split(/\s+/).filter(Boolean).length; const minutes=(Date.now()-startTime)/60000; const wpm = minutes>0?Math.round(words/minutes):0; let correct=0; const len=Math.min(typedTextRaw.length, displayText.length); for(let i=0;i<len;i++) if(typedTextRaw[i]===displayText[i]) correct++; const acc = displayText.length?Math.round((correct/displayText.length)*100):0; wpmEl.textContent=String(wpm); accuracyEl.textContent=String(acc); }

function finishTest(){ if(!startTime) startTime=Date.now(); testCompleted=true; clearInterval(timerInterval); typingShell.classList.add('locked'); typingInput.readOnly=true; rTime.textContent=timeEl.textContent; rWpm.textContent=wpmEl.textContent; rAcc.textContent=`${accuracyEl.textContent}%`.replace('%%','%'); downloadBtn.classList.remove('hidden'); const completedAt=Date.now(); const item={ name: localStorage.getItem('fullName'), location: localStorage.getItem('location') || localStorage.getItem('sagility-selected-location'), seatNumber: localStorage.getItem('seatNumber'), date: localStorage.getItem('date'), finishedAt: completedAt, finishedTime: rTime.textContent, time: rTime.textContent, wpm: rWpm.textContent, accuracy: accuracyEl.textContent }; saveHistory(item); prependHistoryItem(item); saveSharedResult(item).catch(error => { console.error('Unable to save typing result:', error); alert('The typing result could not be synced. Please try again while connected to the internet.'); }); }

function saveHistory(item){ const h=JSON.parse(localStorage.getItem('typingHistory'))||[]; h.push(item); localStorage.setItem('typingHistory', JSON.stringify(h)); }
async function saveSharedResult(item){
    if (!window.typingFirestore || !window.typingAuthReady) throw new Error('Typing result storage is unavailable.');
    await window.typingAuthReady;
    await window.typingFirestore.collection('typingResults').add({
        name: item.name,
        location: item.location,
        seatNumber: String(item.seatNumber),
        date: item.date,
        finishedAt: item.finishedAt,
        finishedTime: item.finishedTime,
        time: item.time,
        score: Number(item.wpm) || 0,
        accuracy: Number.parseInt(item.accuracy, 10) || 0,
        completedAt: Date.now()
    });
}
function formatHistoryDate(value){ const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/); return match ? `${match[2]}/${match[3]}/${match[1]}` : value || '-'; }
function loadHistoryForCurrentApplicant(){ historyList.innerHTML=''; const h=JSON.parse(localStorage.getItem('typingHistory'))||[]; const n=localStorage.getItem('fullName'); const d=localStorage.getItem('date'); h.filter(x=>x.name===n && x.date===d).reverse().forEach(prependHistoryItem); }
function prependHistoryItem(item){
    const row = document.createElement('tr');
    ['', item.name, item.location || '-', item.seatNumber || '-', formatHistoryDate(item.date), item.time, item.wpm, `${item.accuracy}%`].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
    });
    historyList.insertBefore(row, historyList.firstChild);
    historyList.querySelectorAll('tr').forEach((historyRow, index) => {
        historyRow.cells[0].textContent = String(index + 1);
    });
}

retakeBtn.addEventListener('click', ()=>{ typedTextRaw=''; typingInput.value=''; renderOverlay(); typingShell.classList.remove('locked'); typingInput.readOnly=false; testCompleted=false; startTime=null; timeEl.textContent='0s'; wpmEl.textContent='0'; accuracyEl.textContent='0%'; displayTextEl.innerText=displayText; downloadBtn.classList.add('hidden'); typingInput.focus(); });
newApplicantBtn.addEventListener('click', ()=>{ localStorage.removeItem('fullName'); localStorage.removeItem('location'); localStorage.removeItem('seatNumber'); localStorage.removeItem('date'); window.location.href='login.html'; });

const { jsPDF } = window.jspdf; downloadBtn.addEventListener('click', ()=>{ const doc = new jsPDF(); const name=localStorage.getItem('fullName'); const date=localStorage.getItem('date'); const time=timeEl.textContent; const wpm=wpmEl.textContent; const acc=accuracyEl.textContent; doc.setFontSize(16); doc.text('Typing Test Result',20,20); doc.text(`Name: ${name}`,20,40); doc.text(`Date: ${date}`,20,50); doc.text(`Time Taken: ${time}`,20,60); doc.text(`WPM: ${wpm}`,20,70); doc.text(`Accuracy: ${acc}%`,20,80); doc.text('Typed Text:',20,100); doc.setFontSize(12); doc.text(typedTextRaw,20,110,{maxWidth:170}); doc.save('TypingTestResult.pdf'); });

function getWordBoundaries(text){ const bounds=[]; let i=0,n=text.length; while(i<n){ while(i<n && /\s/.test(text[i])) i++; const start=i; while(i<n && !/\s/.test(text[i])) i++; const end=i; let j=i; while(j<n && /\s/.test(text[j])) j++; bounds.push({start,end,nextStart:j}); } return bounds.filter(b=>b.start<b.end); }
function escapeHtml(str){ return str.replace(/[&<>"']/g, (c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

// Initialize history for current applicant on load
window.addEventListener('DOMContentLoaded', () => {
    renderOverlay();
    loadHistoryForCurrentApplicant();
    typingInput.focus();
});
