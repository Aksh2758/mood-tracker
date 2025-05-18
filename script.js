(() => {
  const moodEmojis = {
    1: '😔', 2: '😐', 3: '😀', 4: '🤩', 5: '😠'
  };
  const moodColors = { // For graph points and day box-shadows
    1: '#f39083', 2: '#e3dca8', 3: '#8bc585', 4: '#8ab0e8', 5: '#cb97db'
  };
  const moodTextLabels = { // Text for the Y-Axis labels
    1: 'Sad',
    2: 'Neutral',
    3: 'Happy',
    4: 'Excited',
    5: 'Angry'
};
  let selectedMood = null;
  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();

  const STORAGE_KEY = 'moodTrackerData';
  let moodsData = loadMoods();

  // DOM References
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

  function formatISODate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function saveMoods() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodsData));
  }

  function loadMoods() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }

  function updateMoodButtonsInputUI() {
    moodButtonsInput.forEach(btn => {
      const isSelected = btn.dataset.mood === selectedMood;
      btn.classList.toggle('border-blue-500', isSelected);
      btn.classList.toggle('shadow-lg', isSelected); // Enhanced shadow for selection
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }

  function updateActionButtonsState() {
    saveMoodBtn.disabled = !selectedMood;
    // showCalendarBtn and showAnalysisBtn are always enabled as per new design
  }

  moodButtonsInput.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMood = (selectedMood === btn.dataset.mood) ? null : btn.dataset.mood;
      updateMoodButtonsInputUI();
      updateActionButtonsState();
    });
  });

  saveMoodBtn.addEventListener('click', () => {
    if (!selectedMood) return;
    const todayKey = formatISODate(today);
    moodsData[todayKey] = selectedMood;
    saveMoods();
    alert("Today's mood has been saved!");
    // Re-render if sections are visible
    if (!calendarSection.classList.contains('hidden')) renderCalendar();
    if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
  });

  showCalendarBtn.addEventListener('click', () => {
    calendarSection.classList.remove('hidden');
    analysisSection.classList.add('hidden');
    dayInputSection.classList.add('hidden'); // Hide input section when viewing others
    renderCalendar();
    calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  showAnalysisBtn.addEventListener('click', () => {
    analysisSection.classList.remove('hidden');
    calendarSection.classList.add('hidden');
    dayInputSection.classList.add('hidden'); // Hide input section when viewing others
    drawMoodGraph();
    analysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function goBackToInput() {
    dayInputSection.classList.remove('hidden');
    calendarSection.classList.add('hidden');
    analysisSection.classList.add('hidden');
    dayInputSection.scrollIntoView({ behavior: 'smooth', block: 'start'});
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

    for (let i = startDay - 1; i >= 0; i--) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day other-month text-gray-300 text-center rounded-lg sm:rounded-xl aspect-square flex items-center justify-center select-none p-1 text-xs sm:text-sm';
      dayElem.textContent = daysInPrevMonth - i;
      daysContainer.appendChild(dayElem);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayElem = document.createElement('div');
      dayElem.className = 'day rounded-lg sm:rounded-xl aspect-square flex flex-col items-center justify-center font-semibold cursor-pointer select-none relative text-gray-700 p-1 text-xs sm:text-sm hover:bg-gray-200 transition-colors';
      const date = new Date(currentYear, currentMonth, day);
      const isoDate = formatISODate(date);
      dayElem.textContent = day;

      if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
        dayElem.classList.add('border-2', 'sm:border-[3px]', 'border-blue-500', 'shadow-sm', 'font-bold');
        dayElem.classList.remove('text-gray-700');
        dayElem.classList.add('text-blue-600');
      }

      if (moodsData[isoDate]) {
        const moodVal = moodsData[isoDate];
        dayElem.classList.add(`mood-${moodVal}`);
        dayElem.classList.remove('hover:bg-gray-200'); // Don't show hover bg if mood is set

        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'emoji-indicator absolute top-0 right-0 sm:top-0.5 sm:right-0.5 text-sm sm:text-lg select-none leading-none';
        emojiSpan.textContent = moodEmojis[moodVal];
        dayElem.appendChild(emojiSpan);
      }

      dayElem.addEventListener('click', () => {
        if (!selectedMood) {
          alert('Please select a mood from the input section first to apply it to a day.');
          // Optionally, allow removing mood even if no new mood is selected
          // if (moodsData[isoDate]) { 
          //   delete moodsData[isoDate];
          //   saveMoods();
          //   renderCalendar();
          //   if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
          // }
          return;
        }
        if (moodsData[isoDate] === selectedMood) { // Click again with same mood to remove
          delete moodsData[isoDate];
        } else {
          moodsData[isoDate] = selectedMood;
        }
        saveMoods();
        renderCalendar();
        if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
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
    
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
        console.warn("MoodGraph: Canvas has no dimensions. Skipping draw.");
        return;
    }
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();
    const moodValues = [];
    for(let day=1; day<=daysInMonth; day++) {
      const isoDate = formatISODate(new Date(currentYear, currentMonth, day));
      moodValues.push(moodsData[isoDate] ? +moodsData[isoDate] : null);
    }
    const allDataIsNull = moodValues.every(val => val === null); 

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const margin = { top: 30, right: 20, bottom: 35, left: 75 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (chartWidth <= 20 || chartHeight <= 20) { 
        ctx.fillStyle = '#777';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '12px Poppins, sans-serif';
        ctx.fillText("Graph area too small.", width / 2, height / 2);
        return;
    }

    
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

    ctx.strokeStyle = '#e5e7eb'; 
    ctx.lineWidth = 0.5; 
    ctx.beginPath();
    // Horizontal lines for moods range (1 to 5)
    for(let i=0; i<=4; i++){ 
      const y = margin.top + (chartHeight / 4) * i;
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
    }
    ctx.stroke();

    // Vertical axis labels for moods 
    ctx.font = 'bold 10px Poppins, sans-serif';
    ctx.textBaseline = 'middle';

    for(let moodVal=1; moodVal<=5; moodVal++) {
      const y = margin.top + (chartHeight / 4) * (moodVal - 1);

      // Draw colored text label
      ctx.fillStyle = moodColors[moodVal] || '#333'; 
      ctx.textAlign = 'right';
      ctx.font = 'bold 10px Poppins, sans-serif';
      ctx.fillText(moodTextLabels[moodVal], margin.left - 5, y); 

      // Draw emoji to the left of the text label
      ctx.fillStyle = '#333'; 
      ctx.textAlign = 'center';
      ctx.font = '14px Arial'; 
      ctx.fillText(moodEmojis[moodVal], margin.left - 55, y); 
    }

    // Horizontal axis: days numbers below axis 
    ctx.fillStyle = '#6b7280'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '10px Poppins, sans-serif';
    const daysCount = moodValues.length;

    const dayLabelWidth = ctx.measureText("31").width;
    const maxXTicks = Math.floor(chartWidth / (dayLabelWidth + 10));
    let xTickStep = Math.ceil(daysCount / maxXTicks);
    if (daysCount > 0 && daysCount <= Math.max(7, maxXTicks)) xTickStep = 1;

    if(daysCount>0){
    for(let i=0; i<daysCount; i++) {
      if ((i+1) % xTickStep === 0 || (i === 0 && daysCount > 0) || (i === daysCount - 1 && (i+1)%xTickStep !==0 && xTickStep !== 1) ) {
        const x = margin.left + ((daysCount === 1 ? 0.5 : i / (daysCount - 1)) * chartWidth);
        ctx.fillText(i+1, x, margin.top + chartHeight + 8);
      }
    }
  }

    // Handle "No Data" case or Plot Data
    if (allDataIsNull && daysCount > 0) { 
      ctx.fillStyle = '#4A5568'; 
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 12px Poppins, sans-serif';
      ctx.fillText("No mood data for this month.", margin.left + chartWidth / 2, margin.top + chartHeight / 2);
    } else if (daysCount > 0) { 
        ctx.lineWidth = 2.2; 
        ctx.strokeStyle = '#4299e1'; 
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        const getYFromMood = mood => {
          if(mood === null) return null;
          return margin.top + chartHeight * ((mood - 1)/4);
        };

        let firstPointInSegment = true; // To handle gaps in data
        for(let i=0; i<daysCount; i++) {
          const mood = moodValues[i];
          if (mood !== null) {
            const x = margin.left + ((daysCount === 1 ? 0.5 : i / (daysCount - 1)) * chartWidth); // Handle single day case
            const y = getYFromMood(mood);
            if (firstPointInSegment) {
              ctx.moveTo(x, y);
              firstPointInSegment = false;
            } else {
              ctx.lineTo(x, y);
            }
          } else {
            firstPointInSegment = true; // Reset for next segment after a gap
          }
        }
        ctx.stroke();

        // MODIFIED: Draw EMOJIS as data points (instead of circles with emojis)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '18px Arial'; // Larger font for data point emojis

        for(let i=0; i<daysCount; i++) {
          const mood = moodValues[i];
          if (mood !== null) {
            const x = margin.left + ((daysCount === 1 ? 0.5 : i / (daysCount - 1)) * chartWidth);
            const y = getYFromMood(mood);

            // Add subtle shadow like target image
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            // Fill with emoji - No need for background circle for this style
            ctx.fillText(moodEmojis[mood], x, y);

            // Reset shadow for subsequent drawings
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
        }
    }
}

  prevBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
    if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
  });

  nextBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
    if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
  });

  resetDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all saved mood data? This cannot be undone.')) {
      moodsData = {};
      saveMoods();
      if (!calendarSection.classList.contains('hidden')) renderCalendar();
      if (!analysisSection.classList.contains('hidden')) drawMoodGraph();
      
      selectedMood = null;
      updateMoodButtonsInputUI();
      updateActionButtonsState();
      // Don't automatically hide, user might want to see the empty state
    }
  });

  // Initial Setup
  updateMoodButtonsInputUI();
  updateActionButtonsState();
  renderCalendar(); 
  drawMoodGraph();

})();