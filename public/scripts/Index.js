const PlayerTurn = document.querySelector(".game-header span ");
const ChatText = document.querySelector(".game-chat-result-message");
const GamePanels = document.querySelector(".game-puzzle");
const ChatInput = document.querySelector("input");
const ChatForm = document.querySelector("form");
const NextPlayer = document.querySelector("h1");
let SingleGameMode = false;
let MultiGameMode = false;
let TurnOnOffGame = "";
const Platforms = [];
let controlTest = 0;
let currentPlayer = "user";
let playerNum = 0;
let current = "X";
let Winposition = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let states = ["", "", "", "", "", "", "", "", ""];

const PlatformCreator = (i) => {
  const div = document.createElement("div");
  div.className = "panel";
  div.id = i;
  Platforms.push(div);
  GamePanels.appendChild(div);
};

const CreatePlatform = () => {
  for (let i = 0; i < 9; i++) {
    PlatformCreator(i);
  }
};
CreatePlatform();

const MultiPlayerMode = () => {
  const socket = io();
  SingleGameMode = false;
  MultiGameMode = true;

  ChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (ChatInput.value) {
      socket.emit("chat message", ChatInput.value);
      ChatInput.value = "";
    }
  });

  socket.on("chat message", ({ playerIndex, msg }) => {
    DisplayChatMessage(playerIndex, msg);
  });

  socket.on("player-number", (number) => {
    BlockDoubleClick(number, socket);
  });

  socket.on("player-type", (arg) => {
    Connections(arg);
  });

  socket.on("playerMove", ({ i, playerIndex }) => {
    if (states[i] !== "") return;
    ControlMultiplayerUser(i, playerIndex);
    CheckWinner(states);
  });

  socket.on("check", (players) => {
    players.forEach((p, i) => {
      if (p.connected) Connections(i);
    });
  });
};

const DisplayChatMessage = (playerIndex, msg) => {
  const p = document.createElement("p");
  p.innerHTML = ` Player${parseInt(playerIndex) + 1} : ${msg}  `;
  p.className = `Player${
    playerIndex === playerNum
      ? parseInt(playerIndex)
      : parseInt(playerIndex) + 2
  }`;
  ChatText.appendChild(p);
};

const BlockDoubleClick = (number, socket) => {
  playerNum = parseInt(number);
  if (playerNum === -1) ChatText.innerHTML = "Server is Full";
  TurnOnOffGame = playerNum;
  Platforms.forEach((platform) => {
    platform.addEventListener("click", () => {
      if (
        (TurnOnOffGame.toString().includes("stop") ||
          TurnOnOffGame === 1 ||
          TurnOnOffGame === 0) &&
        MultiGameMode === true &&
        currentPlayer === "user" &&
        parseInt(controlTest) === 0
      ) {
        PlayMultiPlatform(socket, platform);
      }
    });
  });
  socket.emit("check");
};

const Connections = (num) => {
  let player = `.p${parseInt(num) + 1}`;
  let CurrentUser = document.querySelector(`${player} .connected span`);
  if (parseInt(num) === playerNum) {
    currentPlayer = "enemy";
  } else {
    currentPlayer = "user";
  }
  if (CurrentUser) {
    CurrentUser.classList.toggle("green");
  }
  if (parseInt(num) === playerNum) {
    document.querySelector(player).style.fontWeight = "bold";
  }
  if (player) {
    ClearGame();
  }
};

const ControlMultiplayerUser = (i, playerIndex) => {
  let CurrentClickedPlatform = Platforms.filter(
    (platform) => parseInt(platform.id) === parseInt(i)
  );
  current = current === "X" ? "O" : "X";
  NextPlayer.innerHTML = `Next move ${current === "X" ? "O" : "X"}`;
  if (
    (current === "X" && playerNum === 0 && playerIndex === 0) ||
    (current === "O" && playerNum === 0 && playerIndex === 0) ||
    (current === "X" && playerNum === 1 && playerIndex === 1) ||
    (current === "O" && playerNum === 1 && playerIndex === 1)
  ) {
    PlayerTurn.innerHTML = "Enemy's Go";
    currentPlayer = "enemy";
    TurnOnOffGame = "play";
    controlTest = 1;
  } else {
    PlayerTurn.innerHTML = "Your Go";
    TurnOnOffGame = "stop";
    currentPlayer = "user";
    controlTest = 0;
  }

  states[i] = current;
  CurrentClickedPlatform[0].innerHTML = `<p class =${current}></p>`;
};

const PlayMultiPlatform = (socket, i) => {
  socket.emit("playerMove", i.id);
};

const SinglePlayerMode = () => {
  SingleGameMode = true;
  Platforms.forEach((platform) => {
    platform.addEventListener("click", () => Play(platform));
  });
};

const Play = (i) => {
  let id = i.id;
  if (SingleGameMode === true) {
    if (states[id] !== "") return;
    if (SingleGameMode === true) {
      current = current === "X" ? "O" : "X";
      NextPlayer.innerHTML = `Next Move : ${current === "X" ? "O" : "X"}`;
      states[id] = current;
      i.innerHTML = `<p class =${current}></p>`;
    }
  }
  CheckWinner(states);
};

const CheckWinner = (states) => {
  Winposition.forEach((pos) => {
    const [a, b, c] = pos;
    if (states[a] && states[a] === states[b] && states[a] === states[c]) {
      NextPlayer.innerHTML = `Winner ${states[a]}`;
      SingleGameMode = false;
      MultiGameMode = false;
      Restart();
    } else {
      Draw(states);
    }
  });
};

const Draw = (states) => {
  if (!states.includes("") && NextPlayer) {
    NextPlayer.innerHTML = "DRAW";
    gameOn = false;
    Restart();
  }
};

const Restart = () => {
  setTimeout(() => {
    ClearGame();
    gameOn = true;
    MultiGameMode = true;
    SingleGameMode = true;
  }, 1000);
};

const ClearGame = () => {
  states = ["", "", "", "", "", "", "", "", ""];
  if (PlayerTurn) PlayerTurn.innerHTML = "";
  NextPlayer.innerHTML = "Next Move: X";
  Platforms.forEach((platform) => (platform.innerHTML = ""));
  current = "Next Move: X";
};

const ButtonJoystick = () => {
  switch (Control.toString()) {
    case "SinglePlayer":
      SinglePlayerMode();
      break;
    case "MultiPlayer":
      MultiPlayerMode();
      break;
    default:
      break;
  }
};
ButtonJoystick();

exports.Winposition = Winposition;
exports.states = States;
exports.current = current;
exports.playerNum = playerNum;
exports.currentPlayer = currentPlayer;
exports.controlTest = controlTest;
exports.Platforms = Platforms;
exports.TurnOnOffGame = TurnOnOffGame;
exports.MultiGameMode = MultiGameMode;
exports.SingleGameMode = SingleGameMode;
exports.Control = Control;
