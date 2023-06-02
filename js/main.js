import {container} from './domElements.js'
import {title} from "./domElements.js";
import {headerElements} from "./headerElements.js";
import Login from './loginView.js';
import {StartPage} from "./startView.js";

function clearStorage() {
  let session = sessionStorage.getItem('register');
  if (session == null) {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  }
  sessionStorage.setItem('register', 1);
}

window.addEventListener('load', clearStorage);

headerElements();
if(!localStorage.getItem('username')){
  localStorage.setItem('username','');
  }
// window.onbeforeunload = function() {
//   localStorage.removeItem('username');
//   localStorage.removeItem('userId');
//   return '';
// }

let username = localStorage.getItem('username');
const loadStartPage = (user) => {
  container.innerHTML='';
  headerElements();
  const starter = new StartPage();
  starter.createUserListContainer(user);
  // container.innerHTML = `<h1>Hallo ${benutzer}</h1>`;

}
if(!username) {
  const login = new Login();
  login.createUserInputs();
  const submit = document.getElementById('formSubmit');
  const nameInput = document.getElementById('name');
  const passInput = document.getElementById('password');
  submit.addEventListener('click', async(e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', nameInput.value);
      formData.append('password', passInput.value);
      formData.append('action', 'userLogin');
      const response = await fetch('http://localhost:63342/vokabelheftSPA/actionSwitch.php',
        {
          body: formData,
          method: 'POST'
        });
      const user = await response.json();
      console.log(user);
      console.log(typeof user);
      loadStartPage(user.name);
      localStorage.setItem('username', user.name);
      localStorage.setItem('userId', user.id);

      console.log(user.name);
    } catch (error) {
      console.log(error);
    }
  })
} else {
  loadStartPage(localStorage.getItem('username'));
}
