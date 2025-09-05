        const chatForm = document.getElementById('chatForm');
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chat-messages');

        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (msg) {
                const div = document.createElement('div');
                div.textContent = msg;
                chatMessages.appendChild(div);
                chatInput.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });



// Code to add buttons for friends dynamically //
document.addEventListener("DOMContentLoaded", function() {
    const friendsPanel = document.querySelector('.friends-panel');

    // Create the "+" button
    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.className = 'add-friend-btn';
    addBtn.style.margin = '10px 0';
    addBtn.style.fontSize = '20px';
    addBtn.style.padding = '4px 12px';
    addBtn.style.cursor = 'pointer';

    // Insert "+" button after the "Friends" heading
    const heading = friendsPanel.querySelector('h2');
    heading.after(addBtn);

    // Add click event to dynamically add a new friend button
    addBtn.addEventListener('click', function() {
        const friendDiv = document.createElement('div');
        friendDiv.className = 'friend';
        const friendBtn = document.createElement('button');
        friendBtn.textContent = 'New Friend';
        friendBtn.className = 'namers';
        friendBtn.onclick = morph;       friendDiv.appendChild(friendBtn);
        addBtn.after(friendDiv);
    });
});

function morph(){
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#fff';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    popup.style.zIndex = '1000';
    popup.style.width = '350px';
    popup.style.height = '50px';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter friend code';
    input.style.marginRight = '10px';
    input.style.background = '#4D95FF';
    input.className = 'friend_code';

    const btn = document.createElement('button');
    btn.textContent = 'Add';
    btn.className = 'add_friend_btn';
    btn.onclick = function() {
        // You can handle the input value here if needed
        document.body.removeChild(popup);
    };

    popup.appendChild(input);
    popup.appendChild(btn);
    document.body.appendChild(popup);
}


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
const db = firebase.database();


const chatBox = document.getElementById("chatMessages");
const msgInput = document.getElementById("chatInput");

// Your chat box div


// Function to display a message in the chatBox
function displayMessage(sender, text) {


    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");

    // ✅ Properly show sender and message text
    msgDiv.textContent = `${sender}: ${text}`;

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // auto-scroll
}

function sendMessage() {
    const msg = msgInput.value;
    if (msg.trim() !== "") {
        const messageData = {
            text: msg,      // ✅ store the message text
            sender: "Me",   // later replace with logged-in user
            timestamp: Date.now()
        };

        // Save to Firebase
        db.ref("messages").push(messageData)
            .then(() => console.log("✅ Message stored in DB"))
            .catch((error) => console.error("❌ Error writing message:", error));

        msgInput.value = ""; // clear input
        chatBox.append(msg);
    }
}

// ✅ Always use data from Firebase
db.ref("messages").on("child_added", (snapshot) => {
    const data = snapshot.val();
    displayMessage(data.sender, data.text); // pass both sender & text
});
