// Full Fixed Code with Mobile Keyboard and Scroll Fixes

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.querySelector(".input-field")
  const sendButton = document.querySelector(".btns-div button")
  const chatsContainer = document.querySelector(".chats")
  const originalHeight = textarea.scrollHeight

  let conversationMessages = []
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  let initialViewportHeight = window.innerHeight

  let shouldAutoScroll = true
  let isUserScrolling = false
  let scrollTimeout = null

  // Load markdown and highlight dependencies
  const markedScript = document.createElement("script")
  markedScript.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js"
  document.head.appendChild(markedScript)

  const highlightCss = document.createElement("link")
  highlightCss.rel = "stylesheet"
  highlightCss.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css"
  document.head.appendChild(highlightCss)

  const highlightJs = document.createElement("script")
  highlightJs.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"
  document.head.appendChild(highlightJs)

  const markdownStyles = document.createElement("style")
  markdownStyles.textContent = `
    .markdown-content h1, .markdown-content h2, .markdown-content h3 { font-weight: bold; margin-top: 0.5em; margin-bottom: 0.5em; }
    .markdown-content h1 { font-size: 1.5em; }
    .markdown-content h2 { font-size: 1.3em; }
    .markdown-content h3 { font-size: 1.1em; }
    .markdown-content p { margin-bottom: 0.5em; }
    .markdown-content ul, .markdown-content ol { padding-left: 1.5em; margin-bottom: 0.5em; }
    .markdown-content pre { background-color: #1e1e1e; padding: 0.5em; border-radius: 0.25em; overflow-x: auto; margin: 0.5em 0; }
    .markdown-content code { font-family: monospace; }
    .markdown-content p code { background-color: #1e1e1e; padding: 0.1em 0.3em; border-radius: 0.25em; }
    .markdown-content blockquote { border-left: 3px solid #555; padding-left: 0.5em; margin-left: 0.5em; font-style: italic; }
    .markdown-content a { color: #3b82f6; text-decoration: underline; }
    .markdown-content table { border-collapse: collapse; margin: 0.5em 0; }
    .markdown-content th, .markdown-content td { border: 1px solid #555; padding: 0.3em 0.5em; }
    .fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `
  document.head.appendChild(markdownStyles)

  function handleViewportChange() {
    if (isMobile) {
      const currentHeight = window.innerHeight
      const keyboardHeight = initialViewportHeight - currentHeight

      if (keyboardHeight > 100) {
        chatsContainer.style.height = `calc(100dvh - 120px - ${keyboardHeight}px)`
        chatsContainer.style.maxHeight = `calc(100dvh - 120px - ${keyboardHeight}px)`
        setTimeout(() => smartScroll(), 100)
      } else {
        chatsContainer.style.height = 'calc(100dvh - 120px)'
        chatsContainer.style.maxHeight = 'calc(100dvh - 120px)'
      }
    }
  }

  function adjustBodyPadding() {
    const inputArea = document.querySelector('.input-area')
    if (inputArea) {
      const inputHeight = inputArea.offsetHeight
      document.body.style.paddingBottom = `${inputHeight}px`
      document.querySelector('.main-container')?.style.setProperty("padding-bottom", `${inputHeight}px`)
    }
  }

  function isAtBottom() {
    const threshold = 100
    return chatsContainer.scrollTop + chatsContainer.clientHeight >= chatsContainer.scrollHeight - threshold
  }

  function smartScroll() {
    if (shouldAutoScroll && !isUserScrolling) {
      chatsContainer.scrollTop = chatsContainer.scrollHeight
    }
  }

  chatsContainer.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout)
    isUserScrolling = true

    shouldAutoScroll = isAtBottom()
    scrollTimeout = setTimeout(() => { isUserScrolling = false }, 150)
  })

  if (isMobile) {
    window.addEventListener('resize', () => {
      handleViewportChange()
      adjustBodyPadding()
    })

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        initialViewportHeight = window.innerHeight
        handleViewportChange()
        adjustBodyPadding()
      }, 700)
    })

    textarea.addEventListener('focus', () => {
      setTimeout(() => {
        handleViewportChange()
        adjustBodyPadding()
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => textarea.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500)
      }, 400)
    })

    textarea.addEventListener('blur', () => {
      setTimeout(() => {
        initialViewportHeight = window.innerHeight
        handleViewportChange()
        adjustBodyPadding()
      }, 300)
    })
  }

  function waitForDependencies(callback) {
    if (window.marked && window.hljs) callback()
    else setTimeout(() => waitForDependencies(callback), 50)
  }

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
          try {
            return lang && hljs.getLanguage(lang)
              ? hljs.highlight(code, { language: lang }).value
              : hljs.highlightAuto(code).value
          } catch {
            return code
          }
        },
      })

      const rawHTML = marked.parse(message)
      const tempDiv = document.createElement("div")
      let index = 0
      messageContainer.appendChild(tempDiv)

      function typeWriter() {
        if (index < rawHTML.length) {
          tempDiv.innerHTML = rawHTML.slice(0, index + 1)
          smartScroll()
          tempDiv.querySelectorAll("pre code").forEach(block => hljs.highlightElement(block))
          index++
          setTimeout(typeWriter, 10)
        } else {
          tempDiv.querySelectorAll("pre code").forEach(block => hljs.highlightElement(block))
        }
      }
      typeWriter()

      messageDiv.appendChild(messageContainer)
      chatsContainer.appendChild(messageDiv)
      smartScroll()
    })
  }

  function showLoadingIndicator() {
    const loadingDiv = document.createElement("div")
    loadingDiv.className = "ai-response my-4 w-full flex justify-start loading-indicator"
    loadingDiv.innerHTML = '<p class="inline-block max-w-[50%] py-2 px-4 rounded-4xl bg-[#303030] break-words text-content">...</p>'
    chatsContainer.appendChild(loadingDiv)
    smartScroll()
    return loadingDiv
  }

  function removeLoadingIndicator(element) {
    if (element?.parentNode) element.parentNode.removeChild(element)
  }

  async function sendMessageToAPI(message) {
    try {
      const userMessage = { role: "user", content: message }
      const requestPayload = {
        messages: [...conversationMessages, userMessage],
        systemPrompt: `You are Milo, a helpful AI assistant...`
      }

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
      })

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      const data = await response.json()
      if (data.messages) conversationMessages = data.messages
      return data
    } catch (error) {
      console.error("Error sending message to API:", error)
      return { error: "Failed to get response from the API" }
    }
  }

  async function sendMessage() {
    const message = textarea.value.trim()
    if (!message) return

    shouldAutoScroll = true
    const messageDiv = document.createElement("div")
    messageDiv.className = "user-input my-4 w-full flex justify-end"
    const messageParagraph = document.createElement("p")
    messageParagraph.className = "inline-block max-w-[50%] py-2 px-4 rounded-4xl bg-[#303030] break-words text-content max-sm:max-w-[70%]"
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
      addAIResponse(response.reply || "No response content")
    } catch (error) {
      removeLoadingIndicator(loadingIndicator)
      addAIResponse("Sorry, there was an error connecting to the AI service.")
    }
  }

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault()
      sendMessage()
    }
  })

  sendButton.addEventListener("click", sendMessage)

  textarea.addEventListener("input", function () {
    this.style.height = "auto"
    this.style.height = this.scrollHeight + "px"
    adjustBodyPadding()
  })

  // Initial padding set
  setTimeout(adjustBodyPadding, 500)
})
