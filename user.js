const firebaseConfig = {
  apiKey: "AIzaSyCgSXJqabQPhllgRQBimXqT83T8uvVN-TI",
  authDomain: "silent-voice-ai.firebaseapp.com",
  projectId: "silent-voice-ai",
  storageBucket: "silent-voice-ai.firebasestorage.app",
  messagingSenderId: "947642556921",
  appId: "1:947642556921:web:c7b6c3e7d6c85f53479d28",
  measurementId: "G-N5HYD2LCBH",
  databaseURL: "https://silent-voice-ai-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

function collectAnswers() {
  const disability = Array.from(document.querySelectorAll('input[name="q1[]"]:checked'))
    .map(cb => cb.value);

  const com_receive = document.querySelector('input[name="q2"]:checked')?.value || null;
  const com_send = document.querySelector('input[name="q3"]:checked')?.value || null;
  const colour_blind = document.querySelector('input[name="q4"]:checked')?.value || null;
  const mental_disability = document.querySelector('input[name="q5"]:checked')?.value || null;

  const phoneInputs = document.querySelectorAll(".phoneInput");
  const phoneNumbers = Array.from(phoneInputs)
    .map(input => input.value.trim())
    .filter(num => num.length > 0);

  return { disability, com_receive, com_send, colour_blind, mental_disability, phoneNumbers };
}

// Email Signup
function signup(event) {
  event.preventDefault();

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const { disability, com_receive, com_send, colour_blind, mental_disability, phoneNumbers } = collectAnswers();

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;

      return db.ref("users/" + user.uid).set({
        email: user.email,
        disability,
        com_receive,
        com_send,
        colour_blind,
        mental_disability,
        emergency_contacts: phoneNumbers,
        createdAt: Date.now()
      });
    })
    .then(() => {
      alert("✅ User signed up and data saved!");
    })
    .catch(error => {
      alert("❌ Signup error: " + error.message);
    });
    window.location.href = "comms.html";
}

// Email Login
function login() {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("✅ Logged in as " + userCredential.user.email);
    })
    .catch(error => {
      alert("❌ Login error: " + error.message);
    });
    window.location.href = "comms.html";
}

// Google Login (Sign Up or Sign In with questions)
function googleLogin(event) {
  event.preventDefault();
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      const { disability, com_receive, com_send, colour_blind, mental_disability, phoneNumbers } = collectAnswers();

      return db.ref("users/" + user.uid).once("value").then(snapshot => {
        if (!snapshot.exists()) {
          return db.ref("users/" + user.uid).set({
            email: user.email,
            displayName: user.displayName || "No name",
            photoURL: user.photoURL || null,
            provider: "google",
            disability,
            com_receive,
            com_send,
            colour_blind,
            mental_disability,
            emergency_contacts: phoneNumbers,
            createdAt: Date.now()
          });
        } else {
          // optional: update answers if already exist
          return db.ref("users/" + user.uid).update({
            disability,
            com_receive,
            com_send,
            colour_blind,
            mental_disability,
            emergency_contacts: phoneNumbers,
            updatedAt: Date.now()
          });
        }
      });
    })
    .then(() => {
      alert("✅ Google login successful!");
    })
    .catch(error => {
      alert("❌ Google login error: " + error.message);
    });
}

// Update Profile
function updateProfile(event) {
  event.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    alert("No user logged in!");
    return;
  }

  const { disability, com_receive, com_send, colour_blind, mental_disability, phoneNumbers } = collectAnswers();

  db.ref("users/" + user.uid).update({
    disability,
    com_receive,
    com_send,
    colour_blind,
    mental_disability,
    emergency_contacts: phoneNumbers,
    updatedAt: Date.now()
  })
  .then(() => {
    alert("✅ Profile updated!");
  })
  .catch(error => {
    alert("❌ Update error: " + error.message);
  });
}

// Load Profile Data
function loadProfile() {
  const user = auth.currentUser;
  if (!user) return;

  db.ref("users/" + user.uid).once("value").then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();

      // Populate checkboxes
      if (data.disability) {
        document.querySelectorAll('input[name="q1[]"]').forEach(cb => {
          cb.checked = data.disability.includes(cb.value);
        });
      }

      // Radios
      ["q2", "q3", "q4", "q5"].forEach(q => {
        if (data[q]) {
          const el = document.querySelector(`input[name="${q}"][value="${data[q]}"]`);
          if (el) el.checked = true;
        }
      });

      // Phones
      if (data.emergency_contacts) {
        const container = document.getElementById("emergency-contacts");
        container.innerHTML = "";
        data.emergency_contacts.forEach(num => {
          const input = document.createElement("input");
          input.type = "text";
          input.className = "phoneInput";
          input.value = num;
          input.placeholder = "Enter emergency contact";
          container.appendChild(input);
        });
      }
    }
  });
}

// Track Login State
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("👤 Logged in:", user.email);
    loadProfile();
  } else {
    console.log("🚪 Logged out");
  }
});
