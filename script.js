// Display the list of characters in the form of a table.
//
//     You can create tables yourself on the website:
//
//     https://mockapi.io/projects
//
//         Example resource object for"heroes" (the path should be "heroes"):
//
// {
//     "name": "Iron Man",
//     "comics": "Marvel",
//     "favourite": true,
//     "id": "1"
// }
// Example resource object for "universes":
//
// {
//     "id": "1",
//     "name": "Marvel"
// }
// The table consists of 4 columns:
//
//     Name Surname
// Comics (DC, Marvel, Comix Zone)
// Favourite (checkbox)
// Actions (Delete button)
// Above the table, there's a form with three fields for adding a new character:
//
// Name Surname (input)
// Comics (DC, Marvel, Comix Zone) (select) – data retrieved using the GET method from the "universes" resource
// Favourite (true, false) (checkbox)
// Actions:
//
//     Upon form submission, the character is added to the database (POST), and the information about the hero is displayed in an HTML row in the table. If a hero with the same "name" property already exists in the database, the object is not added to the database (you can simply log a message to the console stating that a user with that name already exists in the database).
// When the checkbox state in the "Favourite" column is changed, the data for that character is updated in the database (PUT).
//     Upon clicking the Delete button in the character's row, the corresponding hero is removed from the database (DELETE), and the corresponding <tr> element is removed from the table.
// Basic layout is provided in the attached archive "heroes.zip".

const API = 'https://6582f61d02f747c8367ab8e8.mockapi.io/';

const inputHeroName = document.querySelector('input[data-name="heroName"]');
const comicsSelect = document.querySelector('select[data-name="heroComics"]');
const checkboxFavorite = document.querySelector('input[data-name="heroFavourite"]');
const buttonAddHero = document.querySelector('button[data-name="addHero"]');
const tableHeroes = document.querySelector('#heroesTable');

const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
}

async function controller(action, method = METHODS.GET, body) {
    const headers = {
        'Content-Type': 'application/json',
    }

    const request = {
        method,
        headers,
    }

    if (body) request.body = JSON.stringify(body);

    const response = await fetch(`${API}/${action}`, request);
    const data = await response.json();
    return data;
}

async function fetchHeroes() {
    const heroes = await controller('heroes');
    return heroes;
}

async function loadHeroes() {
    const heroes = await fetchHeroes();
    heroes.forEach(renderNewHero);
}

window.onload = loadHeroes;

function renderNewHero(hero) {
    const row = document.createElement('tr');
    row.dataset.id = hero.id;

    // NAME ================================================================
    const name = document.createElement('td');
    name.innerText = hero.name;

    // COMICS ================================================================
    const comics = document.createElement('td');
    comics.innerText = hero.comics;

    // FAVOURITE ================================================================
    const favourite = document.createElement('td');
    const labelFavourite = document.createElement('label');
    labelFavourite.className = 'heroFavouriteInput';
    labelFavourite.textContent = 'Favourite: ';
    const checkboxFavourite = document.createElement('input');
    checkboxFavourite.type = 'checkbox';
    checkboxFavourite.checked = hero.favourite;
    labelFavourite.appendChild(checkboxFavourite);
    favourite.appendChild(labelFavourite);
    checkboxFavourite.addEventListener('change', () => {
        updateHero(hero.id, {
            name: hero.name,
            comics: hero.comics,
            favourite: checkboxFavourite.checked
        });
    });

    // ACTIONS ================================================================
    const actions = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.addEventListener('click', async () => {
        await controller(`heroes/${hero.id}`, METHODS.DELETE).then(() => {
            row.remove();
        });
    })

    // APPEND CHILDS ================================================================
    actions.appendChild(deleteButton);

    row.appendChild(name);
    row.appendChild(comics);
    row.appendChild(favourite);
    row.appendChild(actions);

    tableHeroes.appendChild(row);
}

async function updateHero(id, updatedFields) {
    await controller(`heroes/${id}`, METHODS.PUT, updatedFields);
}

buttonAddHero.addEventListener('click', async () => {
    if (!inputHeroName.value) return;
    const name = inputHeroName.value;
    const comics = comicsSelect.value;
    const favourite = checkboxFavorite.checked;

    const hero = {
        name,
        comics,
        favourite,
    }

    const heroes = await fetchHeroes();
    const heroExists = heroes.some(item => item.name === hero.name);

    if (heroExists) {
        console.log('Hero already exists');
        return;
    }

    await controller('heroes', METHODS.POST, hero);
    renderNewHero(hero);
});
