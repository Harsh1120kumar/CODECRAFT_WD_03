import { useState, useEffect } from 'react';

// The main App component for the Tic-Tac-Toe game.
export default function App() {
    // State to manage the game board, represented as an array of 9 strings.
    const [board, setBoard] = useState(Array(9).fill(null));
    // State to track the current player ('X' or 'O').
    const [currentPlayer, setCurrentPlayer] = useState('X');
    // State to store the winning player, or 'Draw' if the game is a tie.
    const [winner, setWinner] = useState(null);
    // State to store the indices of the winning cells for highlighting.
    const [winningLine, setWinningLine] = useState([]);
    // State to manage the game mode, 'human' or 'ai'.
    const [gameMode, setGameMode] = useState(null);

    // Winning conditions for the game.
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // This effect runs whenever the board state or current player changes.
    // It checks for a winner or a draw after each move.
    useEffect(() => {
        // Check each winning condition
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                // If a player has won, set the winner and the winning cells
                setWinner(board[a]);
                setWinningLine([a, b, c]);
                return;
            }
        }

        // Check for a draw (if there are no empty cells and no winner)
        if (board.every(cell => cell !== null)) {
            setWinner('Draw');
        }
    }, [board]);

    // This useEffect handles the AI's turn.
    useEffect(() => {
        // Only run if it's the AI's turn and the game is active.
        if (gameMode === 'ai' && currentPlayer === 'O' && !winner) {
            const timer = setTimeout(() => {
                const bestMove = findBestMove(board, 'O', 'X');
                if (bestMove !== null) {
                    handleClick(bestMove);
                }
            }, 500); // Add a small delay for a better user experience
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, gameMode, board, winner]);

    /**
     * The core Minimax algorithm.
     * It recursively evaluates all possible game states to find the best move.
     * @param {Array} currentBoard The current state of the board.
     * @param {number} depth The current depth of the search tree.
     * @param {boolean} isMaximizingPlayer True if it's the AI's turn, false if it's the human's.
     * @returns {number} The score of the current board state.
     */
    const minimax = (currentBoard, depth, isMaximizingPlayer) => {
        const score = checkScore(currentBoard);

        // Base cases: if a player has won or it's a draw, return the score.
        if (score === 1) return 10 - depth; // AI wins
        if (score === -1) return depth - 10; // Human wins
        if (score === 0 && currentBoard.every(cell => cell !== null)) return 0; // Draw

        if (isMaximizingPlayer) {
            // AI's turn: find the maximum score.
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    currentBoard[i] = 'O';
                    let currentScore = minimax(currentBoard, depth + 1, false);
                    currentBoard[i] = null; // Undo the move
                    bestScore = Math.max(bestScore, currentScore);
                }
            }
            return bestScore;
        } else {
            // Human's turn: find the minimum score.
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === null) {
                    currentBoard[i] = 'X';
                    let currentScore = minimax(currentBoard, depth + 1, true);
                    currentBoard[i] = null; // Undo the move
                    bestScore = Math.min(bestScore, currentScore);
                }
            }
            return bestScore;
        }
    };

    /**
     * Determines the best move for the AI using the Minimax algorithm.
     * @param {Array} currentBoard The current state of the board.
     * @param {string} player The AI's player mark ('O').
     * @param {string} opponent The human's player mark ('X').
     * @returns {number | null} The index of the best move, or null if no moves are available.
     */
    const findBestMove = (currentBoard, player, opponent) => {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = player;
                let score = minimax(currentBoard, 0, false);
                currentBoard[i] = null; // Undo the move

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    };

    /**
     * Helper function to check if a player has won and return a score.
     * @param {Array} currentBoard The board to check.
     * @returns {number} 1 if AI wins, -1 if human wins, 0 otherwise.
     */
    const checkScore = (currentBoard) => {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (currentBoard[a] === 'O' && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return 1;
            }
            if (currentBoard[a] === 'X' && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return -1;
            }
        }
        return 0;
    };

    // Handles a click on a game cell.
    const handleClick = (index) => {
        // If the game is over or the cell is already filled, do nothing.
        if (winner || board[index]) {
            return;
        }
        
        // Create a copy of the board to modify
        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);
        
        // Switch to the next player
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    };

    // Resets the game to its initial state.
    const restartGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer('X');
        setWinner(null);
        setWinningLine([]);
    };

    // Renders the status message based on the game state.
    const renderStatus = () => {
        if (!gameMode) {
            return "Choose a game mode to begin!";
        }
        if (winner === 'Draw') {
            return "Game ended in a draw!";
        } else if (winner) {
            return `Player ${winner} has won!`;
        } else {
            return `It's ${currentPlayer}'s turn!`;
        }
    };
    
    // The main component renders the game UI.
    return (
        <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center text-slate-100 font-sans p-4">
            <div className="bg-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center gap-6 md:gap-8 max-w-lg w-full">
                <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 drop-shadow-md">
                    Tic-Tac-Toe
                </h1>
                
                <div className="text-xl md:text-2xl font-semibold h-8 text-center min-h-max">
                    {renderStatus()}
                </div>

                {/* Game Mode Selection */}
                {!gameMode && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => { setGameMode('human'); restartGame(); }}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            Human vs. Human
                        </button>
                        <button
                            onClick={() => { setGameMode('ai'); restartGame(); }}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            Human vs. AI
                        </button>
                    </div>
                )}
                
                {/* Game Board */}
                {gameMode && (
                    <>
                        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full aspect-square max-w-sm">
                            {board.map((cellValue, index) => (
                                <button
                                    key={index}
                                    className={`
                                        flex items-center justify-center text-6xl md:text-8xl font-black
                                        bg-slate-900 rounded-xl shadow-lg hover:scale-105 transition-transform duration-200
                                        ${cellValue === 'X' ? 'text-yellow-400' : 'text-sky-400'}
                                        ${winningLine.includes(index) ? 'bg-red-500 animate-pulse' : ''}
                                        ${(winner || (gameMode === 'ai' && currentPlayer === 'O') || board[index]) ? 'cursor-not-allowed' : 'cursor-pointer'}
                                        ${!cellValue && !winner ? 'hover:bg-slate-700' : ''}
                                        `}
                                    onClick={() => handleClick(index)}
                                    disabled={!!winner || (gameMode === 'ai' && currentPlayer === 'O') || !!board[index]}
                                >
                                    {cellValue}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={restartGame}
                            className="
                                mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-700
                                text-white text-lg font-bold rounded-full
                                shadow-xl transition-all duration-300
                                hover:scale-105 active:scale-95
                            "
                        >
                            Restart Game
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

