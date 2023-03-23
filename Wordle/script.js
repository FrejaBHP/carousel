//----------------------- Globale værdier og variabler -----------------------
const gridX = 6;
const gridY = 5;
let currentTry = 0;

let gameWon = false;
let isStreaking = false;
let currentStreak = 0;

let SolvedWord = "";
let WordToTry = "";

let temp;
let omitIndex = 0;

const colourBlack = "rgba(18, 18, 18, 1)";
const colourDarkGrey = "rgba(58, 58, 60, 1)";
const colourGrey = "rgba(88, 88, 88, 1)";
const colourLightGrey = "rgba(130, 130, 130, 1)";
const colourWhite = "rgba(255, 255, 255, 1)";

const colourRed = "rgba(180, 50, 50, 1)";
const colourYellow = "rgba(180, 160, 60, 1)";
const colourGreen = "rgba(80, 140, 80, 1)";

const WordList = [];
const Keys = [ //Vi sætter keyboardet i et gitter, så det er næsten nemmest at præ-definere det
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BCKSPC"]
    ];


//----------------------- Start/Genstart af spil -----------------------

window.onload = CreateGame(); //Starter, når vinduet indlæses

function CreateGame() { //Spilopsætning, starter når siden indlæses
    OtherButtonFunc();
    CreateGrid();
    CreateKeyboard();
    LoadWordsFromFile();
}

function RestartGame() { //Nulstilling af spil til ny runde
    ToggleResetButton(false);
    ChangeStatusColour(colourWhite);
    ChangeStatusText("");
    ResetAllRows();
    ResetAllKeys();

    if (gameWon == true) {
        Streak();
    }
    else {
        StopStreak();
    }

    gameWon = false;
    WordToTry = "";
    currentTry = 0;
    ChooseWord();
}

function Streak() {
    if (currentStreak == 0) {
        ShowStreak();
    }
    currentStreak++;
    ChangeStreakNumber();
}

function ShowStreak() {
    document.getElementById("streakCounter").style.display = "block";
}

function StopStreak() {
    currentStreak = 0;
    ChangeStreakNumber();
    document.getElementById("streakCounter").style.display = "none";
}


//----------------------- Små metoder -----------------------

function OtherButtonFunc() { //Gør den manuelle upload funktionel i tilfælde af, at den kan bruges. Derudover giver den funktionalitet til genstartsknappen
    document.getElementById("wordListUpload").onclick = () => LoadFileManually();
    document.getElementById("restartButton").onclick = () => RestartGame();
}

function ToggleResetButton(onoff) {
    if (onoff == false) {
        document.getElementById("restartButton").style.display = "none";
    }
    else if (onoff == true) {
        document.getElementById("restartButton").style.display = "unset";
    }
}

function ChangeStatusText(string) { //Ændrer teksten over spilgitteret
    document.getElementById("gameStatusText").innerText = string;
}

function ChangeStatusColour(colour) { //Ændrer samme teksts farve
    document.getElementById("gameStatusText").style.color = colour;
}

function ChangeStreakNumber() { //Ændrer streaknummeret på siden
    document.getElementById("streakNumber").textContent = currentStreak;
}


//----------------------- Opsætning -----------------------

function CreateGrid() { //Laver det kendte 6x5 gitter til bogstaverne og giver dem id'er time senere
    for (x = 0; x < gridX; x++) {
        for (y = 0; y < gridY; y++) {
            let pageItem = document.createElement("div");
            pageItem.classList.add("Item");
            pageItem.setAttribute("id", "item " + x + "-" + y);
            pageItem.style.border = ("2px solid") + " " + colourDarkGrey;
            pageItem.style.gridRow = x+1;
            pageItem.style.gridColumn = y+1;
            document.getElementById("wordleGrid").append(pageItem);
        }
    }
}

function CreateKeyboard() { //Her laves skærmkeyboardet
    for (x = 0; x < 3; x++) {
        for (y = 0; y < Keys[x].length; y++) {
            let pageItem = document.createElement("button");
            pageItem.setAttribute("type", "button");
            pageItem.classList.add("Key");
            pageItem.setAttribute("id", "key" + Keys[x][y]); //Giver dem deres tast som ID, sat op som tastaturarrayet
            pageItem.setAttribute("data-colour", "");
            pageItem.style.backgroundColor = colourLightGrey;
            pageItem.style.gridColumn = y+1;
            if (Keys[x][y] != "BCKSPC") {
                pageItem.innerHTML = Keys[x][y]; //Markerer tasterne
            }
            else { //Backspace bruger et ikon i stedet for tekst
                pageItem.innerHTML = '<i class="material-icons-outlined">backspace</i>';
            }
            pageItem.onclick = () => UseKeyboard(pageItem.innerHTML); //Blev nødt til at lave det om til arrow funktion(?) da alle tasterne fyrede på én gang, når de blev lavet
            document.getElementById("kbRow" + (x+1)).append(pageItem);
        }
    } 
}


//----------------------- Relateret til ordliste -----------------------

function LoadFileManually() { //Grundet sikkerhedsårsager, kan filer ikke automatisk læses, hvis siden ikke er på en server. Derfor får man muligheden for selv at uploade ordlisten, hvis den mangler
    const fileElem = document.getElementById("wordListInput");
    fileElem.click();
    let rawString = "";

    fileElem.addEventListener('change', () => {
        const selectedFile = fileElem.files[0];
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            rawString = reader.result;
            CompileWordsManually(rawString);
        })
        reader.readAsText(selectedFile)
    })
}

function CompileWordsManually(string) {
    document.getElementById("wordListUpload").style.display = "none"; //Fjerner uploadknappen, da der nu er en aktiv ordliste
    ChangeStatusText("");
    string = string.toUpperCase();
    var words = string.split("\n");

    for (var i in words) {
        WordList[i] = words[i]
    }
    ChooseWord();
}

function LoadWordsFromFile() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        CompileWordsIntoList(this);
    }};

    xhttp.onerror = function() {
        document.getElementById("wordListUpload").style.display = "unset"; //Viser uploadknappen, da listen ikke automatisk kan læses
        ChangeStatusText("Mangler ordliste");
    };

    xhttp.open("GET", "Assets/valid-wordle-words.txt", true);
    xhttp.send();
}

function CompileWordsIntoList(response) {
    let allWords = response.responseText;
    allWords = allWords.toUpperCase();
    var words = allWords.split("\n");

    for (var i in words) {
        WordList[i] = words[i]
    }
    ChooseWord();
}

function ChooseWord() { //Vælger tilfældigt et ord fra listen
    let random = (Math.floor(Math.random() * WordList.length));
    SolvedWord = WordList[random];
}


//----------------------- Relateret til individuelle undergittere -----------------------

function SetGridValue(pos, val) { //Sætter et felts tekst med ID
    document.getElementById("item " + pos).innerText = val;
}

function SetGridBorder(pos, todo) { //Omfarver kant på gitter
    let tile = document.getElementById("item " + pos);
    switch(true) {
        case (todo == "add"):
            tile.style.borderColor = colourGrey;
            break;
        case (todo == "remove"):
            tile.style.borderColor = colourDarkGrey;
            break;
        default: break;
    }
}

function ResetAllRows() { //Nulstiller alle bogstaver, farver og kanter på spil
    for (x = 0; x < gridX; x++) {
        for (y = 0; y < gridY; y++) {
            let tile = document.getElementById("item " + (x + "-" + y));
            tile.style.borderColor = colourDarkGrey;
            tile.style.background = colourBlack;
            SetGridValue((x + "-" + y), "");
        }
    }
}

function PaintRow() { //Farver hel række, kun til når man vinder
    for (i = 0; i < gridY; i++) {
        let tile = document.getElementById("item " + (currentTry + "-" + i));
        tile.style.borderColor = colourGreen;
        tile.style.background = colourGreen;
    }
}

function PaintTile(posY, colour) { //Farver et gitter
    let tile = document.getElementById("item " + currentTry + "-" + posY);
    if (colour == 0) {
        tile.style.borderColor = colourYellow;
        tile.style.background = colourYellow;
    }
    else if (colour == 1) {
        tile.style.borderColor = colourGreen;
        tile.style.background = colourGreen;
    }
    else if (colour == 2) {
        tile.style.borderColor = colourDarkGrey;
        tile.style.background = colourDarkGrey;
    }
}

function ResetAllKeys() { //Nulstiller alle skærmkeyboardets farver
    for (x = 0; x < 3; x++) {
        for (y = 0; y < Keys[x].length; y++) {
            key = document.getElementById("key" + Keys[x][y]);
            key.dataset.colour = "";
            key.style.backgroundColor = colourLightGrey;
        }
    }
}

function PaintKey(key, colour) { //Farver en tast
    let kbKey = document.getElementById("key" + key);
    if (colour == 0 && document.getElementById("key" + key).dataset.colour != 1) {
        kbKey.style.backgroundColor = colourYellow;
        kbKey.dataset.colour = 0;
    }
    else if (colour == 1) {
        kbKey.style.backgroundColor = colourGreen;
        kbKey.dataset.colour = 1;
    }
    else if (colour == 2 && document.getElementById("key" + key).dataset.colour == "") {
        kbKey.style.backgroundColor = colourDarkGrey;
        kbKey.dataset.colour = 2;
    }
}


//----------------------- Indtastning af bogstaver -----------------------

window.addEventListener('keydown', (input) => { //Registerer tast på hele siden
    if (!gameWon) {
        if ((input.key >= 'a' && input.key <= 'z') && WordToTry.length < gridY) {
            ModifyGuess("add", input.key);
        }
        else if ((input.key == 'Backspace') && WordToTry.length > 0) {
            ModifyGuess("remove");
        }
        else if (input.key == 'Enter') {
            TryGuessWord();
        }
    }
});

function UseKeyboard(key) { //Registerer klik på skærmkeyboard
    if (!gameWon) {
        if ((key.length == 1 && WordToTry.length < gridY)) {
            ModifyGuess("add", key);
        }
        else if ((key == '<i class="material-icons-outlined">backspace</i>') && WordToTry.length > 0) { //Dette burde nok have været lavet med HTML datasets i stedet
            ModifyGuess("remove");
        }
        else if (key == 'ENTER') {
            TryGuessWord();
        }
    }
}


//----------------------- Indtastning i UI -----------------------

function ModifyGuess(todo, value) { //Modificerer "gæt"
    switch(true) {
        case (todo == "add"):
            WordToTry += value.toUpperCase();
            break;
        case (todo == "remove"):
            WordToTry = WordToTry.slice(0, -1);
            break;
        default: break;
    }
    ModifyGuessUIText(todo);
}

function ModifyGuessUIText(todo) { //Afspejler "gæt" i gitter på skærm
    let position;
    switch(true) {
        case (todo == "add"):
            for (i = 0; i < WordToTry.length; i++) {
                position = (currentTry + "-" + i);
                SetGridValue(position, WordToTry[i]);
            }
            break;
        case (todo == "remove"):
            position = (currentTry + "-" + WordToTry.length);
            SetGridValue(position, "");
            break;
        case (todo == "newline"):
            position = (currentTry + "-" + 0);
            break;
        default: break;
    }
    SetGridBorder(position, todo);
}


//----------------------- Sammenligning af ord -----------------------

function TryGuessWord() { //Tjekker først, om ordet er 5 bogstaver langt, findes i ordlisten og ikke er i stykker
    if (WordToTry.length == 5) {
        let validWord = WordList.find(CheckValidWord);
        if (validWord != undefined) {
            GuessWord();
        }
    }
}

function CheckValidWord(word, index, array) {
    return word == WordToTry;
}

function GuessWord() { //Når en række skal tjekkes igennem
    if (WordToTry == SolvedWord) {
        WinGame();
    }
    else {
        CompareWord();
        currentTry++;
        WordToTry = "";
        if (currentTry == 6) { //Efter 6 forsøg, taber man spillet
            LoseGame();
        }
    }
}

function CompareWord() { //Her foregår den primære spillogik, og ord sammenlignes
    let identical = false;
    let inWord = false;
    temp = SolvedWord; //Vigtig variabel, der kopierer svaret, men løbende lader sig "smuldre" til bedre isolering af bogstaver og feedback
    const Identical = [];
    
    //Der tjekkes først igennem for identiske bogstaver, hvorved de markeres og farves grønne
    for (i = 0; i < WordToTry.length; i++) {
        identical = HasIdenticalLetter(i);
        if (identical) {
            OmitLetterI(i);
            PaintTile(i, 1);
            PaintKey(WordToTry[i], 1);
            Identical.push(1);
        }
        else {
            Identical.push(0);
        }
    }

    //Derefter tjekkes der igennem for bogstaver, som findes, men ikke står rigtigt.
    for (i = 0; i < WordToTry.length; i++) {
        inWord = HasLetter(i);
        if (Identical[i] == 0) {
            if (inWord) {
                OmitLetterTemp();
                PaintTile(i, 0);
                PaintKey(WordToTry[i], 0);
            }
            else {
                PaintTile(i, 2);
                PaintKey(WordToTry[i], 2);
            }
        } 
        omitIndex = 0;
    }
}

function HasIdenticalLetter(index) { //Er index af ord det samme i både gæt og det ord, man skal gætte?
    let identical = false;
    if (WordToTry[index] === SolvedWord[index]) {
        identical = true;
    }
    return identical;
}

function HasLetter(index) { //Findes index af ord i bogstaverne tilovers?
    let hasLetter = false;
    let validLetter = temp.search(WordToTry[index]);
    if (validLetter != -1) {
        hasLetter = true;
        omitIndex = validLetter;
    }
    return hasLetter;
}

function OmitLetterI(index) { //Fjerner et identisk bogstav, så den ikke tælles med senere
    temp = temp.replace(temp[index], "!");
}

function OmitLetterTemp() {
    temp = temp.replace(temp[omitIndex], "!"); //Fjerner et bogstav ved den første fundne index fra HasLetter, så ikke tælles 2 gange ved 2 samme bogstaver i gæt
}


//----------------------- Slutning af spil -----------------------

function WinGame() {
    PaintRow();
    for (i = 0; i < SolvedWord.length; i++) {
        PaintKey(SolvedWord[i], 1);
    }
    ChangeStatusColour(colourGreen);
    ChangeStatusText("Tillykke! Du gættede rigtigt!\nOrdet var " + SolvedWord);
    ToggleResetButton(true);
    gameWon = true;
}

function LoseGame() {
    ChangeStatusColour(colourRed);
    ChangeStatusText("Du er løbet tør for forsøg!\nOrdet var " + SolvedWord);
    ToggleResetButton(true);
}