document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // Premium food emojis for the game
    const foodPalette = [
        '🍔', // Burger
        '🍕', // Pizza
        '🌮', // Taco
        '🍣', // Sushi
        '🍩', // Donut
        '🍦', // Ice Cream
        '🍓', // Strawberry
        '🥑'  // Avocado
    ];
    
    // --- State Variables ---
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timerInterval = null;
    let secondsElapsed = 0;
    let isLocked = false; // Prevent clicking while animating
    let gameStarted = false;

    // --- DOM Elements ---
    const gridElement = document.getElementById('game-grid');
    const movesElement = document.getElementById('moves-count');
    const timerElement = document.getElementById('timer');
    const restartBtn = document.getElementById('restart-btn');
    const victoryModal = document.getElementById('victory-modal');
    const playAgainBtn = document.getElementById('play-again-btn');
    const finalTimeElement = document.getElementById('final-time');
    const finalMovesElement = document.getElementById('final-moves');

    // --- Core Functions ---

    // Initialize or Reset the Game
    function initGame() {
        // Reset state
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        secondsElapsed = 0;
        isLocked = false;
        gameStarted = false;
        
        updateMoves();
        updateTimerDisplay();
        clearInterval(timerInterval);
        
        victoryModal.classList.add('hidden');
        
        // Prepare cards
        // Duplicate foods to make pairs
        const pairs = [...foodPalette, ...foodPalette];
        cards = shuffleArray(pairs);
        
        renderBoard();
    }

    // Fisher-Yates Shuffle
    function shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // Create and render card elements
    function renderBoard() {
        gridElement.innerHTML = '';
        
        cards.forEach((food, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.index = index;
            card.dataset.food = food;
            
            // Inner HTML for 3D flip
            card.innerHTML = `
                <div class="card-face card-front"></div>
                <div class="card-face card-back">${food}</div>
            `;
            
            card.addEventListener('click', () => handleCardClick(card));
            gridElement.appendChild(card);
        });
    }

    // Handle card click event
    function handleCardClick(card) {
        // Prevent click if locked, already flipped, or already matched
        if (isLocked || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        // Start timer on first move
        if (!gameStarted) {
            gameStarted = true;
            timerInterval = setInterval(() => {
                secondsElapsed++;
                updateTimerDisplay();
            }, 1000);
        }

        // Flip the card
        card.classList.add('flipped');
        flippedCards.push(card);

        // Check for match if 2 cards are flipped
        if (flippedCards.length === 2) {
            moves++;
            updateMoves();
            checkForMatch();
        }
    }

    // Check if the two flipped cards match
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const match = card1.dataset.food === card2.dataset.food;

        if (match) {
            // It's a match
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            flippedCards = [];

            // Check win condition
            if (matchedPairs === foodPalette.length) {
                handleVictory();
            }
        } else {
            // Not a match - lock board and flip back after delay
            isLocked = true;
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                isLocked = false;
            }, 1000);
        }
    }

    function updateMoves() {
        movesElement.textContent = moves;
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function handleVictory() {
        clearInterval(timerInterval);
        
        // Slight delay before showing modal to let the last card flip animation finish
        setTimeout(() => {
            finalTimeElement.textContent = timerElement.textContent;
            finalMovesElement.textContent = moves;
            victoryModal.classList.remove('hidden');
        }, 500);
    }

    // --- Event Listeners ---
    restartBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);

    // --- Start ---
    initGame();
});
