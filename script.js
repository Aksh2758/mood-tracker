(() => {
  const moodEmojis = { 1: '😔', 2: '😐', 3: '😀', 4: '🤩', 5: '😠' };
  const moodColors = { 1: '#f39083', 2: '#e3dca8', 3: '#8bc585', 4: '#8ab0e8', 5: '#cb97db' };
  const moodTextLabels = { 1: 'Sad', 2: 'Neutral', 3: 'Happy', 4: 'Excited', 5: 'Angry' };
  const moodNotePrompts = {
    '1': {placeholder: "Describe why you're feeling sad today..." },
    '2': {placeholder: "How was your day overall?" },
    '3': {placeholder: "Share the Happiness!" },
    '4': {placeholder: "What's got you buzzing?" },
    '5': {placeholder: "Vent about what made you angry..." }
  };
  let selectedMood = null;
  const today = new Date(); 
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();
  const STORAGE_KEY = 'moodTrackerData'; 
  let moodsData = loadMoods();

  // DOM References
  const mainAppTitle = document.getElementById('main-app-title');
  const dayInputSection = document.getElementById('day-input-section');
  const moodButtonsInput = document.querySelectorAll('#day-input-section .mood-btn');
  const saveMoodBtn = document.getElementById('save-mood-btn');
  const showCalendarBtn = document.getElementById('show-calendar-btn');
  const showAnalysisBtn = document.getElementById('show-analysis-btn');
  const calendarSection = document.getElementById('calendar-section');
  const analysisSection = document.getElementById('analysis-section');
  const daysContainer = document.querySelector('#calendar-section .days');
  const monthYearLabel = document.querySelector('#calendar-section .month-year');
  const prevBtn = document.getElementById('prevMonthBtn');
  const nextBtn = document.getElementById('nextMonthBtn');
  const resetDataBtn = document.getElementById('reset-data-btn');
  const backToInputFromCalendarBtn = document.getElementById('back-to-input-from-calendar-btn');
  const backToInputFromAnalysisBtn = document.getElementById('back-to-input-from-analysis-btn');
  const canvas = document.getElementById('moodGraph');
  const ctx = canvas.getContext('2d');
  const noteInputContainer = document.getElementById('note-input-container');
  const moodNoteTextarea = document.getElementById('mood-note');
  const notePromptLabel = document.getElementById('note-prompt');
  const calendarNoteDisplaySection = document.getElementById('calendar-note-display-section');
  const selectedDateForNoteSpan = document.getElementById('selected-date-for-note');
  const displayedMoodEmojiDiv = document.getElementById('displayed-mood-emoji');
  const displayedNoteTextP = document.getElementById('displayed-note-text');
  const noNoteMessageP = document.getElementById('no-note-message'); 
  const noNoteRecordedMessageP = document.getElementById('no-note-recorded-message'); 

  function formatISODate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }

  function saveMoods() { localStorage.setItem(STORAGE_KEY, JSON.stringify(moodsData)); }

  function loadMoods() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsedData = JSON.parse(saved);
            for (const key in parsedData) {
                if (typeof parsedData[key] === 'string') { 
                    parsedData[key] = { mood: parsedData[key], note: "" };
                }
            }
            return parsedData;
        } catch (e) {
            console.error("Error parsing moods data, resetting.", e);
            return {};
        }
    }
    return {};
  }

  function updateMoodButtonsInputUI() {
    moodButtonsInput.forEach(btn => {
      const isSelected = btn.dataset.mood === selectedMood;
      btn.classList.toggle('border-blue-500', isSelected);
      btn.classList.toggle('shadow-lg', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
    if (selectedMood) {
      noteInputContainer.classList.remove('hidden');
      const prompts = moodNotePrompts[selectedMood];
      if (prompts) {
        notePromptLabel.textContent = prompts.prompt;
        moodNoteTextarea.placeholder = prompts.placeholder;
      } else {
        notePromptLabel.textContent = "Add a note (optional):";
        moodNoteTextarea.placeholder = "What happened today?";
      }
    } else {
      noteInputContainer.classList.add('hidden');
      moodNoteTextarea.value = ''; 
    }
  }

  function updateActionButtonsState() { saveMoodBtn.disabled = !selectedMood; }

  moodButtonsInput.forEach(btn => btn.addEventListener('click', () => {
    selectedMood = (selectedMood === btn.dataset.mood) ? null : btn.dataset.mood;
    updateMoodButtonsInputUI();
    updateActionButtonsState();
  }));

  saveMoodBtn.addEventListener('click', () => {
    if (!selectedMood) return;
    const todayKey = formatISODate(new Date()); 
    const noteText = moodNoteTextarea.value.trim();

    moodsData[todayKey] = { mood: selectedMood, note: noteText };
    saveMoods();
    alert("Today's mood and note have been saved!");

    selectedMood = null;
    moodNoteTextarea.value = '';
    updateMoodButtonsInputUI();
    updateActionButtonsState();

    if (!calendarSection.classList.contains('hidden')) renderCalendar();
    if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
  });

  showCalendarBtn.addEventListener('click', () => {
    mainAppTitle.classList.add('hidden');
    calendarSection.classList.remove('hidden');
    analysisSection.classList.add('hidden');
    dayInputSection.classList.add('hidden');
    calendarNoteDisplaySection.classList.add('hidden'); 
    renderCalendar();
    calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  showAnalysisBtn.addEventListener('click', () => {
    mainAppTitle.classList.add('hidden'); 
    analysisSection.classList.remove('hidden');
    calendarSection.classList.add('hidden');
    dayInputSection.classList.add('hidden');
    calendarNoteDisplaySection.classList.add('hidden'); 
    drawMoodGraph();
    analysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function goBackToInput() {
    mainAppTitle.classList.remove('hidden'); 
    dayInputSection.classList.remove('hidden');
    calendarSection.classList.add('hidden');
    analysisSection.classList.add('hidden');
    calendarNoteDisplaySection.classList.add('hidden'); 
    dayInputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  backToInputFromCalendarBtn.addEventListener('click', goBackToInput);
  backToInputFromAnalysisBtn.addEventListener('click', goBackToInput);

  function renderCalendar() {
    if (!daysContainer || !monthYearLabel) return;
    daysContainer.innerHTML = '';
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    monthYearLabel.textContent = `${firstDayOfMonth.toLocaleString('default', { month: 'long' })} ${currentYear}`;

    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    for (let i = startDay; i > 0; i--) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day other-month text-gray-300 text-center rounded-lg sm:rounded-xl aspect-square flex items-center justify-center select-none p-1 text-xs sm:text-sm';
      dayElem.textContent = daysInPrevMonth - i + 1;
      daysContainer.appendChild(dayElem);
    }

    const todayDate = new Date(); 

    for (let day = 1; day <= daysInMonth; day++) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day rounded-lg sm:rounded-xl aspect-square flex flex-col items-center justify-center font-semibold cursor-pointer select-none relative text-gray-700 p-1 text-xs sm:text-sm hover:bg-gray-100 transition-colors'; 
      const date = new Date(currentYear, currentMonth, day);
      const isoDate = formatISODate(date);
      dayElem.textContent = day;

      if (day === todayDate.getDate() && currentMonth === todayDate.getMonth() && currentYear === todayDate.getFullYear()) {
        dayElem.classList.add('border-2', 'sm:border-[3px]', 'border-blue-500', 'shadow-sm', 'font-bold', 'text-blue-600');
        dayElem.classList.remove('text-gray-700');
      }

      const dayData = moodsData[isoDate];
      if (dayData && dayData.mood) { 
        const moodVal = dayData.mood;
        dayElem.classList.add(`mood-${moodVal}`);
        dayElem.classList.remove('hover:bg-gray-100'); 
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'emoji-indicator text-base sm:text-xl select-none leading-none mt-1';
        emojiSpan.textContent = moodEmojis[moodVal];
        dayElem.appendChild(emojiSpan);
      }

      dayElem.addEventListener('click', () => {
        const clickedDateData = moodsData[isoDate];
        selectedDateForNoteSpan.textContent = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        if (clickedDateData && clickedDateData.mood) {
          displayedMoodEmojiDiv.textContent = moodEmojis[clickedDateData.mood];
          displayedMoodEmojiDiv.classList.remove('hidden');
          noNoteMessageP.classList.add('hidden');

          if (clickedDateData.note && clickedDateData.note.trim() !== "") {
            displayedNoteTextP.textContent = clickedDateData.note;
            displayedNoteTextP.classList.remove('hidden');
            noNoteRecordedMessageP.classList.add('hidden');
          } else {
            displayedNoteTextP.classList.add('hidden');
            noNoteRecordedMessageP.classList.remove('hidden');
          }
        } else {
          displayedMoodEmojiDiv.classList.add('hidden');
          displayedNoteTextP.classList.add('hidden');
          noNoteRecordedMessageP.classList.add('hidden');
          noNoteMessageP.classList.remove('hidden'); 
        }
        calendarNoteDisplaySection.classList.remove('hidden');
        calendarNoteDisplaySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      daysContainer.appendChild(dayElem);
    }

    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    for (let i = 1; i <= totalCells - (startDay + daysInMonth); i++) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day other-month text-gray-300 text-center rounded-lg sm:rounded-xl aspect-square flex items-center justify-center select-none p-1 text-xs sm:text-sm';
      dayElem.textContent = i;
      daysContainer.appendChild(dayElem);
    }
  }

  function drawMoodGraph() {
    const dpr = window.devicePixelRatio || 1;
    if (!canvas || !ctx) { console.error("Canvas or context not defined."); return; }
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) { console.warn("MoodGraph: Canvas has no dimensions. Skipping draw."); return; }

    canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const moodValues = Array.from({ length: daysInMonth }, (_, day) => {
      const isoDate = formatISODate(new Date(currentYear, currentMonth, day + 1));
      const dayData = moodsData[isoDate];
      return dayData && dayData.mood ? +dayData.mood : null; 
    });
    const allDataIsNull = moodValues.every(val => val === null);

    const margin = { top: 30, right: 20, bottom: 35, left: 75 },
          chartWidth = canvas.clientWidth - margin.left - margin.right, chartHeight = canvas.clientHeight - margin.top - margin.bottom,
          yAxisPadding = 15, xAxisPadding = 10, effectiveChartHeight = chartHeight - (2 * yAxisPadding),
          effectiveChartWidth = chartWidth - (2 * xAxisPadding);

    if (chartWidth <= 0 || chartHeight <= 0) { console.warn("MoodGraph: Overall chart dimensions are too small. Skipping draw."); return; }
    if (effectiveChartWidth <= 0 || effectiveChartHeight <= 0) { console.warn("MoodGraph: Effective plotting area is too small after padding."); }

    ctx.fillStyle = 'rgba(29, 36, 44, 0.85)'; ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

    ctx.strokeStyle = '#4A5568'; ctx.lineWidth = 0.5; ctx.beginPath();
    if (effectiveChartHeight > 0) {
      for (let i = 0; i <= 4; i++) {
        const y = margin.top + yAxisPadding + (effectiveChartHeight / 4) * i;
        ctx.moveTo(margin.left + xAxisPadding, y); ctx.lineTo(margin.left + xAxisPadding + effectiveChartWidth, y);
      }
    }
    ctx.stroke();
    // Y-axis
    ctx.textBaseline = 'middle';
    if (effectiveChartHeight > 0) {
      for (let MoodVal = 1; MoodVal <= 5; MoodVal++) {
        const y = margin.top + yAxisPadding + effectiveChartHeight * ((MoodVal - 1) / 4);
        ctx.textAlign = 'right'; ctx.fillStyle = moodColors[MoodVal] || '#E2E8F0'; ctx.font = 'bold 10px Poppins, sans-serif';
        ctx.fillText(moodTextLabels[MoodVal], margin.left - 10, y);
        ctx.textAlign = 'center'; ctx.font = '14px Arial'; ctx.fillText(moodEmojis[MoodVal], margin.left - 60, y); 
      }
    }
    // X-axis 
    const daysCount = moodValues.length; ctx.fillStyle = '#A0AEC0'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.font = '10px Poppins, sans-serif';
    if (daysCount > 0 && effectiveChartWidth > 0) {
      const dayLabelWidth = ctx.measureText("31").width, minSpacing = 5,
            maxXTicks = Math.max(1, Math.floor(effectiveChartWidth / (dayLabelWidth + minSpacing)));
      let xTickStep = Math.ceil(daysCount / maxXTicks); if (xTickStep < 1) xTickStep = 1;
      if (daysCount > 1 && daysCount <= Math.max(7, maxXTicks) && xTickStep > 1) xTickStep = 1;
      
      const getXForDayLabel = (dayIndex) => daysCount === 1 ? margin.left + xAxisPadding + effectiveChartWidth / 2 : margin.left + xAxisPadding + (dayIndex / (daysCount - 1)) * effectiveChartWidth;

      for (let i = 0; i < daysCount; i++) {
        const dayNumber = i + 1, shouldDrawTick = (dayNumber % xTickStep === 0) || (i === 0) ||
              (i === daysCount - 1 && (dayNumber % xTickStep !== 0 || xTickStep === daysCount) && xTickStep !== 1);
        if (shouldDrawTick) ctx.fillText(dayNumber.toString(), getXForDayLabel(i), margin.top + chartHeight + 8);
      }
    }
    // No data 
    if (allDataIsNull && daysCount > 0) {
      ctx.fillStyle = '#CBD5E0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 12px Poppins, sans-serif';
      ctx.fillText("No mood data for this month.", margin.left + xAxisPadding + effectiveChartWidth / 2, margin.top + yAxisPadding + effectiveChartHeight / 2);
      return;
    }
    // Draw mood line
    const getXForDataPoint = dayIndex => effectiveChartWidth <= 0 ? margin.left + chartWidth / 2 :
          daysCount === 1 ? margin.left + xAxisPadding + effectiveChartWidth / 2 : margin.left + xAxisPadding + (dayIndex / (daysCount - 1)) * effectiveChartWidth;

    ctx.lineWidth = 2.2; ctx.strokeStyle = '#4299e1'; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
    const getYFromMood = mood => margin.top + yAxisPadding + effectiveChartHeight * ((mood - 1) / 4);
    let started = false;
    for (let i = 0; i < daysCount; i++) {
      const mood = moodValues[i];
      if (mood !== null) {
        const x = getXForDataPoint(i), y = getYFromMood(mood);
        if (!started) { ctx.moveTo(x, y); started = true; }
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    //Emoji as data points
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.font = '14px Arial';
    for (let i = 0; i < daysCount; i++) {
      const mood = moodValues[i];
      if (mood !== null) ctx.fillText(moodEmojis[mood], getXForDataPoint(i), getYFromMood(mood));
    }
  }

  prevBtn.addEventListener('click', () => {
    currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    calendarNoteDisplaySection.classList.add('hidden'); 
    renderCalendar(); if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
  });
  nextBtn.addEventListener('click', () => {
    currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    calendarNoteDisplaySection.classList.add('hidden'); 
    renderCalendar(); if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
  });
  resetDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all saved mood data? This cannot be undone.')) {
      moodsData = {}; saveMoods();
      selectedMood = null;
      moodNoteTextarea.value = ''; 
      updateMoodButtonsInputUI();
      updateActionButtonsState();
      calendarNoteDisplaySection.classList.add('hidden'); 
      if (!calendarSection.classList.contains('hidden')) renderCalendar();
      if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
      alert("All mood data has been reset.");
    }
  });

  // Sample Data Initialization
  function initializeWithSampleData() {
    if (Object.keys(moodsData).length === 0) { 
        const todayDt = new Date();
        const yesterday = new Date(todayDt);
        yesterday.setDate(todayDt.getDate() - 1);
        const twoDaysAgo = new Date(todayDt);
        twoDaysAgo.setDate(todayDt.getDate() - 2);
        const threeDaysAgo = new Date(todayDt);
        threeDaysAgo.setDate(todayDt.getDate() - 3);
        moodsData[formatISODate(threeDaysAgo)] = { mood: '3', note: "Had a wonderful day with friends! We went to the park and enjoyed the sunshine." };
        moodsData[formatISODate(twoDaysAgo)] = { mood: '1', note: "Feeling a bit down today. Work was quite stressful and I couldn't catch a break." };
        moodsData[formatISODate(yesterday)] = { mood: '4', note: "Super excited! Got tickets to my favorite band's concert next month!" };
        saveMoods(); 
        console.log("Initialized with sample mood data.");
    }
  }
  initializeWithSampleData(); 
  updateMoodButtonsInputUI();
  updateActionButtonsState();
  renderCalendar(); 
})();

// Emoji Background Animation
(() => {
  const bgCanvas = document.getElementById('emojiBackgroundCanvas');
  if (!bgCanvas) { console.error("Background canvas not found!"); return; }
  const bgCtx = bgCanvas.getContext('2d'), backgroundEmojiChars = ['😀', '😔', '😠', '😐', '🤩', '🥳', '😴', '🤔', '🥰', '😢','🤣','😎','🤠','🤑','🤤','😉','🤯'], 
        emojis = [], numberOfEmojis = 45, baseEmojiSize = 20, maxEmojiSize = 40, baseSpeed = 0.3;

  function resizeCanvas() { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight; }

  class FloatingEmoji {
    constructor() {
      this.emojiChar = backgroundEmojiChars[Math.floor(Math.random() * backgroundEmojiChars.length)];
      this.size = Math.random() * (maxEmojiSize - baseEmojiSize) + baseEmojiSize;
      this.x = Math.random() * bgCanvas.width; this.y = Math.random() * bgCanvas.height;
      this.opacity = Math.random() * 0.3 + 0.1;
      const angle = Math.random() * Math.PI * 2, speed = (Math.random() * 0.5 + 0.5) * baseSpeed;
      this.dx = Math.cos(angle) * speed; this.dy = Math.sin(angle) * speed;
    }
    draw() {
      bgCtx.save(); bgCtx.globalAlpha = this.opacity; bgCtx.font = `${this.size}px Arial`;
      bgCtx.textAlign = 'center'; bgCtx.textBaseline = 'middle';
      bgCtx.translate(this.x, this.y); bgCtx.rotate(this.rotation); bgCtx.fillText(this.emojiChar, 0, 0);
      bgCtx.restore();
    }
    update() {
      this.x += this.dx; this.y += this.dy; this.rotation += this.rotationSpeed;
      if (this.x - this.size > bgCanvas.width) { this.x = -this.size; this.y = Math.random() * bgCanvas.height; }
      else if (this.x + this.size < 0) { this.x = bgCanvas.width + this.size; this.y = Math.random() * bgCanvas.height; }
      if (this.y - this.size > bgCanvas.height) { this.y = -this.size; this.x = Math.random() * bgCanvas.width; }
      else if (this.y + this.size < 0) { this.y = bgCanvas.height + this.size; this.x = Math.random() * bgCanvas.width; }
    }
  }

  function initEmojis() { emojis.length = 0; for (let i = 0; i < numberOfEmojis; i++) emojis.push(new FloatingEmoji()); }
  function animateBackground() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    emojis.forEach(emoji => { emoji.update(); emoji.draw(); });
    requestAnimationFrame(animateBackground);
  }

  window.addEventListener('resize', resizeCanvas); resizeCanvas(); initEmojis(); animateBackground();
})();