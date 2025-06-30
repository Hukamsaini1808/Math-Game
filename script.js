class AdvancedMathGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.streak = 0;
        this.bestStreak = 0;
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.currentQuestion = {};
        this.gameActive = false;
        this.difficulty = 'medium';
        this.timeLimit = 15;
        this.timeLeft = 15;
        this.timerInterval = null;
        this.gameStartTime = null;
        this.powerUps = {
            freeze: 3,
            fiftyFifty: 2,
            skip: 5
        };
        this.achievements = [];
        this.comboMultiplier = 1;
        this.questionTypes = ['algebra', 'geometry', 'calculus', 'statistics', 'trigonometry'];
        
        this.initializeElements();
        this.bindEvents();
        this.showStartScreen();
        this.createParticles();
    }
    
    initializeElements() {
        this.screens = {
            start: document.getElementById('startScreen'),
            game: document.getElementById('gameScreen'),
            result: document.getElementById('resultScreen')
        };
        
        this.elements = {
            question: document.getElementById('question'),
            questionType: document.getElementById('questionType'),
            answerInput: document.getElementById('answerInput'),
            multipleChoice: document.getElementById('multipleChoice'),
            feedback: document.getElementById('feedback'),
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lives: document.getElementById('lives'),
            streak: document.getElementById('streak'),
            timerText: document.getElementById('timerText'),
            timerCircle: document.getElementById('timerCircle'),
            timeBar: document.querySelector('.time-bar'),
            levelProgress: document.querySelector('.level-progress'),
            comboDisplay: document.getElementById('comboDisplay')
        };
    }
    
    bindEvents() {
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e.target.dataset.difficulty));
        });
        
        // Game controls
        document.getElementById('submitBtn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareScore());
        
        // Power-ups
        document.getElementById('freezeTime').addEventListener('click', () => this.usePowerUp('freeze'));
        document.getElementById('fiftyFifty').addEventListener('click', () => this.usePowerUp('fiftyFifty'));
        document.getElementById('skipQuestion').addEventListener('click', () => this.usePowerUp('skip'));
        
        // Multiple choice
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectChoice(e.target.dataset.choice));
        });
        
        // Keyboard events
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        
        document.addEventListener('keydown', (e) => {
            if (this.gameActive) {
                if (e.key >= '1' && e.key <= '4' && this.currentQuestion.type === 'multiple') {
                    this.selectChoice(parseInt(e.key) - 1);
                }
            }
        });
    }
    
    createParticles() {
        const particlesContainer = document.querySelector('.particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(78, 205, 196, 0.6);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${2 + Math.random() * 3}s infinite;
            `;
            particlesContainer.appendChild(particle);
        }
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0; transform: scale(0); }
                50% { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        const timeMap = { easy: 20, medium: 15, hard: 10, extreme: 8 };
        this.timeLimit = timeMap[difficulty];
        this.startGame();
    }
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }
    
    showStartScreen() {
        this.showScreen('start');
    }
    
    startGame() {
        this.gameActive = true;
        this.gameStartTime = Date.now();
        this.showScreen('game');
        this.generateQuestion();
        this.startTimer();
        this.elements.answerInput.focus();
    }
    
    generateQuestion() {
        this.timeLeft = this.timeLimit;
        const questionType = this.questionTypes[Math.floor(Math.random() * this.questionTypes.length)];
        this.elements.questionType.textContent = `${questionType.charAt(0).toUpperCase() + questionType.slice(1)} Challenge`;
        
        // Determine if this should be multiple choice or input
        const useMultipleChoice = Math.random() < 0.4;
        
        if (useMultipleChoice) {
            this.generateMultipleChoiceQuestion();
        } else {
            this.generateInputQuestion();
        }
        
        this.clearFeedback();
        this.elements.answerInput.value = '';
        this.updateProgressBars();
    }
    
    generateInputQuestion() {
        this.elements.multipleChoice.style.display = 'none';
        this.elements.answerInput.style.display = 'block';
        document.getElementById('submitBtn').style.display = 'block';
        
        const complexityLevel = Math.min(this.level, 10);
        let question, answer, display;
        
        const questionTypes = [
            'polynomial', 'exponential', 'logarithmic', 'trigonometric', 
            'algebraic', 'quadratic', 'system', 'matrix'
        ];
        
        const type = questionTypes[Math.floor(Math.random() * Math.min(questionTypes.length, complexityLevel + 2))];
        
        switch(type) {
            case 'polynomial':
                const coeffs = this.generateCoefficients(3);
                const x = Math.floor(Math.random() * 10) + 1;
                answer = coeffs[0] * x * x + coeffs[1] * x + coeffs[2];
                display = `If f(x) = ${coeffs[0]}x² + ${coeffs[1]}x + ${coeffs[2]}, find f(${x})`;
                break;
                
            case 'exponential':
                const base = Math.floor(Math.random() * 5) + 2;
                const exp = Math.floor(Math.random() * 4) + 1;
                answer = Math.pow(base, exp);
                display = `Calculate ${base}^${exp}`;
                break;
                
            case 'logarithmic':
                const logBase = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
                const logResult = Math.floor(Math.random() * 4) + 1;
                answer = Math.pow(logBase, logResult);
                display = `If log₍${logBase}₎(x) = ${logResult}, find x`;
                break;
                
            case 'trigonometric':
                const angles = [0, 30, 45, 60, 90];
                const angle = angles[Math.floor(Math.random() * angles.length)];
                const trigFunc = ['sin', 'cos', 'tan'][Math.floor(Math.random() * 3)];
                const trigValues = {
                    'sin': {0: 0, 30: 0.5, 45: 0.707, 60: 0.866, 90: 1},
                    'cos': {0: 1, 30: 0.866, 45: 0.707, 60: 0.5, 90: 0},
                    'tan': {0: 0, 30: 0.577, 45: 1, 60: 1.732, 90: 'undefined'}
                };
                answer = Math.round(trigValues[trigFunc][angle] * 1000) / 1000;
                display = `Calculate ${trigFunc}(${angle}°) (round to 3 decimal places)`;
                break;
                
            case 'algebraic':
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 20) + 1;
                const c = Math.floor(Math.random() * 15) + 1;
                answer = (b - c) / a;
                display = `Solve for x: ${a}x + ${c} = ${b}`;
                break;
                
            case 'quadratic':
                // Simple quadratic: x² - sum*x + product = 0
                const root1 = Math.floor(Math.random() * 10) + 1;
                const root2 = Math.floor(Math.random() * 10) + 1;
                const sum = root1 + root2;
                const product = root1 * root2;
                answer = Math.min(root1, root2); // Ask for smaller root
                display = `Find the smaller root of x² - ${sum}x + ${product} = 0`;
                break;
                
            case 'system':
                // 2x + 3y = result1, x - y = result2
                const x1 = Math.floor(Math.random() * 10) + 1;
                const y1 = Math.floor(Math.random() * 10) + 1;
                const result1 = 2 * x1 + 3 * y1;
                const result2 = x1 - y1;
                answer = x1;
                display = `Solve for x: 2x + 3y = ${result1}, x - y = ${result2}`;
                break;
                
            default:
                // Fallback to complex arithmetic
                const num1 = this.getComplexNumber();
                const num2 = this.getComplexNumber();
                const operation = ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)];
                
                switch(operation) {
                    case '+': answer = num1 + num2; break;
                    case '-': answer = num1 - num2; break;
                    case '×': answer = num1 * num2; break;
                    case '÷': answer = Math.round((num1 / num2) * 100) / 100; break;
                }
                
                display = `${num1} ${operation} ${num2} = <span class="blank">?</span>`;
        }
        
        this.currentQuestion = { 
            type: 'input', 
            answer: typeof answer === 'number' ? Math.round(answer * 1000) / 1000 : answer,
            display: display
        };
        
        this.elements.question.innerHTML = display;
    }
    
    generateMultipleChoiceQuestion() {
        this.elements.multipleChoice.style.display = 'grid';
        this.elements.answerInput.style.display = 'none';
        document.getElementById('submitBtn').style.display = 'none';
        
        const num1 = this.getComplexNumber();
        const num2 = this.getComplexNumber();
        const operations = ['+', '-', '×', '÷', '^'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let correctAnswer;
        switch(operation) {
            case '+': correctAnswer = num1 + num2; break;
            case '-': correctAnswer = num1 - num2; break;
            case '×': correctAnswer = num1 * num2; break;
            case '÷': correctAnswer = Math.round((num1 / num2) * 100) / 100; break;
            case '^': correctAnswer = Math.pow(num1 % 10, num2 % 5); break;
        }
        
        const choices = this.generateChoices(correctAnswer);
        const correctIndex = Math.floor(Math.random() * 4);
        choices[correctIndex] = correctAnswer;
        
        this.currentQuestion = {
            type: 'multiple',
            answer: correctIndex,
            choices: choices
        };
        
        this.elements.question.innerHTML = `${num1} ${operation} ${num2} = ?`;
        
        const choiceBtns = document.querySelectorAll('.choice-btn');
        choiceBtns.forEach((btn, index) => {
            btn.textContent = choices[index];
            btn.classList.remove('selected');
        });
    }
    
    generateChoices(correct) {
        const choices = [];
        const range = Math.abs(correct) * 0.5 + 10;
        
        for (let i = 0; i < 4; i++) {
            let choice;
            do {
                choice = correct + (Math.random() - 0.5) * range * 2;
                choice = Math.round(choice * 100) / 100;
            } while (choices.includes(choice) || choice === correct);
            choices.push(choice);
        }
        
        return choices;
    }
    
    generateCoefficients(count) {
        return Array.from({length: count}, () => Math.floor(Math.random() * 10) - 5).filter(x => x !== 0);
    }
    
    getComplexNumber() {
        const complexity = Math.min(this.level, 10);
        const maxNum = 10 + complexity * 5;
        return Math.floor(Math.random() * maxNum) + 1;
    }
    
    selectChoice(choiceIndex) {
        document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-choice="${choiceIndex}"]`).classList.add('selected');
        
        setTimeout(() => {
            this.checkAnswer(parseInt(choiceIndex));
        }, 300);
    }
    
    submitAnswer() {
        if (!this.gameActive) return;
        
        const userAnswer = this.elements.answerInput.value.trim();
        if (!userAnswer) {
            this.showFeedback('Please enter an answer!', false);
            return;
        }
        
        const numericAnswer = parseFloat(userAnswer);
        this.checkAnswer(numericAnswer);
    }
    
    checkAnswer(userAnswer) {
        if (!this.gameActive) return;
        
        this.questionsAnswered++;
        let isCorrect = false;
        
        if (this.currentQuestion.type === 'multiple') {
            isCorrect = userAnswer === this.currentQuestion.answer;
        } else {
            const tolerance = 0.01;
            isCorrect = Math.abs(userAnswer - this.currentQuestion.answer) <= tolerance;
        }
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
        
        this.updateDisplay();
        this.checkAchievements();
        
        setTimeout(() => {
            if (this.lives <= 0) {
                this.endGame();
            } else if (this.questionsAnswered >= this.level * 5 + 10) {
                this.levelUp();
            } else {
                this.generateQuestion();
                this.startTimer();
                if (this.currentQuestion.type === 'input') {
                    this.elements.answerInput.focus();
                }
            }
        }, 2000);
    }
    
    handleCorrectAnswer() {
        this.correctAnswers++;
        this.streak++;
        this.bestStreak = Math.max(this.bestStreak, this.streak);
        
        // Calculate score with combo multiplier
        const baseScore = this.level * 10;
        const timeBonus = Math.floor(this.timeLeft * 2);
        const streakBonus = Math.floor(this.streak * 5);
        const totalScore = (baseScore + timeBonus + streakBonus) * this.comboMultiplier;
        
        this.score += totalScore;
        
        // Show combo if streak is high
        if (this.streak >= 5 && this.streak % 5 === 0) {
            this.showCombo();
            this.comboMultiplier = Math.min(this.comboMultiplier + 0.5, 3);
        }
        
        this.showFeedback(`Correct! +${totalScore} points 🎉`, true);
    }
    
    handleIncorrectAnswer() {
        this.lives--;
        this.streak = 0;
        this.comboMultiplier = 1;
        
        const correctAnswer = this.currentQuestion.type === 'multiple' 
            ? this.currentQuestion.choices[this.currentQuestion.answer]
            : this.currentQuestion.answer;
            
        this.showFeedback(`Incorrect! The answer was ${correctAnswer}`, false);
    }
    
    showCombo() {
        this.elements.comboDisplay.textContent = `${this.streak} COMBO!`;
        this.elements.comboDisplay.classList.add('show');
        
        setTimeout(() => {
            this.elements.comboDisplay.classList.remove('show');
        }, 1500);
    }
    
    usePowerUp(type) {
        if (this.powerUps[type] <= 0 || !this.gameActive) return;
        
        const costs = { freeze: 100, fiftyFifty: 150, skip: 50 };
        
        if (this.score < costs[type]) {
            this.showFeedback(`Need ${costs[type]} points to use this power-up!`, false);
            return;
        }
        
        this.score -= costs[type];
        this.powerUps[type]--;
        
        switch(type) {
            case 'freeze':
                this.timeLeft += 10;
                this.showFeedback('Time frozen! +10 seconds ❄️', true);
                break;
                
            case 'fiftyFifty':
                if (this.currentQuestion.type === 'multiple') {
                    this.eliminateWrongChoices();
                    this.showFeedback('50/50 activated! 🎯', true);
                } else {
                    this.showHint();
                }
                break;
                
            case 'skip':
                this.showFeedback('Question skipped! ⏭️', true);
                setTimeout(() => {
                    this.generateQuestion();
                    this.startTimer();
                }, 1000);
                return;
        }
        
        this.updatePowerUpDisplay();
        this.updateDisplay();
    }
    
    eliminateWrongChoices() {
        const choiceBtns = document.querySelectorAll('.choice-btn');
        const correctIndex = this.currentQuestion.answer;
        let eliminated = 0;
        
        choiceBtns.forEach((btn, index) => {
            if (index !== correctIndex && eliminated < 2) {
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';
                eliminated++;
            }
        });
    }
    
    showHint() {
        const answer = this.currentQuestion.answer;
        let hint = '';
        
        if (typeof answer === 'number') {
            if (answer > 100) hint = 'The answer is greater than 100';
            else if (answer > 50) hint = 'The answer is between 50 and 100';
            else if (answer > 10) hint = 'The answer is between 10 and 50';
            else if (answer > 0) hint = 'The answer is between 0 and 10';
            else hint = 'The answer is negative or zero';
        }
        
        this.showFeedback(`Hint: ${hint}`, true);
    }
    
    startTimer() {
        this.clearTimer();
        this.timeLeft = this.timeLimit;
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }
    
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    handleTimeUp() {
        this.clearTimer();
        this.lives--;
        this.streak = 0;
        this.comboMultiplier = 1;
        this.showFeedback('Time\'s up! ⏰', false);
        
        setTimeout(() => {
            if (this.lives <= 0) {
                this.endGame();
            } else {
                this.generateQuestion();
                this.startTimer();
            }
        }, 2000);
    }
    
    updateTimerDisplay() {
        this.elements.timerText.textContent = this.timeLeft;
        const progress = (this.timeLeft / this.timeLimit) * 283;
        this.elements.timerCircle.style.strokeDashoffset = 283 - progress;
        
        // Update time bar
        const timePercent = (this.timeLeft / this.timeLimit) * 100;
        this.elements.timeBar.style.setProperty('--width', `${timePercent}%`);
        this.elements.timeBar.querySelector('::after').style.width = `${timePercent}%`;
    }
    
    updateProgressBars() {
        // Update level progress
        const questionsInLevel = this.level * 5 + 10;
        const progressPercent = (this.questionsAnswered % questionsInLevel) / questionsInLevel * 100;
        this.elements.levelProgress.style.setProperty('--width', `${progressPercent}%`);
    }
    
    levelUp() {
        this.level++;
        this.lives = Math.min(this.lives + 1, 5); // Bonus life
        this.showFeedback(`Level Up! Welcome to Level ${this.level}! 🚀`, true);
        
        // Increase difficulty
        if (this.timeLimit > 5) {
            this.timeLimit = Math.max(this.timeLimit - 1, 5);
        }
        
        setTimeout(() => {
            this.generateQuestion();
            this.startTimer();
        }, 2000);
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        if (this.score >= 1000 && !this.achievements.includes('Millennium')) {
            newAchievements.push('Millennium');
        }
        
        if (this.streak >= 10 && !this.achievements.includes('Streak Master')) {
            newAchievements.push('Streak Master');
        }
        
        if (this.level >= 5 && !this.achievements.includes('Level 5')) {
            newAchievements.push('Level 5');
        }
        
        if (this.correctAnswers >= 50 && !this.achievements.includes('Half Century')) {
            newAchievements.push('Half Century');
        }
        
        newAchievements.forEach(achievement => {
            this.achievements.push(achievement);
            this.showAchievement(achievement);
        });
    }
    
    showAchievement(achievement) {
        const achievementEl = document.createElement('div');
        achievementEl.className = 'achievement';
        achievementEl.textContent = `🏆 ${achievement}`;
        document.getElementById('achievements').appendChild(achievementEl);
    }
    
    showFeedback(message, isCorrect) {
        this.elements.feedback.textContent = message;
        this.elements.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    }
    
    clearFeedback() {
        this.elements.feedback.textContent = '';
        this.elements.feedback.className = 'feedback';
    }
    
    updateDisplay() {
        this.elements.score.textContent = this.score.toLocaleString();
        this.elements.level.textContent = this.level;
        this.elements.streak.textContent = this.streak;
        this.elements.lives.textContent = '❤️'.repeat(this.lives);
        this.updatePowerUpDisplay();
    }
    
    updatePowerUpDisplay() {
        document.getElementById('freezeCount').textContent = this.powerUps.freeze;
        document.getElementById('fiftyCount').textContent = this.powerUps.fiftyFifty;
        document.getElementById('skipCount').textContent = this.powerUps.skip;
        
        // Disable power-ups if no uses left
        Object.keys(this.powerUps).forEach(type => {
            const btn = document.getElementById(type === 'fiftyFifty' ? 'fiftyFifty' : type === 'skip' ? 'skipQuestion' : 'freezeTime');
            btn.classList.toggle('disabled', this.powerUps[type] <= 0);
        });
    }
    
    endGame() {
        this.gameActive = false;
        this.clearTimer();
        this.showResultScreen();
    }
    
    showResultScreen() {
        this.showScreen('result');
        this.displayResults();
    }
    
    displayResults() {
        const accuracy = this.questionsAnswered > 0 ? 
            Math.round((this.correctAnswers / this.questionsAnswered) * 100) : 0;
        
        const timePlayed = this.gameStartTime ? 
            Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
        
        const minutes = Math.floor(timePlayed / 60);
        const seconds = timePlayed % 60;
        
        document.getElementById('finalScore').textContent = this.score.toLocaleString();
        document.getElementById('highestLevel').textContent = this.level;
        document.getElementById('questionsAnswered').textContent = this.questionsAnswered;
        document.getElementById('accuracy').textContent = accuracy + '%';
        document.getElementById('bestStreak').textContent = this.bestStreak;
        document.getElementById('timePlayed').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Result animation and title
        const resultTitle = document.getElementById('resultTitle');
        const resultAnimation = document.getElementById('resultAnimation');
        
        if (accuracy >= 90) {
            resultTitle.textContent = 'Mathematical Genius! 🧠';
            resultAnimation.textContent = '🏆';
        } else if (accuracy >= 75) {
            resultTitle.textContent = 'Excellent Work! 🌟';
            resultAnimation.textContent = '🎖️';
        } else if (accuracy >= 60) {
            resultTitle.textContent = 'Good Effort! 👍';
            resultAnimation.textContent = '🎯';
        } else {
            resultTitle.textContent = 'Keep Practicing! 💪';
            resultAnimation.textContent = '📚';
        }
    }
    
    shareScore() {
        const shareText = `I just scored ${this.score.toLocaleString()} points in Math Challenge Arena! Can you beat my score?`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Math Challenge Arena',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showFeedback('Score copied to clipboard! 📋', true);
            });
        }
    }
    
    restartGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.streak = 0;
        this.bestStreak = 0;
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.comboMultiplier = 1;
        this.powerUps = { freeze: 3, fiftyFifty: 2, skip: 5 };
        this.achievements = [];
        this.timeLimit = 15;
        
        document.getElementById('achievements').innerHTML = '';
        this.updateDisplay();
        this.showStartScreen();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedMathGame();
});
