document.addEventListener("DOMContentLoaded", () => {


  const textarea = document.querySelector(".input-field")
  const sendButton = document.querySelector(".btns-div button")
  const chatsContainer = document.querySelector(".chats")
  const originalHeight = textarea.scrollHeight

  // Function to send a message
  function sendMessage() {
    const message = textarea.value.trim()


    if (message) {
      // Create message element
      const messageDiv = document.createElement("div")
      messageDiv.className = "user-input my-4 w-full flex justify-end"

      const messageParagraph = document.createElement("p")
      messageParagraph.className = "inline-block max-w-[50%] py-2 px-4 rounded-4xl bg-[#303030] break-words bg-red-500 text-content"
      messageParagraph.textContent = message
      messageDiv.appendChild(messageParagraph)
      chatsContainer.appendChild(messageDiv)
      textarea.value = ""
      textarea.style.height = "auto"
      chatsContainer.scrollTop = chatsContainer.scrollHeight
    }
  }

  // Event listener for Enter key
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  })

  sendButton.addEventListener("click", sendMessage)


  // Auto-resize textarea as user types
  textarea.addEventListener("input", function () {
    this.style.height = "auto"


    if (this.value.trim() === "") {
      this.style.height = "auto"
    } else {
      this.style.height = this.scrollHeight + "px"
    }
  })
})