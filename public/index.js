const tickerInput = document.getElementById('ticker-input');
const addTickerBtn = document.querySelector('.add-ticker-btn');
const generateBtn = document.querySelector('.generate-report-btn');
const tickerDisplay = document.querySelector('.ticker-choice-display');
const loadingPanel = document.querySelector('.loading-panel');
const outputPanel = document.querySelector('.output-panel');
const outputHeader = outputPanel.querySelector('h2');


let tickers = [];

const tickerForm = document.getElementById('ticker-input-form');

tickerForm.addEventListener('submit', (e) => {
	e.preventDefault(); // prevents reloading or navigating on submit
});

const updateTickerDisplay = () => {
	tickerDisplay.textContent = tickers.length
		? `You selected: ${tickers.join(', ')}`
		: 'Your tickers will appear here...';
	generateBtn.disabled = tickers.length < 2;
};

addTickerBtn.addEventListener('click', async (e) => {
	e.preventDefault();
	const input = tickerInput.value.trim().toUpperCase();
	if (!input || tickers.includes(input) || tickers.length >= 3) return;

	try {
		// Validate using backend endpoint
		const res = await fetch(`/get-stock-data?ticker=${input}`);
		if (!res.ok) throw new Error('Invalid ticker');

		tickers.push(input);
		updateTickerDisplay();
		tickerInput.value = '';
	} catch (err) {
		alert(`Error: ${input} is not a valid stock ticker.`);
	}
});

generateBtn.addEventListener('click', async () => {
	loadingPanel.style.display = 'block';
	outputPanel.innerHTML = ''; // clear old output

	try {
		const res = await fetch('/generate-report', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ tickers }),
		});
		const data = await res.json();

		if (!res.ok) throw new Error(data.error || 'Something went wrong');

		outputPanel.innerHTML = `
			<h2>Your Report 😜</h2>
			<pre>${data.report}</pre>
		`;
	} catch (err) {
		alert('Failed to generate report: ' + err.message);
	} finally {
		loadingPanel.style.display = 'none';
	}
});
