//componentWillMount()
const betSizeInput = document.getElementById("betSizeInput")
const takeCardBtn = document.getElementById("takeCardBtn")
const checkCardsBtn = document.getElementById("checkCardsBtn")
const startGameBtn = document.getElementById("startGameBtn")
const playerHandEl = document.getElementById("playerHand")
const stickmanHandEl = document.getElementById("stickmanHand")
const playerHandSum = document.getElementById("playerHandSum")
const stickmanHandSum = document.getElementById("stickmanHandSum")
const balanceDisplay = document.getElementById("balanceDisplay")

let bet = Number;
let player = [];
let stickman = [];
let deck = [];

const takingCardDelay = 300
function takingCard(ms) {
    return new Promise(resolve => setTimeout(resolve, ms = takingCardDelay));
}

startGameBtn.addEventListener("click", startGame)
takeCardBtn.addEventListener("click", () => playermove(true))
checkCardsBtn.addEventListener("click", () => {
    takeCardBtn.disabled = true;
    checkCardsBtn.disabled = true;
    playermove(false)
})

if (localStorage.getItem("balance") == null) {
    localStorage.setItem("balance", 5000)
}

function refreshTable() {
    takeCardBtn.disabled = true;
    checkCardsBtn.disabled = true;
    startGameBtn.disabled = false;
    betSizeInput.value = 0;
    betSizeInput.disabled = false;

    const currentBalance = localStorage.getItem("balance")
    balanceDisplay.innerHTML = currentBalance;


}
refreshTable()

function randomInteger(min, max) {
    // случайное число от min до (max+1)
    let rand = min + Math.random() * (max - min);
    return Math.floor(rand);
}

function tryBet() {
    let balance = Number(localStorage.getItem("balance"))
    bet = Number(betSizeInput.value)

    if (balance > bet && bet > 0) {
        balance = balance - bet
        return balance
    } else {
        betSizeInput.style.trasition = "0.3s"
        betSizeInput.style.border = "2px red solid"
        setTimeout(() => {
            betSizeInput.style.border = "1px black solid"
        }, 1000);
        return false
    }
}

function takeCard(person) {
    // person = player / stickman
    const idx = randomInteger(0, deck.length)
    const card = deck[idx]
    // take from deck
    const index = deck.indexOf(card);
    if (index > -1) {
        deck.splice(index, 1);
    }
    // give to player
    person.push(card)
    // display new card
    let hand;
    person == player ? hand = playerHandEl : hand = stickmanHandEl

    let cardEl = document.createElement("div")
    cardEl.className = "col-md-1 bg-white m-2 d-flex align-items-center justify-content-center"
    let img = document.createElement("img")
    img.className = "col-md-6"
    img.alt = "card img"
    img.src = "./img/" + card.suit + ".png"
    let p = document.createElement("p")
    let hr = document.createElement("hr")
    p.textContent = card.title
    cardEl.appendChild(img)
    cardEl.appendChild(p)
    hand.appendChild(cardEl)

    // display new hands sum
    playerHandSum.innerHTML = handSum(player)
    stickmanHandSum.innerHTML = handSum(stickman)
}

function handSum(person) {
    let values = person.map(item => item.value)
    let sum = values.reduce((a, b) => a + b, 0)
    return sum
}

function flop() {
    // clean hands display
    playerHandSum.innerHTML = ``
    stickmanHandSum.innerHTML = ``

    // refresh deck
    playerHandEl.innerHTML = ``
    stickmanHandEl.innerHTML = ``
    player = [];
    stickman = [];
    deck = [];
    const cardsSuits = ["Hearts", "Tiles", "Clovers", "Pikes"]
    cardsSuits.forEach(suit => {
        deck.push(
            {
                suit: suit,
                title: "A",
                value: 1
            },
            {
                suit: suit,
                title: "2",
                value: 2
            },
            {
                suit: suit,
                title: "3",
                value: 3
            },
            {
                suit: suit,
                title: "4",
                value: 4
            },
            {
                suit: suit,
                title: "5",
                value: 5
            },
            {
                suit: suit,
                title: "6",
                value: 6
            },
            {
                suit: suit,
                title: "7",
                value: 7
            },
            {
                suit: suit,
                title: "8",
                value: 8
            },
            {
                suit: suit,
                title: "9",
                value: 9
            },
            {
                suit: suit,
                title: "10",
                value: 10
            },
            {
                suit: suit,
                title: "J",
                value: 2
            },
            {
                suit: suit,
                title: "Q",
                value: 3
            },
            {
                suit: suit,
                title: "K",
                value: 4
            },

        )
    })

    balance = tryBet()
    localStorage.setItem("balance", balance)
    betSizeInput.disabled = true;
    startGameBtn.disabled = true;

    (async () => {
        takeCard(player)
        await takingCard();
        takeCard(stickman)
        await takingCard();
        takeCard(player)
        await takingCard();
        takeCard(stickman);

        takeCardBtn.disabled = false;
        checkCardsBtn.disabled = false;
    })()
}

function startGame() {
    if (tryBet() != false) {
        flop()

        switch (handSum(stickman)) {
            case 21:
                handSum(player) == 21 ? CheckWin() : CheckWin(stickman)
                break;
            default:
            // playermove(true/false)
        }
    }
}

function nextMove(person, value) {
    if (person == stickman && value == 21) {
        if (handSum(stickman) > 21) {
            CheckWin(player)
        } else {
            nextMove(stickman, 17)
        }
    }
    if (person == stickman && value == 17) {
        if (handSum(stickman) >= 17) {
            CheckWin()

            takeCardBtn.disabled = true;
            checkCardsBtn.disabled = true;
        } else {
            (async () => {
                await takingCard();
                takeCard(stickman)
                nextMove(stickman, 21)
            })()

        }
    }
    if (person == player && value == 21) {
        CheckWin(stickman)
    }
}

function playermove(boolean) {
    switch (boolean) {
        case (true):
            takeCard(player)
            if (handSum(player) > 21) {
                nextMove(player, 21)
            } else {
                takeCardBtn.disabled = false;
                checkCardsBtn.disabled = false;
            }
            break;
        case (false):
            nextMove(stickman, 21)
            break;
    }
}

function CheckWin(winner = undefined) {
    refreshTable()

    switch (winner) {
        case player:
            updateBalance(winner)
            inform("You win")
            break;
        case stickman:
            inform("You lose")
            break;
        case "standoff":
            updateBalance(winner)
            inform(winner)
            break;
        case undefined:
            if (handSum(player) > handSum(stickman)) {
                CheckWin(player)
            }
            if (handSum(player) < handSum(stickman)) {
                CheckWin(stickman)
            }
            if (handSum(player) == handSum(stickman)) {
                CheckWin("standoff")
            }
    }
}

function updateBalance(winner) {
    const currentBalance = Number(localStorage.getItem("balance"))

    switch (winner) {
        case player:
            newBalance = currentBalance + bet * 2
            localStorage.setItem("balance", newBalance)
            break;
        case "standoff":
            newBalance = currentBalance + bet
            localStorage.setItem("balance", newBalance)
            break;
    }
}

function inform(text){
    setTimeout(() => {
        balanceDisplay.innerHTML = localStorage.getItem("balance")
    }, 2000);
}