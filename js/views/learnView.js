import {urlActionSwitch} from "../config.js";
import {loadLearnPage} from "../functions/loadLearnPage.js";
import {loadStartPage} from "../functions/loadStartPage.js";

const container = document.querySelector('.container');

export class LearnView {
  constructor(mode) {
    this.mode = mode;
    this.userId = localStorage.getItem('userId');
    this.username = localStorage.getItem('username');
    this.registeredAt = localStorage.getItem('registeredAt');
    this.date = localStorage.getItem('date');
  }

  //info table-Elemente für Statistik Inhalte erstellen
  buildTableElement = (headerContent, tableId) => {
    const table = document.createElement('div');
    table.className = 'stats-table';
    table.id = tableId;
    const tableHeader = `<span class="stats-table__header">${headerContent}</span>`;
    table.insertAdjacentHTML('beforeend', tableHeader);
    return table
  }


  async createStatisticsContainer() {
    let content;
    content = document.createElement('div');
    content.className = 'stats-content';

    //info heutiges Datum formatieren
    const todayAt = this.date.split(' ');
    const today = todayAt[0].split('-').reverse().join('.');
    const time = todayAt[1];

    //info Eintrittsdatum formatieren
    const firstDayAt = this.registeredAt.split(' ');
    const firstDay = firstDayAt[0].split('-').reverse().join('.');
    const firstTime = firstDayAt[1];

    //info Tabellenüberschriften hinzufügen
    const headerContent1 = (localStorage.getItem('lang') === 'en') ? `of ${today} at ${time}` : `Von ${today} um ${time}`;
    const table1 = this.buildTableElement(headerContent1, 'stats-today');

    const headerContent2 = (localStorage.getItem('lang') === 'en') ? `since ${firstDay}, ${firstTime} until today` : `seit ${firstDay}, ${firstTime} bis heute`;
    const table2 = this.buildTableElement(headerContent2, 'stats-total');


    //info Statistik aufbauen für Session heute
    let latestStats = await this.getLatestStats(this.date);
    table1.insertAdjacentElement('beforeend', latestStats);
    content.insertAdjacentElement('beforeend', table1);

    //info Statistik aufbauen alle Sessions
    latestStats = await this.getLatestStats('0');

    table2.insertAdjacentElement('beforeend', latestStats);
    content.insertAdjacentElement('beforeend', table2);

    content.insertAdjacentElement('beforeend', table1)
    content.insertAdjacentElement('beforeend', table2)
    container.insertAdjacentElement('beforeend', content);
  }

  //info Statistikausgabe nach Datum liefern
  getLatestStats = async (date) => {
    const latestStats = document.createElement('div');
    latestStats.className = 'latest-stats';

    let statistics = await this.getStatistics(date);
    const rightTxt = (localStorage.getItem('lang') === 'en') ? 'Right' : 'Richtig';
    const wrongTxt = (localStorage.getItem('lang') === 'en') ? `Wrong ` : 'Falsch ';
    const stats = `<div class="is-right"><span>${rightTxt}</span><span> ${statistics[0]}</span></div>
                   <div class="is-wrong"><span>${wrongTxt}</span><span> ${statistics[1] - statistics[0]}</span></div>
                   <div class="total-stat"><span>Total</span><span> ${statistics[1]}</span></div>`

    latestStats.insertAdjacentHTML('beforeend', stats);
    return latestStats;
  }

  //info verschiedene DB Abfrage je nach Datum
  getStatistics = async (date) => {
    try {
      const formData = new FormData();
      formData.append('action', 'getStatistics');
      formData.append('userId', this.userId);
      formData.append('date', date);
      const response = await fetch(urlActionSwitch, {
        body: formData,
        method: 'POST'
      })
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }

  practice = async () => {
    const questContainer = document.createElement('div');
    questContainer.className = 'question';
    const wordData = await this.getRandomWord();
    console.log(wordData);
    const word = wordData.word;
    let answerWarning = ''
    const questionTxt = (localStorage.getItem('lang') === 'en') ? 'What is the translation for the word' : 'Wie lautet die Übersetzung für';
    const checkAnswer = (localStorage.getItem('lang') === 'en') ? 'verify answer' : 'Antwort prüfen';

    const question = `<div class="question">${questionTxt} '${word}'?</div>
                     <div class="answer"><input type="text" id="answer" autofocus autocomplete="off"></div>`;

    const submit = `<button class="btn-answer btn-green-big">${checkAnswer}</button>
                   <div class="answer-warning">
                     <span class="warning" id="answer-warning">${answerWarning}</span>
                   </div>`;
    questContainer.insertAdjacentHTML('beforeend', question);
    container.insertAdjacentElement('beforeend', questContainer);
    container.insertAdjacentHTML('beforeend', submit);
    const answerButton = document.querySelector('.btn-answer');
    answerButton.addEventListener('click', () => {
      const answer = document.getElementById('answer').value;
      if (answer.length > 0) {
        document.getElementById('answer-warning').innerText = '';
        this.verifyAnswer(wordData, answer);
      } else {
        answerWarning = (localStorage.getItem('lang') === 'en') ?
          'your answer must not be empty' :
          'deine Antwort darf nicht leer sein!';
        document.getElementById('answer-warning').innerText = answerWarning;
      }
    });
  }

  getRandomWord = async () => {
    try {
      const mode = this.mode ? 'true' : 'false';
      const formData = new FormData();
      formData.append('action', 'getRandomWord');
      formData.append('userId', localStorage.getItem('userId'));
      formData.append('lang', localStorage.getItem('lang'))
      formData.append('mode', mode);
      const response = await fetch(urlActionSwitch, {
        body: formData,
        method: 'POST'
      })
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }

  verifyAnswer = async (wordData, answer) => {
    console.log(wordData, 'from verifyAnswer');
    if (wordData.translations.includes(answer)) {
      const result = await this.updateStatistics(wordData, true);
      console.log(result);
      this.showSuccess(wordData, answer, true);
    } else {
      const result = await this.updateStatistics(wordData, false);
      console.log(result);
      this.showSuccess(wordData, answer, false);
    }
  }

  updateStatistics = async (wordData, isCorrect) => {
    const isRight = isCorrect ? 'true' : 'false';
    try {
      const formData = new FormData();
      formData.append('action', 'updateStatistics');
      formData.append('userId', localStorage.getItem('userId'));
      formData.append('lang', localStorage.getItem('lang'));
      formData.append('isRight', isRight);
      formData.append('wordId', wordData.id);
      formData.append('date', localStorage.getItem('date'));
      const response = await fetch(urlActionSwitch, {
        body: formData,
        method: 'POST'
      })
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }

  showSuccess = (wordData, answer, isCorrect) => {
    const lang = localStorage.getItem('lang');
    let heading = '';
    let comment = '';
    let hint = '';
    if (isCorrect) {
      heading = (lang === 'en') ? 'Congratulations!' : 'Glückwunsch!';
      comment = (lang === 'en') ?
        `${answer} is correct!` : `${answer} ist korrekt!`
    } else {
      heading = (lang === 'en') ? 'WTF!' : 'Hmpf!';
      comment = (lang === 'en') ?
        `${answer} is wrong!` : `${answer} ist falsch!`
    }

    if (wordData.translations.length > 1) {
      hint = (lang === 'en') ?
        `There are further translations for the word ${wordData.word}` :
        `Es gibt noch mehr Übersetzungen für das Wort ${wordData.word}`;
    } else {
      hint = (lang === 'en') ?
        `No further translations for ${wordData.word}!` :
        `Keine weiteren Übersetzungen für ${wordData.word}`;
    }
    const nextBtnTxt = (lang === 'en') ? 'go on' : 'weiter';
    const backBtnTxt = (lang === 'en') ? 'stop it' : 'aufhören';
    const modal = document.querySelector('.modal-container');
    modal.style.display = 'block';
    const innerModal = document.querySelector('.inner-modal');
    let modalContent = `<h1 class="success-heading">${heading}</h1>
                        <h2 class="success-comment">${comment}</h2>
                        <div class="success-hint">${hint}</div>`;
    if (wordData.translations.length > 1) {
      modalContent += `<ul class="modal-list">`;
      for (let i = 1; i < wordData.translations.length; i++) {
        modalContent += `<li class="list-item">${wordData.translations[i]}</li>`;
      }
      modalContent += `</ul>`;
    }
    modalContent += `<div class="modal-buttons">
                       <button id="next-btn">${nextBtnTxt}</button>
                       <button id="back-btn">${backBtnTxt}</button>`;
    innerModal.insertAdjacentHTML('beforeend', modalContent);
    modal.insertAdjacentElement('beforeend', innerModal);
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    nextBtn.addEventListener('click', () => {
      this.clearModal();
      loadLearnPage(this.mode);
    })
    backBtn.addEventListener('click', () => {
      this.clearModal();
      loadStartPage();
    })
  }

  clearModal = () => {
    const modal = document.querySelector('.modal-container');
    const innerModal = document.querySelector('.inner-modal');
    innerModal.innerHTML = '';
    //info className zurücksetzten, damit querySelect funktioniert
    // (wurde in inner-show-modal geändert, um Darstellung anzupassen)
    innerModal.className = 'inner-modal';
    modal.style.display = 'none';
  }
}