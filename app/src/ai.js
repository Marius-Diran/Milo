document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.querySelector(".input-field");
  const sendButton = document.querySelector(".btns-div button");
  const chatsContainer = document.querySelector(".chats");
  const originalHeight = textarea.scrollHeight;

  // Function to add AI response to chat
  function addAIResponse(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "ai-response my-4 w-full flex justify-start";

    const messageParagraph = document.createElement("p");
    messageParagraph.className = "inline-block max-w-[50%] py-2 px-4 rounded-4xl bg-[#303030] break-words text-content max-sm:max-w-[70%]";
    messageParagraph.textContent = message;
    
    messageDiv.appendChild(messageParagraph);
    chatsContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatsContainer.scrollTop = chatsContainer.scrollHeight;
  }
  
  // Function to show loading indicator
  function showLoadingIndicator() {
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "ai-response my-4 w-full flex justify-start loading-indicator";
    loadingDiv.innerHTML = '<p class="inline-block max-w-[50%] py-2 px-4 rounded-4xl bg-[#303030] break-words text-content">...</p>';
    chatsContainer.appendChild(loadingDiv);
    chatsContainer.scrollTop = chatsContainer.scrollHeight;
    return loadingDiv;
  }
  
  // Function to remove loading indicator
  function removeLoadingIndicator(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  // Function to send message to API
  async function sendMessageToAPI(message) {
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message to API:", error);
      return { error: "Failed to get response from the API" };
    }
  }

  // Function to send a message
  async function sendMessage() {
    const message = textarea.value.trim();

    if (message) {
      // Create user message element
      const messageDiv = document.createElement("div");
      messageDiv.className = "user-input my-4 w-full flex justify-end";

      const messageParagraph = document.createElement("p");
      messageParagraph.className = "inline-block max-w-[50%] py-2 px-4 rounded-4xl bg-[#303030] break-words text-content max-sm:max-w-[70%]";
      messageParagraph.textContent = message;
      
      messageDiv.appendChild(messageParagraph);
      chatsContainer.appendChild(messageDiv);
      
      // Clear textarea and adjust height
      textarea.value = "";
      textarea.style.height = "auto";
      
      // Scroll to bottom
      chatsContainer.scrollTop = chatsContainer.scrollHeight;
      
      // Show loading indicator
      const loadingIndicator = showLoadingIndicator();
      
      // Send message to API
      try {
        const response = await sendMessageToAPI(message);
        
        // Remove loading indicator
        removeLoadingIndicator(loadingIndicator);
        
        // Add API response to UI
        if (response.error) {
          addAIResponse("Sorry, I couldn't process your message. Please try again.");
        } else {
          addAIResponse(response.reply || "No response content");
        }
      } catch (error) {
        // Remove loading indicator
        removeLoadingIndicator(loadingIndicator);
        
        // Show error message
        addAIResponse("Sorry, there was an error connecting to the AI service.");
        console.error("Error:", error);
      }
    }
  }

  // Event listener for Enter key
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  // Event listener for send button
  sendButton.addEventListener("click", sendMessage);

  // Auto-resize textarea as user types
  textarea.addEventListener("input", function() {
    this.style.height = "auto";

    if (this.value.trim() === "") {
      this.style.height = "auto";
    } else {
      this.style.height = this.scrollHeight + "px";
    }
  });
});
