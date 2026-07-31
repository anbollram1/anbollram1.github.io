// Selecting elements from HTML using their unique IDs
const actionButton = document.getElementById('action-btn');
const outputMessage = document.getElementById('output-message');

// Array of inspiring messages to display when button is clicked
const developerQuotes = [
    "🚀 You are building real software!",
    "💡 Every click is powered by your code.",
    "🌐 Ready to share your site with the world!"
];

// Listening for a click event on the button
actionButton.addEventListener('click', () => {
    // Pick a random index from the array
    const randomIndex = Math.floor(Math.random() * developerQuotes.length);
    
    // Update the text content of our paragraph
    outputMessage.textContent = developerQuotes[randomIndex];
    outputMessage.style.marginTop = "15px";
    outputMessage.style.fontWeight = "bold";
    outputMessage.style.color = "#27ae60";
});
