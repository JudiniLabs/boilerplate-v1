import { fetchEventSource } from '@microsoft/fetch-event-source';
import './chat-example.css'

// store the conversation in a variable
const thread = [
    {
        role: 'assistant',
        content: 'Hello, I am a chatbot. How can I help you?',
    }
]

document.querySelector('#app').innerHTML = `
  <section id="thread"></section>
  <footer>
    <textarea id="input" placeholder="Send a message"></textarea>
    <div class="text-muted text-center py-1"><small>Free Research Preview. <a href="https://judini.ai" target="_blank" rel="noreferrer" class="underline">Judini.ai</a></small></div>
  </footer>
`

const input = document.getElementById('input')
const apiKey = import.meta.env.VITE_JUDINI_CHAT_APIKEY
const agent =  import.meta.env.VITE_JUDINI_CHAT_AGENT

const saveMessage = (msg) => {
  const threadEl = `
    <article>
      <div class="thread-item ${msg.role}">
        <small class="sender">${msg.role}</small>
        <div class="content">${msg.content}</div>
      </div>
    </article>
  `
  document.getElementById('thread').innerHTML += threadEl
}

// render the conversation
const threadEl = document.getElementById('thread')
thread.forEach((msg) => {
  saveMessage(msg)
})

const getCompletion = async (message) => {
  let response = ''
  let signal = new AbortController()
  const body = {
    messages: [{role:'user',content:message}],
  }

  await saveMessage({ role: 'assistant', content: '' })

  fetchEventSource(`https://playground.judini.ai/api/v1/agent/${agent}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      bodyTimeout: 0,
      headersTimeout: 0,
      signal: signal.signal,
      async onopen (response) {
          if (response.status === 200) {
              console.log('Connected to chat')
              return
          }
          let error
          try {
              const body = await response.text()
              error = new Error(`Failed to send message. HTTP ${response.status} - ${body}`)
              error.status = response.status
              error.json = JSON.parse(body)
          } catch {
              error = error || new Error(`Failed to send message. HTTP ${response.status}`)
          }
          throw error
      },
      onclose () {
          console.log('Connection closed')
      },
      onerror (err) {
          console.error('Connection error', err)
          throw err
      },
      openWhenHidden: true, // open the connection even if the tab is hidden
      onmessage (msg) {
          if (msg.data.includes('data: [DONE]')) {
              signal.abort()
              return
          }
          try {
              const data = msg.data.split('\n\n')
              for (let i = 0; i < data.length; i++) {
                  const element = JSON.parse(data[i].replace('data: ', ''))
                      if (element.data !== undefined) {
                          response += element.data
                          // add message to the thread
                          thread[thread.length - 1].content = response
                          // update the last thread in the DOM
                          const lastThreadItem = threadEl.lastElementChild;
                          lastThreadItem.querySelector('.content').innerHTML = response
                      }
              }
          } catch (e) {
              console.error(e)
          }
      }
  })
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    saveMessage({ role: 'user', content: input.value })
    getCompletion(input.value)
    input.value = ''
    response = ''
  }
})

