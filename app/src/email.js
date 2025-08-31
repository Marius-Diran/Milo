const emailInput = document.getElementById("email");

const validDomains = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'aol.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com',
  'live.com', 'msn.com', 'yahoo.co.uk', 'gmail.co.uk', 'me.com'
];

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return { valid: false, message: "Please enter a valid email address."};
  }
}