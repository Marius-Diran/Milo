document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.querySelector(".input-field")
  const sendButton = document.querySelector(".btns-div button")
  const chatsContainer = document.querySelector(".chats")
  const originalHeight = textarea.scrollHeight

  // Make sure marked is loaded
  const markedScript = document.createElement("script")
  markedScript.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js"
  document.head.appendChild(markedScript)

  // Load highlight.js for syntax highlighting
  const highlightCss = document.createElement("link")
  highlightCss.rel = "stylesheet"
  highlightCss.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css"
  document.head.appendChild(highlightCss)

  const highlightJs = document.createElement("script")
  highlightJs.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"
  document.head.appendChild(highlightJs)

  // Add some basic styles for Markdown
  const markdownStyles = document.createElement("style")
  markdownStyles.textContent = `
    .markdown-content h1, .markdown-content h2, .markdown-content h3 { 
      font-weight: bold; 
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
    .markdown-content h1 { font-size: 1.5em; }
    .markdown-content h2 { font-size: 1.3em; }
    .markdown-content h3 { font-size: 1.1em; }
    .markdown-content p { margin-bottom: 0.5em; }
    .markdown-content ul, .markdown-content ol { 
      padding-left: 1.5em; 
      margin-bottom: 0.5em;
    }
    .markdown-content ul { list-style-type: disc; }
    .markdown-content ol { list-style-type: decimal; }
    .markdown-content pre {
      background-color: #1e1e1e;
      padding: 0.5em;
      border-radius: 0.25em;
      overflow-x: auto;
      margin: 0.5em 0;
    }
    .markdown-content code {
      font-family: monospace;
    }
    .markdown-content p code {
      background-color: #1e1e1e;
      padding: 0.1em 0.3em;
      border-radius: 0.25em;
    }
    .markdown-content blockquote {
      border-left: 3px solid #555;
      padding-left: 0.5em;
      margin-left: 0.5em;
      font-style: italic;
    }
    .markdown-content a {
      color: #3b82f6;
      text-decoration: underline;
    }
    .markdown-content table {
      border-collapse: collapse;
      margin: 0.5em 0;
    }
    .markdown-content th, .markdown-content td {
      border: 1px solid #555;
      padding: 0.3em 0.5em;
    }
    /* Add a fade-in animation */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
  `
  document.head.appendChild(markdownStyles)

  // Wait for marked and highlight.js to load
  function waitForDependencies(callback) {
    if (window.marked && window.hljs) {
      callback()
    } else {
      setTimeout(() => waitForDependencies(callback), 50)
    }
  }

  // Function to add AI response to chat with Markdown support
  function addAIResponse(message) {
    waitForDependencies(() => {
      const messageDiv = document.createElement("div")
      messageDiv.className = "ai-response my-4 w-full flex justify-start"

      const messageContainer = document.createElement("div")
      messageContainer.className =
        "inline-block max-w-[80%] py-2 px-4 rounded-4xl break-words text-content max-sm:max-w-[100%] markdown-content"

      // Configure marked for syntax highlighting
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false,
        highlight: (code, lang) => {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value
            } catch (err) {
              console.error("Highlight error:", err)
            }
          }
          // Use auto-detection if language isn't specified
          try {
            return hljs.highlightAuto(code).value
          } catch (err) {
            console.error("Auto highlight error:", err)
          }
          return code // Return original code if highlighting fails
        },
      })

      // Parse the markdown to HTML but don't add it to the DOM yet
      const rawHTML = marked.parse(message)
      let index = 0
      const tempDiv = document.createElement("div")
      messageContainer.appendChild(tempDiv)

      function typeWriter() {
        if (index < rawHTML.length) {
          tempDiv.innerHTML = rawHTML.slice(0, index + 1)

          // Apply syntax highlighting to any complete code blocks as they appear
          tempDiv.querySelectorAll("pre code").forEach((block) => {
            if (!block.className.includes("hljs")) {
              try {
                hljs.highlightElement(block)
              } catch (e) {
              }
            }
          })

          index++
          setTimeout(typeWriter, 10)
        } else {
          // Final pass to ensure all code blocks are highlighted
          tempDiv.querySelectorAll("pre code").forEach((block) => {
            if (!block.className.includes("hljs")) {
              hljs.highlightElement(block)
            }
          })
        }
      }
      typeWriter()

      messageDiv.appendChild(messageContainer)
      chatsContainer.appendChild(messageDiv)

      // Scroll to bottom
      chatsContainer.scrollTop = chatsContainer.scrollHeight
    })
  }

  // Function to show loading indicator
  function showLoadingIndicator() {
    const loadingDiv = document.createElement("div")
    loadingDiv.className = "ai-response my-4 w-full flex justify-start loading-indicator"
    loadingDiv.innerHTML =
      '<p class="inline-block max-w-[50%] py-2 px-4 rounded-4xl bg-[#303030] break-words text-content">...</p>'
    chatsContainer.appendChild(loadingDiv)
    chatsContainer.scrollTop = chatsContainer.scrollHeight
    return loadingDiv
  }

  // Function to remove loading indicator
  function removeLoadingIndicator(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
  }

  // Function to send message to API
  async function sendMessageToAPI(message) {
    try {
      // Add a hint to the API to respond with Markdown
      const enhancedMessage = `User: ${message}

          Instructions:
          - Respond naturally like ChatGPT would.
          - Be friendly and concise.
          - Use Markdown *only* if the reply includes code, lists, or technical info.
          - Do NOT repeat or rephrase the user's question.
          - Respond like a helpful assistant.
          - If the user asks for code, provide it in a code block.
          - ALWAYS use syntax highlighting for code blocks by specifying the language.
          - Use \`\`\`javascript, \`\`\`python, \`\`\`html, etc. at the start of every code block.
          - Never use plain code blocks without language specification.
          - Ensure all code examples have proper color coding through language-specific syntax highlighting.`

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: enhancedMessage }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error sending message to API:", error)
      return { error: "Failed to get response from the API" }
    }
  }

  // Function to send a message
  async function sendMessage() {
    const message = textarea.value.trim()

    if (message) {
      // Create user message element
      const messageDiv = document.createElement("div")
      messageDiv.className = "user-input my-4 w-full flex justify-end"

      const messageParagraph = document.createElement("p")
      messageParagraph.className =
        "inline-block max-w-[50%] py-2 px-4 rounded-4xl bg-[#303030] break-words text-content max-sm:max-w-[70%]"
      messageParagraph.textContent = message

      messageDiv.appendChild(messageParagraph)
      chatsContainer.appendChild(messageDiv)

      textarea.value = ""
      textarea.style.height = "auto"

      chatsContainer.scrollTop = chatsContainer.scrollHeight

      const loadingIndicator = showLoadingIndicator()

      try {
        const response = await sendMessageToAPI(message)

        removeLoadingIndicator(loadingIndicator)

        // Add API response to UI
        if (response.error) {
          addAIResponse("Sorry, I couldn't process your message. Please try again.")
        } else {
          addAIResponse(response.reply || "No response content")
        }
      } catch (error) {
        removeLoadingIndicator(loadingIndicator)

        addAIResponse("Sorry, there was an error connecting to the AI service.")
        console.error("Error:", error)
      }
    }
  }

  // Event listener for Enter key
  textarea.addEventListener("keydown", (event) => {
    // Check if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (event.key === "Enter" && !event.shiftKey && !isMobile) {
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
