import {container} from './domElements.js'
import {title} from "./domElements.js";

export class StartView {

  constructor() {
    this.userId = localStorage.getItem('userId');
    this.username = localStorage.getItem('username');
  }

  async createListContainer(allUsers=false) {
    let headerContent = this.username;
    if(allUsers) {
       headerContent = 'allen Lernenden';
    } else {
    }
    let wordId = 0;
    let wordLang = '';
    const userContent = await this.getUsercontent(allUsers);
    const table = document.createElement('div');
    table.className = 'table';
    const tableHeader = `<span class="table__header">Von ${headerContent}</span>`;
    const latestEntries = document.createElement('div');
    latestEntries.className = 'latest-entries';
    latestEntries.id = 'user-table';
    userContent.forEach((content, idx) => {
      let addedAt = content.added_at;
      addedAt = addedAt.split('-').reverse().join('.');
      const word = content.word;
      if(content.english_id !== 0) {
        wordId = content.english_id;
        wordLang = 'en';
      } else {
        wordId = content.german_id;
        wordLang = 'de';
      }
      latestEntries.insertAdjacentHTML('beforeend',
        `<div class="row">
           <span class="word" data-id="${wordId}" data-lang="${wordLang}">${idx+1}. ${word}</span>
           <div><span class="date">(${wordLang}) ${addedAt}</span>
           <button class="edit">&#10000;</button>
           <button class="delete">&#10006;</button></div>
         </div>`)
    });
    table.insertAdjacentHTML('beforeend',tableHeader);
    table.insertAdjacentElement('beforeend',latestEntries);
    container.insertAdjacentElement('beforeend', table);

  }

  getUsercontent = async (allUsers) => {
    let fetchId = this.userId;
    if (allUsers) {
      fetchId = 0;
    }
    try {
      const url = '//localhost:63342/vokabelheftSPA/actionSwitch.php';
      const formData = new FormData();
      formData.append('action', 'getUserContent');
      formData.append('userId', fetchId);
      const response = await fetch(url, {
        body: formData,
        method: 'POST'
      });
      // const userContent = await response.json();
      // console.log(userContent);
      // return userContent;
      return await response.json();
    } catch (error) {
      console.log(error);
    }
  }
}