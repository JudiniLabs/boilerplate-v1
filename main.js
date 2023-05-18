import './style.css'
import { sendMsg } from './sse.js'

document.querySelector('#app').innerHTML = `
  <main>
    <h1>Ejemplo-SSE</h1>
    <textarea id="textArea" placeholder="aquí debería aparecer la respuesta"></textarea>
    <input type="text" id="input" placeholder="de que trata el pdf?"/>
  </main>
`

const input = document.getElementById('input')
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        sendMsg()
        input.value = ''
    }
})

