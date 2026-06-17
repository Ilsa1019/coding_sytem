// Circumference of the SVG progress ring (radius = 50)
const RING_CIRCUMFERENCE = 2 * Math.PI * 50;

document.addEventListener('DOMContentLoaded', () => {
    // Set up the circular progress ring defaults
    const circle = document.getElementById('progress-circle');
    if (circle) {
        circle.style.strokeDasharray = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
        circle.style.strokeDashoffset = RING_CIRCUMFERENCE;
    }
});

// Handle Form Submission
async function submitFortune(event) {
    event.preventDefault();

    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    
    const selectedZodiacRadio = document.querySelector('input[name="zodiac"]:checked');
    if (!selectedZodiacRadio) {
        alert('星座を選択してください。');
        return;
    }
    const zodiac = selectedZodiacRadio.value;

    if (!name) {
        alert('お名前を入力してください。');
        return;
    }

    // Dom elements
    const inputSection = document.getElementById('input-section');
    const loadingSection = document.getElementById('loading-section');
    const resultSection = document.getElementById('result-section');

    // Switch to loading state with smooth transitions
    inputSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    loadingSection.classList.add('fade-in');

    const startTime = Date.now();

    try {
        const response = await fetch('/api/fortune', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, zodiac })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || '通信エラーが発生しました。');
        }

        const data = await response.json();

        // Calculate time taken to ensure loading shows for at least 1.8 seconds (magical feel)
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 1800 - elapsed);

        setTimeout(() => {
            displayFortune(data);
        }, delay);

    } catch (error) {
        console.error(error);
        alert(error.message || 'エラーが発生しました。もう一度お試しください。');
        
        // Go back to input
        loadingSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
    }
}

// Display Fortune Results
function displayFortune(data) {
    const loadingSection = document.getElementById('loading-section');
    const resultSection = document.getElementById('result-section');

    // Populate data
    document.getElementById('result-date').textContent = data.date.replace(/-/g, '.');
    document.getElementById('display-name').textContent = data.name;
    document.getElementById('display-zodiac').textContent = data.zodiac;
    
    // Set Rank & Custom Glowing Theme
    const rankEl = document.getElementById('fortune-rank');
    const glowEl = rankEl.previousElementSibling; // fortune-badge-glow
    
    rankEl.textContent = data.rank;
    
    // Clear previous rank classes
    rankEl.className = 'fortune-rank';
    glowEl.className = 'fortune-badge-glow';
    
    // Assign specific color scheme classes
    let rankClass = '';
    switch(data.rank) {
        case '超大吉': rankClass = 'chodaikichi'; break;
        case '大吉': rankClass = 'daikichi'; break;
        case '吉': rankClass = 'kichi'; break;
        case '中吉': rankClass = 'chukichi'; break;
        case '小吉': rankClass = 'shokichi'; break;
        case '末吉': rankClass = 'suekichi'; break;
        default: rankClass = 'half'; break;
    }
    
    rankEl.classList.add(`rank-${rankClass}`);
    glowEl.classList.add(`rank-${rankClass}-glow`);

    // Set Advice Message
    document.getElementById('fortune-message').textContent = data.message;

    // Set Lucky Factors
    document.getElementById('lucky-item').textContent = data.lucky_item;
    document.getElementById('lucky-color').textContent = data.lucky_color.name;
    
    const colorPreview = document.getElementById('lucky-color-preview');
    colorPreview.style.backgroundColor = data.lucky_color.code;

    // Transitions
    loadingSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    resultSection.classList.add('fade-in');

    // Animate stats after displaying
    setTimeout(() => {
        // 1. Circular progress
        setProgress(data.score);

        // 2. Details progress bars
        animateProgressBar('love-bar', 'love-val', data.love);
        animateProgressBar('work-bar', 'work-val', data.work);
        animateProgressBar('money-bar', 'money-val', data.money);
        animateProgressBar('health-bar', 'health-val', data.health);
    }, 100);
}

// Set circular progress offset
function setProgress(percent) {
    const circle = document.getElementById('progress-circle');
    const scoreVal = document.getElementById('fortune-score');
    
    const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
    circle.style.strokeDashoffset = offset;
    
    // Count up the number
    let current = 0;
    const duration = 800; // ms
    const stepTime = Math.abs(Math.floor(duration / percent));
    
    const timer = setInterval(() => {
        current++;
        scoreVal.textContent = current;
        if (current >= percent) {
            clearInterval(timer);
            scoreVal.textContent = percent; // double check exact value
        }
    }, stepTime);
}

// Animate horizontal progress bars
function animateProgressBar(barId, valId, targetVal) {
    const bar = document.getElementById(barId);
    const valText = document.getElementById(valId);
    
    bar.style.width = '0%';
    
    // Wait a brief moment for transition to trigger
    setTimeout(() => {
        bar.style.width = `${targetVal}%`;
    }, 50);

    // Count up numerical value
    let current = 0;
    const duration = 1000; // ms
    const stepTime = Math.abs(Math.floor(duration / targetVal));
    
    const timer = setInterval(() => {
        current++;
        valText.textContent = `${current}%`;
        if (current >= targetVal) {
            clearInterval(timer);
            valText.textContent = `${targetVal}%`;
        }
    }, stepTime);
}

// Reset App state to Input Mode
function resetApp() {
    const inputSection = document.getElementById('input-section');
    const resultSection = document.getElementById('result-section');
    
    // Reset Form Fields
    document.getElementById('fortune-form').reset();
    
    // Clear any zodiac selected states (browsers sometimes remember radio checks)
    const checkedZodiac = document.querySelector('input[name="zodiac"]:checked');
    if (checkedZodiac) {
        checkedZodiac.checked = false;
    }

    // Reset Progress bars styles
    document.getElementById('progress-circle').style.strokeDashoffset = RING_CIRCUMFERENCE;
    ['love-bar', 'work-bar', 'money-bar', 'health-bar'].forEach(id => {
        document.getElementById(id).style.width = '0%';
    });

    // Toggle Visibility
    resultSection.classList.add('hidden');
    inputSection.classList.remove('hidden');
    inputSection.classList.add('fade-in');
}
