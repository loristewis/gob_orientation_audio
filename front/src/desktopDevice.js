import config from './config'
import socket from './socket'
import { convertRange } from './helpers'

const BaseAudioContext = window.AudioContext || window.webkitAudioContext
const audioContext = new BaseAudioContext()
const osc = audioContext.createOscillator()
const amp = audioContext.createGain()
const lfo = audioContext.createOscillator();

let beta
let gamma

const canvas = document.createElement('canvas')
const canvasContext = canvas.getContext('2d')
const circle = new Path2D()
let radius = window.innerHeight > window.innerWidth ? window.innerWidth/4 : window.innerHeight/4
let circleColor = `rgb(${Math.floor(Math.random() * 255)}, 0, ${Math.floor(Math.random() * 255)})`
let circleX = window.innerWidth/2
let circleY = window.innerHeight/2

function setupSound() {
  osc.type = 'sine'
  osc.frequency.value = 880;

  amp.gain.setValueAtTime(0, audioContext.currentTime)

  lfo.type = 'sine';
  lfo.frequency.value = 5;

  lfo.connect(amp.gain)
  osc.connect(amp).connect(audioContext.destination)
  lfo.start()
}

function resizeCanvas() {
  console.log('resize')
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight - 50}px`
}

function setupCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight - 50

  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas()

  config.app.append(canvas)
}

function canvasLoop() {
  canvasContext.fillStyle = 'antiquewhite'
  canvasContext.fillRect(0, 0, window.innerWidth, window.innerHeight)

  circle.arc(
    circleX,
    circleY,
    radius,
    0,
    2 * Math.PI
  )

  // RANGED FOR COLOR
  let rangedBeta = convertRange( beta, [ -90, 90 ], [ 0, 255 ] )
  let rangedGamma = convertRange( gamma, [ -90, 90 ], [ 178, 237 ] )
  if (!isNaN(rangedBeta) || !isNaN(rangedGamma)) {
    circleColor = `rgb(${Math.floor(rangedBeta)}, 120, ${Math.floor(rangedGamma)})`

    circleY = window.innerHeight/2 + Math.floor(beta)*3
    circleX = window.innerWidth/2 + Math.floor(gamma)*3
  }

  console.log(`color: ${circleColor}`)

  canvasContext.fillStyle = circleColor
  canvasContext.fill(circle)

  window.requestAnimationFrame(canvasLoop)
}

function getOrientations() {
  let init = false
  socket.on('movementToDesktop', (msg) => {
    if (!init) {
      init = !init
      osc.start(audioContext.currentTime)
    }

    beta = msg.movements.beta
    gamma = msg.movements.gamma

    // RANGED FOR SOUND
    let rangedBeta = convertRange( beta, [ -90, 90 ], [ 0, 8 ] )
    let rangedGamma = convertRange( gamma, [ -90, 90 ], [ 95, 800 ] )

    lfo.frequency.value = rangedBeta
    osc.frequency.value = rangedGamma
  })
}

/* Boutons */
function setupButton() {
  const buttonContainer = document.createElement('div')
  buttonContainer.className = 'button-container'

  const button = document.createElement('button')
  button.className = 'button'
  button.innerHTML = config.i18n.pause

  let playing = true

  button.addEventListener('click', () => {
    if (playing) {
      button.innerHTML = config.i18n.play
      audioContext.suspend().then(() => {
        console.log('paused')
      })
    } else {
      button.innerHTML = config.i18n.pause
      audioContext.resume().then(() => {
        console.log('playing')
      })
    }
    playing = !playing
  })

  buttonContainer.append(button)
  config.app.append(buttonContainer)

  document.addEventListener('keydown', (event) => {
    const nomTouche = event.code;
    // alert(`Touche pressée ${nomTouche}`);

    if (nomTouche === 'Space') {
      if (playing) {
        audioContext.suspend().then(() => {
          console.log('paused')
        })
      } else {
        audioContext.resume().then(() => {
          console.log('playing')
        });
      }
      playing = !playing
    }
  }, false);
}

export {
  setupSound,
  setupCanvas,
  canvasLoop,
  getOrientations,
  setupButton
}
