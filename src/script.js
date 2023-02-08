'use strict';

const selectFont = document.querySelector('.font__type');
const searchForm = document.querySelector('.search');
const searchInput = document.querySelector('.search-form');
const themeState = window.matchMedia('(prefers-color-scheme: dark)');
const toggleBall = document.querySelector('.toggle-ball');
const body = document.querySelector('body');
const main = document.querySelector('.main');
const errorMessage = document.querySelector('.error-message');

// Switch theme
const toggleDarkMode = (state) =>
  document.documentElement.classList.toggle(state);
toggleDarkMode(themeState.matches);

toggleBall.addEventListener('click', () =>
  document.documentElement.classList.toggle('dark-mode')
);

// Font switch
selectFont.addEventListener(
  'change',
  (e) => (body.dataset.font = e.target.value)
);

// API Call
const getWord = async function (word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    if (!response.ok) {
      clearScreen();
      throw new Error('Word not Found!!!');
    }

    renderError('', 0);

    const [data] = await response.json();

    if (main.innerHTML !== '') main.innerHTML = '';
    if (document.querySelector('.source'))
      document.querySelector('.source').remove();

    generateWord(data);
  } catch (error) {
    renderError(error.message, 1);
  }
};

// Submit form
searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const searchResult = searchInput.value;
  getWord(searchResult);
});

// Extract Data
const generateWord = async function (data) {
  try {
    const { word, phonetics, meanings } = data;
    const phonics = phonetics[0];
    const [noun, verb, interjection] = meanings;
    console.log(word, phonics, meanings);

    const html = `
    <section class = 'word'>
        <div>
        <h3 class = 'word__heading'>${word}</h3>
        <p class = 'word__phonetics'>${phonics.text ? phonics.text : ''}</p>
        </div>

        <button onclick= playAudio('${
          phonics.audio
        }') class = 'word__audio play'>
            <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75"><g fill="#A445ED" fill-rule="evenodd"><circle cx="37.5" cy="37.5" r="37.5" opacity=".25"/><path d="M29 27v21l21-10.5z"/></g></svg>
            </button>
    </section>
    
    <!------------------------ Noun ------------------------>
    <section class = 'word__definition noun'>
        <div class = 'hr__con'>
            <h4 class = word__definition__heading>${noun.partOfSpeech}</h4>
            <span class = 'hr'></span>
        </div>

        <p class = 'meaning'>Meaning</p>
        <ul class = 'word__definition__list noun__definition__list'> </ul>
        <div class = 'word__definition__synonym noun__definition__synonym'>

            <p class = 'word__definition__synonym__heading'>Synonyms</p>
            <div class = 'word__definition__synonym__example noun__definition__synonym__example'></div>
        </div>
    </section>
  `;
    main.insertAdjacentHTML('beforeend', html);

    if (!phonics.audio)
      document.querySelector('.word__audio').style.display = 'none';

    // Build definitions for noun
    buildDefinitions(noun, document.querySelector('.noun__definition__list'));

    if (verb) buildElement(verb);
    if (interjection) buildElement(interjection);
    sourceDefinition(word);
  } catch (error) {
    console.log(error);
  }
};

// Play Audio
const playAudio = function (url) {
  const audio = new Audio(url);
  audio.play();
};

// Build Element (Verb, Interjection, Adjective)
const buildElement = function (type) {
  const html = `
    <!------------------ ${type.partOfSpeech} ------------------>
    <section class = 'word__definition verb'>
        <div class = 'hr__con'>
          <h4 class = word__definition__heading>${type.partOfSpeech}</h4>
          <span class = 'hr'></span>
        </div>
          <p class = 'meaning'>meaning</p>
          <ul class = 'word__definition__list ${type.partOfSpeech}__definition__list'> </ul>
          <div class = 'word__definition__synonym ${type.partOfSpeech}__definition__synonym'>
              <p class = 'word__definition__synonym__heading'>Synonyms</p>
                <div class = 'word__definition__synonym__example ${type.partOfSpeech}__definition__synonym__example'></div>

          </div>
    </section>
    `;

  main.insertAdjacentHTML('beforeend', html);

  //   Build definitions for verb
  buildDefinitions(
    type,
    document.querySelector(`.${type.partOfSpeech}__definition__list`)
  );
};

// Build Word definitions
const buildDefinitions = function (type, path) {
  let synPath;

  if (type.partOfSpeech === 'noun') {
    type.definitions.forEach((def) => {
      const html = `<li>${def.definition}</li>`;
      path.insertAdjacentHTML('beforeend', html);
    });
  }

  if (
    type.partOfSpeech === 'verb' ||
    type.partOfSpeech === 'interjection' ||
    type.partOfSpeech === 'adjective' ||
    type.partOfSpeech === 'adverb' ||
    type.partOfSpeech === 'conjunction'
  ) {
    type.definitions.forEach((def) => {
      const html = `
        <li>
            ${def.definition}
            <p class = 'word__example'>${def.example ? def.example : ''}</p>
        </li>`;
      path.insertAdjacentHTML('beforeend', html);
    });
  }

  type.partOfSpeech === 'noun'
    ? (synPath = '.noun__definition__synonym__example')
    : type.partOfSpeech === 'verb'
    ? (synPath = '.verb__definition__synonym__example')
    : type.partOfSpeech === 'interjection'
    ? (synPath = '.interjection__definition__synonym__example')
    : type.partOfSpeech === 'adjective'
    ? (synPath = '.adjective__definition__synonym__example')
    : type.partOfSpeech === 'adverb'
    ? (synPath = '.adverb__definition__synonym__example')
    : type.partOfSpeech === 'conjunction'
    ? (synPath = '.conjunction__definition__synonym__example')
    : '';

  //   Build synonyms
  buildSynonyms(type, document.querySelector(synPath));
};

// Build word Synonyms
const buildSynonyms = function (type, path) {
  if (type.synonyms.length === 0)
    document.querySelector(
      `.${type.partOfSpeech}__definition__synonym`
    ).style.display = 'none';

  type.synonyms.forEach((syn, index) => {
    const html = `<p class='word__definition__synonym__example--${index}'>${syn}</p>`;
    path.insertAdjacentHTML('beforeend', html);
  });
};

const sourceDefinition = function (word) {
  const html = `
        <section class = 'source'>
            <h5 class = 'source__heading'>Source:</h5>
            <a class = 'source__url' 
            href = 'https://en.wiktionary.org/wiki/${word}' target ='_blank'
            >

            https://en.wiktionary.org/wiki/${word}

            <img class = 'source__img' src ='./assets/img/icon-new-window.svg' alt = 'Image of an arrow' 
            >

            </a>
        </section>
    `;
  main.insertAdjacentHTML('afterend', html);
};

const clearScreen = function () {
  if (main.innerHTML !== '') main.innerHTML = '';
  if (document.querySelector('.source'))
    document.querySelector('.source').remove();
};

const renderError = function (msg, opacity) {
  errorMessage.textContent = msg;
  errorMessage.style.opacity = opacity;
};
