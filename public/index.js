const tickerInput = document.getElementById('ticker-input');
const addTickerBtn = document.querySelector('.add-ticker-btn');
const generateBtn = document.querySelector('.generate-report-btn');
const tickerDisplay = document.querySelector('.ticker-choice-display');
const loadingPanel = document.querySelector('.loading-panel');
const outputPanel = document.querySelector('.output-panel');

let tickers = [];

// Prevent form submit reload
document.getElementById('ticker-input-form').addEventListener('submit', e => e.preventDefault());

// Update ticker display & enable/disable generate button
const updateTickerDisplay = () => {
  tickerDisplay.textContent = tickers.length
    ? `You selected: ${tickers.join(', ')}`
    : 'Your tickers will appear here...';
  generateBtn.disabled = tickers.length < 2;
};

// Add ticker on "+" click
addTickerBtn.addEventListener('click', async e => {
  e.preventDefault();
  const input = tickerInput.value.trim().toUpperCase();
  if (!input || tickers.includes(input) || tickers.length >= 3) return;
  try {
    const res = await fetch(`/get-stock-data?ticker=${input}`);
    if (!res.ok) throw new Error('Invalid ticker');
    tickers.push(input);
    updateTickerDisplay();
    tickerInput.value = '';
  } catch {
    alert(`Error: ${input} is not a valid stock ticker.`);
  }
});

// Generate report on click
generateBtn.addEventListener('click', async () => {
  loadingPanel.style.display = 'block';
  outputPanel.classList.remove('visible');

  try {
    const res = await fetch('/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers })
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Expected JSON but got: ${text.substring(0, 200)}`);
    }

    console.log('Response JSON:', data);
    if (!res.ok) throw new Error(data.error || 'Unknown server response');

    outputPanel.innerHTML = `
	<h2>Your Report 😜</h2>
	<div class="report-container"><pre>${data.report}</pre></div>
	`;
    outputPanel.classList.add('visible');

    tickers = [];
    updateTickerDisplay();

  } catch (err) {
    console.error('Front-end error:', err);
    outputPanel.innerHTML = `
      <h2>Error</h2>
      <p>${err.message}</p>
    `;
    outputPanel.classList.add('visible');
  } finally {
    loadingPanel.style.display = 'none';
  }
});

// Initial setup
updateTickerDisplay();
