const cohortName = "2410-FTB-ET-WEB-PT";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;

const state = {
  players: [],
  player: null
};


/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(`${API_URL}/players`);
    const json = await response.json();
    const myPlayers = json.data["players"];
    console.log(myPlayers);
    state.players = myPlayers;
    return myPlayers;
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};

/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/players/${playerId}`);
    const player = await response.json();
    console.log(player.data);
    const myPlayer = json.data["player"];
    return myPlayer;
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
  console.log("Adding a new Puppy");
  try {
    const response = await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerObj)
    });
    const player = await response.json();

    if (player.error) {
      throw new Error(player.error.message);
    }
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try {
    await fetch(`${API_URL}/players/${playerId}`, {
      method: 'DELETE'
    });
    const players = await fetchAllPlayers();
    renderAllPlayers(players);
  } catch (err) {
    console.error(`Whoops, trouble removing player #${playerId} from the roster!`, err);
  }
};

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => {
  try {
    const main = document.querySelector("main");
    const playerContent = document.createElement("div");

    const playersTitle = document.createElement("h2");
    playersTitle.textContent = "Current Players";
    main.replaceChildren(playersTitle);

    if (!playerList.length) {
      playerContent.textContent = "The player list is empty";
    } else {
      const allPlayers = playerList.map((player) => {
        const playerInfo = document.createElement("ul");
        playerInfo.innerHTML = `
        <div class="player_card">
          <h3>${player.name}</h3>
          <h4>Player Id: ${player.id}</h4>
          <img src="${player.imageUrl}" alt="${player.name}" />
        
          <button id="${player.id}details">See Details</button>
          <button id="${player.id}remove">Remove Player</button>
        </div>
        `;
        return playerInfo;
      });
      playerContent.replaceChildren(...allPlayers);
    }
    main.append(playerContent);

    addButtonEventListeners(playerList);

  } catch (err) {
    console.error(`Failed to render players.`, err);
  }
};

/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = (player) => {
  try {
    const header = document.querySelector("header");
    const title = document.createElement("h1");
    title.textContent = `${player.name}`;
    header.replaceChildren(title);

    document.querySelector("form").hidden = true;

    const main = document.querySelector("main");
    const playerContent = document.createElement("div");

    const playerInfo = document.createElement("ul");
    console.log(player);

    let teamAssignment = "";
    if (player.teamId != null) {
      teamAssignment = player.teamId;
    } else {
      teamAssignment = "Unassigned";
    }

    playerInfo.innerHTML = `
      <h3>Player Id: ${player.id}</h3>
      <h3>Breed: ${player.breed}</h3>
      <img src="${player.imageUrl}" alt="${player.name}" />
      <h3>Current Team: ${teamAssignment}</h3>
    
      <button id="return">Back to all players</button>
    `;
    
    playerContent.replaceChildren(playerInfo);
    main.replaceChildren(playerContent);

    addButtonEventListener();

  } catch (err) {
    console.error(`Failed to render player.`, err);
  }
};

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  try {
    const myForm = document.getElementById('new-player-form');

    myForm.innerHTML = `
      <h3>Add a new player: </h3>
      <label>
        Name: 
        <input type="text" name="playerName" />
      </label>
      <label>
        Breed: 
        <input type="text" name="playerBreed" />
      </label>
      <label>
        Status: 
        <input type="text" name="playerStatus" />
      </label>
      <label>
        Link to Image: 
        <input type="text" name="playerImage" />
      </label>
      <label>
        Team: 
        <input type="text" name="playerTeam" />
      </label>
      <button>Submit</button>
    `;
    myForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const player = {
          name: myForm.playerName.value,
          breed: myForm.playerBreed.value,
          status: myForm.playerStatus.value,
          imageUrl: myForm.playerImage.value,
          teamId: parseInt(myForm.playerTeam.value)
      };
  
      await addNewPlayer(player);
      await renderMainPage();
      myForm.reset();
  });

  } catch (err) {
    console.error("Uh oh, trouble rendering the new player form!", err);
  }
};

const renderMainPageHeading = () => {
  const header = document.querySelector("header");
    const title = document.createElement("h1");
    title.textContent = `Puppy Bowl`;
    header.replaceChildren(title);
}

const addButtonEventListeners = (players) => {
  players.map((player) => {
    document.getElementById(`${player.id}details`).addEventListener('click', async (event) => {
      renderSinglePlayer(player);
    });
    document.getElementById(`${player.id}remove`).addEventListener('click', async (event) => {
      removePlayer(player.id);
    });
  });
  return;
}

const addButtonEventListener = () => {
  document.getElementById("return").addEventListener('click', async (event) => {
    renderMainPage(state.players);
  });
  return;
}

const renderMainPage = async () => {
  await renderMainPageHeading();
  document.querySelector("form").hidden = false;
  const players = await fetchAllPlayers();
  renderAllPlayers(players);
};

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
  await renderMainPageHeading();
  document.querySelector("form").hidden = false;
  await renderNewPlayerForm();
  const players = await fetchAllPlayers();
  renderAllPlayers(players);
};

// This script will be run using Node when testing, so here we're doing a quick
// check to see if we're in Node or the browser, and exporting the functions
// we want to test if we're in Node.
if (typeof window === "undefined") {
  module.exports = {
    fetchAllPlayers,
    fetchSinglePlayer,
    addNewPlayer,
    removePlayer,
    renderAllPlayers,
    renderSinglePlayer,
    renderNewPlayerForm,
  };
} else {
  init();
}