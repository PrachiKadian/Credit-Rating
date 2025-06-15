document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.className = savedTheme;
    themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.className = newTheme;
        themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
        
        // Save theme preference
        localStorage.setItem('theme', newTheme);
    });

    // --- AI Model & Scoring Logic ---
    const MODEL_WEIGHTS = {
        'intercept': -3.5,
        'duration': 0.04,
        'amount': 0.0002,
        'installment_rate': 0.25,
        'age': -0.03,
        'num_credits': 0.3
    };

    function predict_probability(applicant) {
        let z = MODEL_WEIGHTS.intercept;
        z += MODEL_WEIGHTS.duration * (applicant.duration || 0);
        z += MODEL_WEIGHTS.amount * (applicant.amount || 0);
        z += MODEL_WEIGHTS.installment_rate * (applicant.installment_rate || 0);
        z += MODEL_WEIGHTS.age * (applicant.age || 0);
        z += MODEL_WEIGHTS.num_credits * (applicant.num_credits || 0);
        return 1 / (1 + Math.exp(-z));
    }

    function calculate_risk_score(probability) {
        return Math.round(300 + (1 - probability) * 550);
    }
    
    function get_risk_level(probability) {
        if (probability > 0.5) return { level: 'High Risk', color: 'text-red-500' };
        if (probability > 0.2) return { level: 'Medium Risk', color: 'text-amber-500' };
        return { level: 'Low Risk', color: 'text-green-500' };
    }
    
    // --- Form Handling ---
    const predictionForm = document.getElementById('prediction-form');
    const resultDiv = document.getElementById('live-result');
    const riskScoreEl = document.getElementById('live-risk-score');
    const riskLevelEl = document.getElementById('live-risk-level');
    const probabilityEl = document.getElementById('probability-display');

    function handleCalculation(event) {
        if (event) {
            event.preventDefault();
        }
        
        const applicant = {
            duration: parseInt(document.getElementById('duration').value),
            age: parseInt(document.getElementById('age').value),
            amount: parseFloat(document.getElementById('amount').value),
            installment_rate: parseInt(document.getElementById('installment_rate').value),
            num_credits: parseInt(document.getElementById('num_credits').value),
        };

        const probability = predict_probability(applicant);
        const score = calculate_risk_score(probability);
        const { level, color } = get_risk_level(probability);
        
        // Display results
        riskScoreEl.textContent = score;
        riskScoreEl.className = `text-6xl font-bold mt-2 ${color}`;
        riskLevelEl.textContent = level;
        riskLevelEl.className = `text-2xl font-semibold mt-1 ${color}`;
        probabilityEl.textContent = `(Probability of being a bad risk: ${(probability * 100).toFixed(2)}%)`;
        
        resultDiv.classList.remove('opacity-0');
    }

    predictionForm.addEventListener('submit', handleCalculation);

    // --- Initial Load ---
    handleCalculation();
});