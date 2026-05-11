import { auth } from './firebase-config.js';

import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const sendOtpBtn = document.getElementById('sendOtpBtn');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');

const phoneInput = document.getElementById('phone');
const otpInput = document.getElementById('otp');

const otpSection = document.getElementById('otpSection');

window.recaptchaVerifier = new RecaptchaVerifier(
  auth,
  'recaptcha-container',
  {
    size: 'normal'
  }
);

let confirmationResultGlobal;

sendOtpBtn.addEventListener('click', async () => {

  const phoneNumber = phoneInput.value;

  if(phoneNumber.length < 10){
    alert('Enter valid number');
    return;
  }

  try{

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    confirmationResultGlobal = confirmationResult;

    otpSection.style.display = 'block';

    alert('OTP Sent Successfully');

  }catch(error){

    alert(error.message);

  }

});

verifyOtpBtn.addEventListener('click', async () => {

  const code = otpInput.value;

  try{

    await confirmationResultGlobal.confirm(code);

    document.getElementById('loginPage').classList.remove('active');

    document.getElementById('gamePage').classList.add('active');

    localStorage.setItem('isLoggedIn', 'true');

    alert('Login Successful');

  }catch(error){

    alert('Invalid OTP');

  }

});

if(localStorage.getItem('isLoggedIn') === 'true'){

  document.getElementById('loginPage').classList.remove('active');

  document.getElementById('gamePage').classList.add('active');

}
