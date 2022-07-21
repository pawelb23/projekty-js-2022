'use strict';

console.log("Gra w okręty - wersja pełna");

console.log("");

//====================

// Widok - wyświetla grę w oknie przeglądarki

var guessArray = [];

var view = {

    displayMessage: function(msg) {

        var messageArea = document.getElementById("messageArea");

        messageArea.innerHTML = msg;

    },

    displayHit: function(location) {

        var cell = document.getElementById(location);

        cell.setAttribute("class", "hit");

    },

    displayMiss: function(location) {

        var cell = document.getElementById(location);

        cell.setAttribute("class", "miss");

    }

};

//=====================

// Model -  przechowuje bieżący stan gry

var model = {
    boardSize: 7,
    numShips: 3,
    shipLength: 3,
    shipHitting: 0,
    shipsSunk: 0,
    allShipsSunk: false,
    ships: [{
            locations: [0, 0, 0],
            hits: ["", "", ""]
        },

        {
            locations: [0, 0, 0],
            hits: ["", "", ""]
        },

        {
            locations: [0, 0, 0],
            hits: ["", "", ""]
        }
    ],

    fire: function(guess) {

        for (var i = 0; i < this.numShips; i++) {

            var ship = this.ships[i]; //w naszym przypadku --- i --- może wynieść 0,1,2 bo mamy trzy statki

            //            var locations = ship.locations;
            var index = ship.locations.indexOf(guess); //to skrócona wersja dwóch zakomnentowanych (wyżej i niżej) wierszy poleceń, 
            //aby zaoszczędzić trochę kodu
            //            var index = locations.indexOf(guess);

            // Przypomnienie!!! --- ""indexOf"" szuka w łańcuchu kawałka kodu, którego każemy mu szukać (w naszym przypadku podajemy 
            // do szukania/sprawdzenia całą współrzędną lokalizacji).

            if (index >= 0) {

                ship.hits[index] = "hit"; // --- index w nawiasie kwadratowym wskaże, w którym miejscu w tabeli hits, znajdujące się tam na początku puste pole, powinno zostać zastąpione przez trafienie (czyli "hit"). Przy trójmasztowcach mogą to być cyfry 0,1,2.
                //sprawdzenie indeksu to mogą być tylko cyfry 0,1,2. Kiedy wskazny strzał jest pudłem indeks zwraca -1 (minus jeden), więc zgodnie z założeniami tu tego nie zobaczymy, bo przecież (index >= 0)
                view.displayHit(guess);

                view.displayMessage("TRAFIONY!");

                if (this.isSunk(ship)) { // osnosi się do wartości isSunk podanej poniżej, jeżeli tam zwrócone zostanie true to do shipSunk dopisane zostaje +1. 

                    return ship;

                }

                return true;

            }

        }

        view.displayMiss(guess);
        view.displayMessage("Spudłowałeś!");
        document.getElementById("fireButton").setAttribute("disabled", true);

        return false;
    },

    isSunk: function(ship) {

        for (var i = 0; this.shipLength > i; i++) { //shipLength --- wynosi 3 (jest to właściwość zapisana wyżej w tym obiekcie, do której się odwołujemy)
            if (ship.hits[i] != "hit") { // taki zapis sprawia, że jeżeli wszystkie pola hits jednego statku (gdyż w założeniu mamy --- ship) będą równe hit mamy wartość true, w innym przypadku wartość wynosi false

                return false;

            }

            this.shipHittingFunction(ship);


            return true;

        }

    },

    generateShipLocations: function() {
        var locations;

        for (var i = 0; i < this.numShips; i++) {
            do {
                locations = this.generateShip();
            } while (this.collision(locations));
            this.ships[i].locations = locations;
        }
    },

    generateShip: function() {
        var direction = Math.floor(Math.random() * 2);

        var row, col;


        if (direction === 1) {

            row = Math.floor(Math.random() * this.boardSize);
            // console.log(row);
            col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
            // console.log(col);

        } else {

            row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
            col = Math.floor(Math.random() * this.boardSize);
        }

        var newShipLocations = [];

        for (var i = 0; i < this.shipLength; i++) {

            if (direction === 1) {
                newShipLocations.push(row + "" + (col + i));
                // console.log(newShipLocations);

            } else {

                newShipLocations.push((row + i) + "" + col);

            }

        }

        return newShipLocations;

    },

    collision: function(locations) {

        for (var i = 0; i < this.numShips; i++) {

            var ship = model.ships[i];

            for (var j = 0; j < locations.length; j++) {

                if (ship.locations.indexOf(locations[j]) >= 0) {

                    return true;
                }

            }

        }

        return false;

    },

    shipHittingFunction: function(ship) {

        var shipHits = ship.hits.join("");

        // console.log(this.shipHitting);

        // console.log(shipHits);

        if (shipHits.match(/hithithit/)) {

            this.shipHitting++;

            // console.log(this.shipHitting);

            view.displayMessage("Zatopiłeś okręt!");

            this.shipsSunk++;


        }
        // for (var i = 0; i < this.numShips.length; i++) {
        //     console.log("ship");
        //     if (shipsHits[i].match(/hithithit/)) {
        //         allShipsSunk = true;
        //     }
        // }
    }

};

//============================

// Kontroler -  kontroler spaja ze sobą widok i model, bo pobiera pole wytypowane przez użytkownika, sprawdza, 
// czy strzał był celny, czy nie, a następnie zapisuje go w modelu. Kontroler dba także o pewne szczegóły administracyjne, 
// takie jak liczba prób oraz postępy użytkownika w grze.

var controller = {

    guesses: 0,

    processGuess: function(guess) {

        var location = parseGuess(guess);

        if (guessArray.includes(guess)) {

            guess = "";
            return alert("Podana wartość już padła, podaj inne współrzędne");

        } else {

            guessArray.push(guess);

            if (location) {
                this.guesses++;
                var hit = model.fire(location);

                if (hit && model.shipsSunk === model.numShips) {
                    view.displayMessage("Zatopiłeś wszystkie okręty, w " + this.guesses + " próbach.");
                    document.getElementById("guessInput").setAttribute("disabled", true);
                    document.getElementById("fireButton").setAttribute("disabled", true);

                    console.log("");
                    console.log("Gra zakończona!!!");

                }
            }

        }
    }

}

function parseGuess(guess) {

    var alphabet = ["A", "B", "C", "D", "E", "F", "G"];

    if (guess === null || guess.length != 2) {

        alert("Ups! Proszę wpisać literę i cyfrę!");
        document.getElementById("fireButton").setAttribute("disabled", true);

    } else {

        var firstChar;

        firstChar = guess.charAt(0);
        //      czyli - jeżeli np. strzał to będzie A0
        //      firstchar = guess.charAt(0); tu pobieramy to A
        //      var row = alphabet.indexOf(A); sprawdzamy, na którym miejscu jest w tablicy alphabet, i ponieważ jest na pierwszym ma indeks o numerze 0.
        //      czyli row = 0;
        var row = alphabet.indexOf(firstChar);
        //Przypomnienie - indexOf Metoda ta pobiera argument będący łańcuchem znaków i zwraca indeks pierwszego wystąpienia tego łańcucha w łańcuchu, na rzecz którego metoda została wywołana
        var column = guess.charAt(1);

        if (isNaN(row) || isNaN(column)) {
            alert("Ups, to nie są współrzędne!");
        } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
            alert("Ups, pole poza planszą!");
        } else {
            return row + column;
        }
        return null;
    }


}

function init() {

    var fireButton = document.getElementById("fireButton");
    // fireButton.onclick = handleFireButton;
    fireButton.addEventListener('click', handleFireButton);
    var guessInput = document.getElementById("guessInput");
    guessInput.onkeydown = handleKeyPress;

    var inputUpper = document.getElementById("guessInput");
    inputUpper.addEventListener("keyup", function() {
        this.value = this.value.toUpperCase();

        if (document.getElementById("guessInput").value.length == 2) {

            document.getElementById("fireButton").removeAttribute("disabled");

        } else {

            document.getElementById("fireButton").setAttribute("disabled", true);

        }

    })

    model.generateShipLocations();
}

function handleFireButton() {

    var guessInput = document.getElementById("guessInput");
    var guess = guessInput.value;
    controller.processGuess(guess);
    guessInput.value = "";

}

function handleKeyPress(event) {
    var fireButton = document.getElementById("fireButton");
    if (event.keyCode === 13) {
        fireButton.click();
        return false;
    }

}

window.onload = init;

//=====================

// console.log(`Ilość miejsc w jednym rzędzie wynosi: ${document.querySelectorAll('table tr')[1].children.length}`);

// console.log(`Ilość miejsc w jednej kolumnie wynosi: ${document.querySelectorAll('table tr').length}`);

console.log("");

// console.log(model.ships);

setTimeout(function() {
        // console.log(model.ships[0].locations);
        // console.log(model.ships[1].locations);
        // console.log(model.ships[2].locations);
    },
    500);