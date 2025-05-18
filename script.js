(() => {
  const moodEmojis = { 1: '😔', 2: '😐', 3: '😀', 4: '🤩', 5: '😠' };
  const moodColors = { 1: '#f39083', 2: '#e3dca8', 3: '#8bc585', 4: '#8ab0e8', 5: '#cb97db' };
  const moodTextLabels = { 1: 'Sad', 2: 'Neutral', 3: 'Happy', 4: 'Excited', 5: 'Angry' };
  let selectedMood = null, today = new Date(), currentYear = today.getFullYear(), currentMonth = today.getMonth();
  const STORAGE_KEY = 'moodTrackerData';
  let moodsData = loadMoods();

  // DOM References
  const dayInputSection = document.getElementById('day-input-section'), moodButtonsInput = document.querySelectorAll('#day-input-section .mood-btn'), 
        saveMoodBtn = document.getElementById('save-mood-btn'), showCalendarBtn = document.getElementById('show-calendar-btn'), 
        showAnalysisBtn = document.getElementById('show-analysis-btn'), calendarSection = document.getElementById('calendar-section'), 
        analysisSection = document.getElementById('analysis-section'), daysContainer = document.querySelector('#calendar-section .days'), 
        monthYearLabel = document.querySelector('#calendar-section .month-year'), prevBtn = document.getElementById('prevMonthBtn'), 
        nextBtn = document.getElementById('nextMonthBtn'), resetDataBtn = document.getElementById('reset-data-btn'), 
        backToInputFromCalendarBtn = document.getElementById('back-to-input-from-calendar-btn'), 
        backToInputFromAnalysisBtn = document.getElementById('back-to-input-from-analysis-btn'), 
        canvas = document.getElementById('moodGraph'), ctx = canvas.getContext('2d');

  function formatISODate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function saveMoods() { localStorage.setItem(STORAGE_KEY, JSON.stringify(moodsData)); }
  function loadMoods() { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : {}; }
  function updateMoodButtonsInputUI() { 
    moodButtonsInput.forEach(btn => {
      const isSelected = btn.dataset.mood === selectedMood;
      btn.classList.toggle('border-blue-500', isSelected); btn.classList.toggle('shadow-lg', isSelected); 
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }
  function updateActionButtonsState() { saveMoodBtn.disabled = !selectedMood; }

  moodButtonsInput.forEach(btn => btn.addEventListener('click', () => {
    selectedMood = (selectedMood === btn.dataset.mood) ? null : btn.dataset.mood;
    updateMoodButtonsInputUI(); updateActionButtonsState();
  }));
  saveMoodBtn.addEventListener('click', () => {
    if (!selectedMood) return;
    const todayKey = formatISODate(today); moodsData[todayKey] = selectedMood; saveMoods();
    alert("Today's mood has been saved!");
    if (!calendarSection.classList.contains('hidden')) renderCalendar();
    if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
  });
  showCalendarBtn.addEventListener('click', () => {
    calendarSection.classList.remove('hidden'); analysisSection.classList.add('hidden'); dayInputSection.classList.add('hidden');
    renderCalendar(); calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  showAnalysisBtn.addEventListener('click', () => {
    analysisSection.classList.remove('hidden'); calendarSection.classList.add('hidden'); dayInputSection.classList.add('hidden');
    drawMoodGraph(); analysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function goBackToInput() { 
    dayInputSection.classList.remove('hidden'); calendarSection.classList.add('hidden'); analysisSection.classList.add('hidden');
    dayInputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  backToInputFromCalendarBtn.addEventListener('click', goBackToInput);
  backToInputFromAnalysisBtn.addEventListener('click', goBackToInput);

  function renderCalendar() {
    if (!daysContainer || !monthYearLabel) return;
    daysContainer.innerHTML = '';
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    monthYearLabel.textContent = `${firstDayOfMonth.toLocaleString('default', { month: 'long' })} ${currentYear}`;
    const startDay = firstDayOfMonth.getDay(), daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(), 
          daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay; i > 0; i--) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day other-month text-gray-300 text-center rounded-lg sm:rounded-xl aspect-square flex items-center justify-center select-none p-1 text-xs sm:text-sm';
      dayElem.textContent = daysInPrevMonth - i + 1; daysContainer.appendChild(dayElem);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day rounded-lg sm:rounded-xl aspect-square flex flex-col items-center justify-center font-semibold cursor-pointer select-none relative text-gray-700 p-1 text-xs sm:text-sm hover:bg-gray-200 transition-colors';
      const date = new Date(currentYear, currentMonth, day), isoDate = formatISODate(date);
      dayElem.textContent = day;
      if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
        dayElem.classList.add('border-2', 'sm:border-[3px]', 'border-blue-500', 'shadow-sm', 'font-bold', 'text-blue-600');
        dayElem.classList.remove('text-gray-700');
      }
      if (moodsData[isoDate]) {
        const moodVal = moodsData[isoDate];
        dayElem.classList.add(`mood-${moodVal}`); dayElem.classList.remove('hover:bg-gray-200');
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'emoji-indicator text-base sm:text-xl select-none leading-none mt-1';
        emojiSpan.textContent = moodEmojis[moodVal]; dayElem.appendChild(emojiSpan);
      }
      dayElem.addEventListener('click', () => {
        if (!selectedMood) { alert('Please select a mood from the input section first to apply it to a day.'); return; }
        if (moodsData[isoDate] === selectedMood) delete moodsData[isoDate]; else moodsData[isoDate] = selectedMood;
        saveMoods(); renderCalendar();
        if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
      });
      daysContainer.appendChild(dayElem);
    }
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
    for (let i = 1; i <= totalCells - (startDay + daysInMonth); i++) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day other-month text-gray-300 text-center rounded-lg sm:rounded-xl aspect-square flex items-center justify-center select-none p-1 text-xs sm:text-sm';
      dayElem.textContent = i; daysContainer.appendChild(dayElem);
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
      return moodsData[isoDate] ? +moodsData[isoDate] : null;
    });
    const allDataIsNull = moodValues.every(val => val === null);

    const margin = { top: 30, right: 20, bottom: 35, left: 75 }, 
          chartWidth = canvas.clientWidth - margin.left - margin.right, chartHeight = canvas.clientHeight - margin.top - margin.bottom,
          yAxisPadding = 15, xAxisPadding = 10, effectiveChartHeight = chartHeight - (2 * yAxisPadding), 
          effectiveChartWidth = chartWidth - (2 * xAxisPadding);

    if (chartWidth <= 0 || chartHeight <= 0) { console.warn("MoodGraph: Overall chart dimensions are too small. Skipping draw."); return; }
    if (effectiveChartWidth <= 0 || effectiveChartHeight <= 0) { console.warn("MoodGraph: Effective plotting area is too small after padding. Consider reducing padding or increasing canvas size."); }

    ctx.fillStyle = 'rgba(29, 36, 44, 0.85)'; ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

    // Horizontal grid lines 
    ctx.strokeStyle = '#4A5568'; ctx.lineWidth = 0.5; ctx.beginPath();
    if (effectiveChartHeight > 0) {
      for (let i = 0; i <= 4; i++) {
        const y = margin.top + yAxisPadding + (effectiveChartHeight / 4) * i;
        ctx.moveTo(margin.left + xAxisPadding, y); ctx.lineTo(margin.left + xAxisPadding + effectiveChartWidth, y);
      }
    }
    ctx.stroke();

    // Y-axis labels
    ctx.textBaseline = 'middle';
    if (effectiveChartHeight > 0) {
      for (let MoodVal = 1; MoodVal <= 5; MoodVal++) {
        const y = margin.top + yAxisPadding + effectiveChartHeight * ((MoodVal - 1) / 4);
        ctx.textAlign = 'right'; ctx.fillStyle = moodColors[MoodVal] || '#E2E8F0'; ctx.font = 'bold 10px Poppins, sans-serif';
        ctx.fillText(moodTextLabels[MoodVal], margin.left - 10, y);
        ctx.textAlign = 'center'; ctx.font = '14px Arial'; ctx.fillText(moodEmojis[MoodVal], margin.left - 60, y);
      }
    }

    // X-axis day labels 
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

    // No data message 
    if (allDataIsNull && daysCount > 0) {
      ctx.fillStyle = '#CBD5E0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 12px Poppins, sans-serif';
      ctx.fillText("No mood data for this month.", margin.left + xAxisPadding + effectiveChartWidth / 2, margin.top + yAxisPadding + effectiveChartHeight / 2);
      return;
    }

    const getXForDataPoint = dayIndex => effectiveChartWidth <= 0 ? margin.left + chartWidth / 2 : 
          daysCount === 1 ? margin.left + xAxisPadding + effectiveChartWidth / 2 : margin.left + xAxisPadding + (dayIndex / (daysCount - 1)) * effectiveChartWidth;

    // Draw mood line
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

    // Draw mood emojis as data points
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.font = '12px Arial';
    for (let i = 0; i < daysCount; i++) {
      const mood = moodValues[i];
      if (mood !== null) ctx.fillText(moodEmojis[mood], getXForDataPoint(i), getYFromMood(mood));
    }
  }

  prevBtn.addEventListener('click', () => {
    currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar(); if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
  });
  nextBtn.addEventListener('click', () => {
    currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar(); if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
  });
  resetDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all saved mood data? This cannot be undone.')) {
      moodsData = {}; saveMoods();
      if (!calendarSection.classList.contains('hidden')) renderCalendar();
      if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
      selectedMood = null; updateMoodButtonsInputUI(); updateActionButtonsState();
    }
  });

  updateMoodButtonsInputUI(); updateActionButtonsState(); renderCalendar(); drawMoodGraph();
})();

// Emoji Background Animation
(() => {
  const bgCanvas = document.getElementById('emojiBackgroundCanvas');
  if (!bgCanvas) { console.error("Background canvas not found!"); return; }
  const bgCtx = bgCanvas.getContext('2d'), backgroundEmojiChars = ['😀', '😔', '😠', '😐', '🤩', '🥳', '😴', '🤔', '🥰', '😢'], 
        emojis = [], numberOfEmojis = 30, baseEmojiSize = 20, maxEmojiSize = 40, baseSpeed = 0.3;

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