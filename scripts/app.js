(function game() {
  const board = document.querySelector('.main__board');

  let activeCard = null;
  let canClick = true; // Для предотвращения нажатия на другие карты во время анимации

  var game = {
    numberOfPairs: 9,
    points: 0,
    openedPairs: 0,

    getScore: function(){
      return this.points;
    },

    incrementScore: function(){
      this.openedPairs += 1;
      this.points += (this.numberOfPairs - this.openedPairs) * 42;

      this.printScore();

      if(this.numberOfPairs == this.openedPairs){
        window.location = window.location.origin + '/win?score=' + this.points;
      }
    },
  
    decrementScore:function(){
      this.points -= this.openedPairs * 42;
      
      this.printScore();
    },
  
    resetScore:function(){
      this.points = 0;
      this.openedPairs = 0;

      this.printScore();
    },

    printScore: function() {
      var pointsNumber = document.querySelector('.main__points');
      pointsNumber.textContent = this.points;
    }
  };


  // Функция для создания массива из 9 (зависит от переменной numberOfPairs) случайных индексов карт
  // Эти индексы будут взяты из массива cardDeck для создания нового набора карт в каждой новой игре
  var randomIndexesOfCards = function(pairsNum) {
    var outputArray = [];
    while (outputArray.length < pairsNum) {
      var tempRandomNumber = Math.floor(Math.random() * 52);
      if (outputArray.indexOf(tempRandomNumber) == -1) {
        outputArray.push(tempRandomNumber);
      }
    }
    return outputArray;
  };


  // Функция для того чтобы сделать блок случайно выбираемых 9 пар (numberOfPairs переменных) на столе
  // Каждые следующие два числа в массиве-это пара
  var randomIndexesOfPairs = function(pairsNum) {
    var cardsNum = pairsNum * 2;
    var outputArray = [];
    while (outputArray.length < cardsNum) {
      var tempRandomNumber = Math.floor(Math.random() * cardsNum);
      if (outputArray.indexOf(tempRandomNumber) == -1) {
        outputArray.push(tempRandomNumber);
      }
    }
    return outputArray;
  };


  // Создание массива имен файлов карт
  
  var getCardImageSrc = function(index) {
    var cardDeck = [];
    var relativePath = '/images/';
    var extension = '.jpg';
    
    var suites = ['k', 'b', 'c', 'p'];
    var suite = suites[index % 4];

    var i = (index - (index % 4)) / 4 + 1;

    switch (i) {
      case 11:
        return relativePath + 'j' + suite + extension;
      case 12:
        return relativePath + 'q' + suite + extension;
      case 13:
        return relativePath + 'k' + suite + extension;
      default:
        return relativePath + i + suite + extension;
    }
  }

  // Function to create needed number of cards in the DOM
  var pushCardsInDom = function(num){
    var documentFragment = document.createDocumentFragment();
    var totalCards = num * 2;

    for (let i = 0; i < totalCards; i += 1) {
      var mainCardWrapper = document.createElement('div');
      var mainCard = document.createElement('div');
      var cardBack = document.createElement('div');
      var cardBackIcon = document.createElement('img');
      var cardFront = document.createElement('div');
      var cardFrontIcon = document.createElement('img');

      mainCardWrapper.classList.add('main__card-wrapper');
      mainCard.classList.add('main__card');
      cardBack.classList.add('card__back');
      cardBackIcon.src = 'images/card_back.jpg';
      cardFront.classList.add('card__front');
      cardFrontIcon.classList.add('card__icon');

      cardBack.appendChild(cardBackIcon);
      mainCard.appendChild(cardBack);
      cardFront.appendChild(cardFrontIcon);
      mainCard.appendChild(cardFront);
      mainCardWrapper.appendChild(mainCard);
      documentFragment.appendChild(mainCardWrapper);
    }

    board.appendChild(documentFragment);
  };


  // Function on card click
  var clicked = function(e) {
    if(!canClick){
      return;
    }

    if (activeCard) {
      // Every click after selecting any card will be counted as one move

      // Clicking on the same card will remove its selection and flip it
      if (e.target === activeCard) {
        e.target.classList.add('card__no-events'); // This class will mute any eventListener

      // Got a pair, it'll mark both cards and mute event listeners
      } else if (
        e.target.querySelector('.card__icon').src ===
          activeCard.querySelector('.card__icon').src
      ) {
        e.target.classList.add('card__flipped');
        canClick = false;

        // Fade out this pair
        setTimeout(() => {
          e.target.parentNode.classList.add('fade-out');
          activeCard.parentNode.classList.add('fade-out');
          activeCard = null;
          setTimeout(() => {

            canClick = true;
            game.incrementScore();

          }, 300);
        }, 700);

        // Wrong pair, remove selection from the both cards
      } else {
        e.target.classList.add('card__flipped');
        canClick = false;

        /* Somehow 'shake' and 'card__flipped' transforms are interacting.
          So I made an extra setTimeout with 100ms to prevent bugs.
          Other timeouts are needed to change classes, each transformation lasts 700ms */
        setTimeout(() => {
          e.target.classList.add('shake');
          activeCard.classList.add('shake');

          // Do after shake animation
          setTimeout(() => {
            activeCard.classList.remove('shake');
            e.target.classList.remove('shake');
            setTimeout(() => {
              activeCard.classList.remove('card__flipped', 'card__no-events');
              e.target.classList.remove('card__flipped');
              activeCard = null;

              game.decrementScore();

              setTimeout(() => {
                canClick = true;
              }, 200);
            }, 100);
          }, 700);
        }, 700);
      }

      // Mark a card as selected one
    } else {
      activeCard = e.target;
      canClick = false;
      activeCard.classList.add('card__flipped');
      setTimeout(() => {
        canClick = true;
      }, 300);
    }
  };


  // Function to start a New game
  var newGame = function() {
    // Set randomly picked pairs of cards
    var randomPairsArray = randomIndexesOfPairs(game.numberOfPairs);

    // Set randomly picked indexes of cards
    var randomCardsIndexesArray = randomIndexesOfCards(game.numberOfPairs);

    // Reset number of points, opened pairs and active card
    activeCard = null;
    game.resetScore();

    // Remove all cards
    while (board.hasChildNodes()) {
      board.removeChild(board.lastChild);
    }

    // Add new set of cards
    pushCardsInDom(game.numberOfPairs);
    // Fill the NodeList of .card__icon elements
    var cardsFront = document.querySelectorAll('.card__icon');

    // Add card images. It iterates through every index of pairs array,
    // then take a random card index from the randomCardsIndexes and add src to the every card.
    randomPairsArray.forEach((randomPair, index) => {
      if (index % 2 === 0) {
        var randomCardIndex = randomCardsIndexesArray[index / 2];
        cardsFront[randomPair].src = getCardImageSrc(randomCardIndex);
      } else {
        var randomCardIndex = randomCardsIndexesArray[(index - 1) / 2];
        cardsFront[randomPair].src = getCardImageSrc(randomCardIndex);
      }
    });

    // Cards variable can be assigned only after adding cards to DOM
    var cards = document.querySelectorAll('.main__card');
    // Clicking on cards
    cards.forEach((card) => {
      card.addEventListener('click', clicked);
    });

    // Showing cards for 5 seconds
    canClick = false;
    cards.forEach((card) => {
      // Timeout is needed to do properly opening animation to previously opened cards
      setTimeout(() => {
        card.classList.add('card__flipped');

        // Timer to show cards at the start of the game
        setTimeout(() => {
          card.classList.remove('card__flipped');
          setTimeout(() => {
            canClick = true;
          }, 700);
        }, 5000); // number of milliseconds to show the cards at the start of the game
      }, 0);
    });
  };

  // Clicking on New Game button
  var buttonNewGame = document.querySelector('.main__new-game');
  buttonNewGame.addEventListener('click', newGame);

  newGame();
}());
