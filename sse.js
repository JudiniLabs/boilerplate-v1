import { fetchEventSource } from '@microsoft/fetch-event-source';

export function sendMsg() {
    let response = ''
    let signal = new AbortController()
    const userMsg = document.getElementById('input').value
    const body = {
        messages: [{role:'user',content:userMsg}],
    }
    const apiKey = ''
    fetchEventSource('https://playground.judini.ai/api/v1/agent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer '+ apiKey
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
            }// msg.data
            try {
                const data = msg.data.split('\n\n')
                for (let i = 0; i < data.length; i++) {
                    const element = JSON.parse(data[i].replace('data: ', ''))
                        if (element.data !== undefined) {
                            response += element.data
                            updateTextArea(response) // update the text area with the response gradually
                        }
                }
            } catch (e) {
                console.error(e)
            }
        }
    })
}

function updateTextArea(text) {
    const textArea = document.getElementById('textArea')
    textArea.value = text
}
