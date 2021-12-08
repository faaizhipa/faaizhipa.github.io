let humanScore = 0;
let computerScore = 0;
let currentRoundNumber = 1;

// Write your code below:
const generateTarget = () => {
    let randomNumber = Math.floor(Math.random()*10);
    return randomNumber;
  }
  
  function compareGuesses(humanGuess, computerGuess, actualGuess) {
    let humanGuessDifference = humanGuess - actualGuess;
    let computerGuessDifference = computerGuess - actualGuess;
  
    if (humanGuessDifference < 0) {
      humanGuessDifference *= -1;
    }
  
    if (computerGuessDifference < 0) {
      computerGuessDifference *= -1;
    }
  
    if (humanGuessDifference <= computerGuessDifference) {
      return true;
    } else {
      return false;
    }
  };
  
  const updateScore = function(winner) {
    if (winner === 'human') {
      humanScore += 1;
    } else if (winner === 'computer') {
      computerScore +=1;
    }
  }
  
  const advanceRound = () => currentRoundNumber += 1;
  
  
