(() => {
  const moodEmojis = {
    1: '😔', // Sad
    2: '😐', // Neutral
    3: '😀', // Happy
    4: '🤩', // Excited
    5: '😠'  // Angry
  };
  const moodColors = {
    1: '#f39083',
    2: '#e3dca8',
    3: '#8bc585',
    4: '#8ab0e8',
    5: '#cb97db'
  };

  let selectedMood = null;

  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();

  const STORAGE_KEY = 'moodTrackerData';
  let moodsData = loadMoods();

  // DOM references
  const moodButtonsInput = document.querySelectorAll('#day-input-section .mood-btn');
  const goToCalendarBtn = document.getElementById('go-to-calendar-btn');
  const calendarSection = document.getElementById('calendar-section');
  const daysContainer = document.querySelector('.days');
  const monthYearLabel = document.querySelector('.month-year');
  const prevBtn = document.getElementById('prevMonthBtn');
  const nextBtn = document.getElementById('nextMonthBtn');
  const resetDataBtn = document.getElementById('reset-data-btn');
  const showAnalysisBtn = document.getElementById('show-analysis-btn');
  const moodGraphSection = document.getElementById('mood-graph-section');
  const canvas = document.getElementById('moodGraph');
  const ctx = canvas.getContext('2d');

  function formatISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function saveMoods() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodsData));
  }

  function loadMoods() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }

  // Update mood buttons UI in the input section
  function updateMoodButtonsInput() {
    moodButtonsInput.forEach(btn => {
      const isSelected = btn.dataset.mood === selectedMood;
      btn.classList.toggle('border-blue-500', isSelected);
      btn.classList.toggle('shadow-lg', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }

  function updateGoToCalendarBtn() {
    goToCalendarBtn.disabled = !selectedMood;
  }

  moodButtonsInput.forEach(btn => {
    btn.addEventListener('click', () => {
      if (selectedMood === btn.dataset.mood) {
        selectedMood = null;
      } else {
        selectedMood = btn.dataset.mood;
      }
      updateMoodButtonsInput();
      updateGoToCalendarBtn();
    });
  });

  function renderCalendar() {
    daysContainer.innerHTML = '';
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const monthName = firstDayOfMonth.toLocaleString('default', {month: 'long'});
    monthYearLabel.textContent = `${monthName} ${currentYear}`;

    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    for(let i = startDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dayElem = document.createElement('div');
      dayElem.className = 'day other-month';
      dayElem.textContent = dayNum;
      daysContainer.appendChild(dayElem);
    }

    for(let day = 1; day <= daysInMonth; day++) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day';
      const date = new Date(currentYear, currentMonth, day);
      const isoDate = formatISODate(date);
      dayElem.textContent = day;

      if (
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
      ) {
        dayElem.classList.add('today');
      }

      if (moodsData[isoDate]) {
        const moodVal = moodsData[isoDate];
        dayElem.classList.add(`mood-${moodVal}`);

        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'emoji-indicator';
        emojiSpan.textContent = moodEmojis[moodVal];
        dayElem.appendChild(emojiSpan);
      }

      dayElem.addEventListener('click', () => {
        if (!selectedMood) {
          alert('Please select a mood from above first.');
          return;
        }
        if (moodsData[isoDate] == selectedMood) {
          delete moodsData[isoDate];
        } else {
          moodsData[isoDate] = selectedMood;
        }
        saveMoods();
        renderCalendar();
        drawMoodGraph();
      });

      daysContainer.appendChild(dayElem);
    }

    const totalCells = 42;
    const filledCells = startDay + daysInMonth;
    for(let i = 1; i <= totalCells - filledCells; i++) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day other-month';
      dayElem.textContent = i;
      daysContainer.appendChild(dayElem);
    }
  }

  function drawMoodGraph() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const moodValues = [];

    for(let day=1; day<=daysInMonth; day++) {
      const isoDate = formatISODate(new Date(currentYear, currentMonth, day));
      moodValues.push(moodsData[isoDate] ? +moodsData[isoDate] : null);
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const margin = 38;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;
    const daysCount = moodValues.length;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<=4; i++) {
      const y = margin + (chartHeight / 4) * i;
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#555';
    ctx.font = '13px Poppins, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const moodLabels = {
      1: 'Sad 😔',
      2: 'Neutral 😐',
      3: 'Happy 😀',
      4: 'Excited 🤩',
      5: 'Angry 😠',
    };

    for(let moodVal = 1; moodVal <= 5; moodVal++) {
      const y = margin + (chartHeight / 4) * (moodVal - 1);
      ctx.fillStyle = moodColors[moodVal];
      ctx.fillText(moodLabels[moodVal], margin - 12, y);
    }

    ctx.fillStyle = '#777';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '11px Poppins, sans-serif';
    for(let i=0; i<daysCount; i++) {
      if ((i+1) % Math.ceil(daysCount / 6) === 1 || i === daysCount - 1) {
        const x = margin + (chartWidth / (daysCount - 1)) * i;
        ctx.fillText(i + 1, x, margin + chartHeight + 6);
      }
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4a90e2';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    const getYFromMood = mood => {
      if (mood === null) return null;
      return margin + chartHeight * ((mood - 1) / 4);
    };

    let started = false;
    for(let i=0; i<daysCount; i++) {
      const mood = moodValues[i];
      if (mood !== null) {
        const x = margin + (chartWidth / (daysCount - 1)) * i;
        const y = getYFromMood(mood);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    }
    ctx.stroke();

    for(let i=0; i<daysCount; i++) {
      const mood = moodValues[i];
      if (mood !== null) {
        const x = margin + (chartWidth / (daysCount - 1)) * i;
        const y = getYFromMood(mood);
        ctx.fillStyle = moodColors[mood];
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#222';
        ctx.fillText(moodEmojis[mood], x, y + 1);
      }
    }
  }

  // Handle Go to Calendar button click
  goToCalendarBtn.addEventListener('click', () => {
    if (!selectedMood) return;
    const todayKey = formatISODate(today);
    moodsData[todayKey] = selectedMood;
    saveMoods();

    selectedMood = null;
    updateMoodButtonsInput();
    updateGoToCalendarBtn();

    calendarSection.classList.remove('hidden');
    calendarSection.scrollIntoView({behavior: 'smooth', block: 'start'});
    renderCalendar();
    drawMoodGraph();
    moodGraphSection.classList.add('hidden'); // hide graph initially
    showAnalysisBtn.textContent = 'Show Analysis';
  });

  // Month navigation buttons
  prevBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
    drawMoodGraph();
  });

  nextBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
    drawMoodGraph();
  });

  // Reset all data button
  resetDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all saved mood data? This cannot be undone.')) {
      moodsData = {};
      saveMoods();
      renderCalendar();
      drawMoodGraph();

      selectedMood = null;
      updateMoodButtonsInput();
      updateGoToCalendarBtn();

      document.getElementById('day-input-section').scrollIntoView({behavior: 'smooth'});
      calendarSection.classList.add('hidden');
      moodGraphSection.classList.add('hidden');
      showAnalysisBtn.textContent = 'Show Analysis';
    }
  });

  // Show Analysis button toggles graph section
  showAnalysisBtn.addEventListener('click', () => {
    if (moodGraphSection.classList.contains('hidden')) {
      moodGraphSection.classList.remove('hidden');
      showAnalysisBtn.textContent = 'Hide Analysis';
      drawMoodGraph();
      moodGraphSection.scrollIntoView({behavior: 'smooth', block: 'start'});
    } else {
      moodGraphSection.classList.add('hidden');
      showAnalysisBtn.textContent = 'Show Analysis';
    }
  });

  // On load, if user already entered today's mood, show calendar by default
  const todayKey = formatISODate(today);
  if (moodsData[todayKey]) {
    calendarSection.classList.remove('hidden');
    renderCalendar();
    drawMoodGraph();
  }

  updateMoodButtonsInput();
  updateGoToCalendarBtn();

})();
