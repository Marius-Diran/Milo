document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.querySelector(".input-field")
  const sendButton = document.querySelector(".btns-div button")
  const chatsContainer = document.querySelector(".chats")
  const originalHeight = textarea.scrollHeight

  // Store conversation history
  let conversationMessages = []

  // Mobile detection and keyboard handling
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  let initialViewportHeight = window.innerHeight

  // Auto-scroll control variables
  let shouldAutoScroll = true
  let isUserScrolling = false
  let scrollTimeout = null

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

  // Add styles for Markdown and mobile keyboard handling
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
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    /* Mobile keyboard handling styles */
    @media screen and (max-width: 768px) {
      .chats {
        height: calc(100dvh - 120px) !important;
        max-height: calc(100dvh - 120px) !important;
      }
      
      .input-area {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 1000 !important;
        background: var(--bg-color, #1a1a1a) !important;
        border-top: 1px solid #333 !important;
        padding: 10px !important;
      }
      
      body {
        padding-bottom: 100px !important;
      }
      
      .main-container {
        padding-bottom: 100px !important;
      }
    }
    
    @supports (-webkit-touch-callout: none) {
      @media screen and (max-width: 768px) {
        .chats {
          height: calc(100vh - env(keyboard-inset-height, 120px)) !important;
          max-height: calc(100vh - env(keyboard-inset-height, 120px)) !important;
        }
      }
    }
  `
  document.head.appendChild(markdownStyles)

  // Function to handle viewport changes (keyboard appearance)
  function handleViewportChange() {
    if (isMobile) {
      const currentHeight = window.innerHeight
      const keyboardHeight = initialViewportHeight - currentHeight
      
      if (keyboardHeight > 100) {
        chatsContainer.style.height = `calc(100vh - 120px - ${keyboardHeight}px)`
        chatsContainer.style.maxHeight = `calc(100vh - 120px - ${keyboardHeight}px)`
        setTimeout(() => smartScroll(), 100)
      } else {
        chatsContainer.style.height = 'calc(100dvh - 120px)'
        chatsContainer.style.maxHeight = 'calc(100dvh - 120px)'
      }
    }
  }

  // Function to check if user is at bottom of chat
  function isAtBottom() {
    const threshold = 100
    return chatsContainer.scrollTop + chatsContainer.clientHeight >= chatsContainer.scrollHeight - threshold
  }

  // Smart scroll function
  function smartScroll() {
    if (shouldAutoScroll && !isUserScrolling) {
      chatsContainer.scrollTop = chatsContainer.scrollHeight
    }
  }

  // Scroll event listener to detect user scrolling
  chatsContainer.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout)
    isUserScrolling = true
    
    if (isAtBottom()) {
      shouldAutoScroll = true
    } else {
      shouldAutoScroll = false
    }
    
    scrollTimeout = setTimeout(() => {
      isUserScrolling = false
    }, 150)
  })

  // Mobile keyboard event listeners
  if (isMobile) {
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        initialViewportHeight = window.innerHeight
        handleViewportChange()
      }, 500)
    })
    
    textarea.addEventListener('focus', () => {
      setTimeout(handleViewportChange, 300)
    })
    
    textarea.addEventListener('blur', () => {
      setTimeout(handleViewportChange, 300)
    })
  }

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
        "inline-block max-w-[80%] py-2 px-4 rounded-4xl break-words text-content max-sm:max-w-[100%] max-sm:-ml-4 markdown-content"

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
          try {
            return hljs.highlightAuto(code).value
          } catch (err) {
            console.error("Auto highlight error:", err)
          }
          return code
        },
      })

      const rawHTML = marked.parse(message)
      let index = 0
      const tempDiv = document.createElement("div")
      messageContainer.appendChild(tempDiv)

      function typeWriter() {
        if (index < rawHTML.length) {
          tempDiv.innerHTML = rawHTML.slice(0, index + 1)
          smartScroll()

          tempDiv.querySelectorAll("pre code").forEach((block) => {
            if (!block.className.includes("hljs")) {
              try {
                hljs.highlightElement(block)
              } catch (e) {}
            }
          })

          index++
          setTimeout(typeWriter, 10)
        } else {
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
      smartScroll()
    })
  }

  // Function to show loading indicator
  function showLoadingIndicator() {
    const loadingDiv = document.createElement("div")
    loadingDiv.className = "ai-response my-4 w-full flex justify-start loading-indicator"
    loadingDiv.innerHTML =
      '<p class="inline-block max-w-[50%] py-2 px-4 rounded-4xl bg-[#303030] break-words text-content">...</p>'
    chatsContainer.appendChild(loadingDiv)
    smartScroll()
    return loadingDiv
  }

  // Function to remove loading indicator
  function removeLoadingIndicator(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
  }

  // Function to send message to API with conversation history
  async function sendMessageToAPI(message) {
    try {
      const userMessage = {
        role: "user",
        content: message
      }
      
      const requestPayload = {
        messages: [...conversationMessages, userMessage],
        systemPrompt: `You are Milo, a helpful AI assistant. Instructions:
        - Respond naturally and conversationally
        - Be friendly and concise
        - Use Markdown for code, lists, or technical info
        - Always use syntax highlighting for code blocks (specify language like \`\`\`javascript)
        - Remember previous parts of our conversation and refer to them when relevant
        - Keep the conversation flowing naturally`
      }

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.messages) {
        conversationMessages = data.messages
      }
      
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
      shouldAutoScroll = true
      
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

      smartScroll()

      const loadingIndicator = showLoadingIndicator()

      try {
        const response = await sendMessageToAPI(message)
        removeLoadingIndicator(loadingIndicator)

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

  // Event listeners
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !isMobile) {
      event.preventDefault()
      sendMessage()
    }
  })

  sendButton.addEventListener("click", sendMessage)

  textarea.addEventListener("input", function () {
    this.style.height = "auto"
    if (this.value.trim() === "") {
      this.style.height = "auto"
    } else {
      this.style.height = this.scrollHeight + "px"
    }
  })
})