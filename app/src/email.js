const emailInput = document.getElementById("email");
const passwordIcon = document.querySelector(".fa-lock");
let passwordInput = document.getElementById("password");

const validDomains = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'aol.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com',
  'live.com', 'msn.com', 'yahoo.co.uk', 'gmail.co.uk', 'me.com'
];

passwordIcon.onclick = function() {
  if (passwordInput.type == "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return { valid: false, message: "Please enter a valid email address."};
  }
}

const domain = email.split("@")[1]?.LowerCase();

// check if the domain has at least 2 characters before TLD.
const domainParts = domain.split(".");
if (domainParts[0].length < 2) {
  return { valid: false, message: "This domain name is too short" };
}