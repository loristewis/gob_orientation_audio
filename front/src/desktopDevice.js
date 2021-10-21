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
let color = `rgb(${Math.floor(Math.random() * 255)}, 0, ${Math.floor(Math.random() * 255)})`

function setupSound() {
  osc.type = 'sine'
  osc.frequency.value = 880;

  amp.gain.setValueAtTime(0, audioContext.currentTime)

  lfo.type = 'square';
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
  canvasContext.fillStyle = '#ccc'
  canvasContext.fillRect(0, 0, window.innerWidth, window.innerHeight)

  circle.arc(
    window.innerWidth/2,
    window.innerHeight/2,
    radius,
    0,
    2 * Math.PI
  )

  // RANGED FOR COLOR
  let rangedBeta = convertRange( beta, [ -90, 90 ], [ 0, 255 ] )
  let rangedGamma = convertRange( gamma, [ -90, 90 ], [ 178, 237 ] )
  if (!isNaN(rangedBeta) || !isNaN(rangedGamma)) {
    color = `rgb(${Math.floor(rangedBeta)}, 120, ${Math.floor(rangedGamma)})`
  }

  console.log(`color: ${color}`)

  // canvasContext.fillStyle = 'rgb(' + Math.floor(255) + ',' + Math.floor(255) + ',0)'
  canvasContext.fillStyle = color
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

    // console.log(`${msg.device} : ${beta}     ${gamma}`)
    // console.log(`                       ${rangedBeta}     ${rangedGamma}`)

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
  button.innerHTML = 'pause'

  let playing = true

  button.addEventListener('click', () => {
    if (playing) {
      button.innerHTML = 'play'
      audioContext.suspend().then(() => {
        console.log('paused')
      })
    } else {
      button.innerHTML = 'pause'
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

function playOscillator (startTime, endTime, value, type, param) {
  const oscillator = audioContext.createOscillator()
  // oscillator.connect(gain)
  // gain.connect(context.destination)
  // gain.gain.value = 0.3

  type === 'changes'
    ? oscillator.frequency.setValueAtTime(value, param)
    : oscillator.frequency.value = value

  oscillator.type="triangle"
  oscillator.connect(audioContext.destination)
  oscillator.start(startTime)

  if (type === 'varies') {
    setInterval(() => {
      oscillator.frequency.value = Math.floor(Math.random()* 1000)
    }, 100)
  }

  oscillator.stop(endTime || 120)
}
function buffer() {
  let myArrayBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 3, audioContext.sampleRate);

  // Fill the buffer with white noise;
  // just random values between -1.0 and 1.0
  for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
    // This gives us the actual ArrayBuffer that contains the data
    let nowBuffering = myArrayBuffer.getChannelData(channel);
    for (let i = 0; i < myArrayBuffer.length; i++) {
      // Math.random() is in [0; 1.0]
      // audio needs to be in [-1.0; 1.0]
      nowBuffering[i] = Math.random() * 2 - 1;
    }
  }

  // Get an AudioBufferSourceNode.
  // This is the AudioNode to use when we want to play an AudioBuffer
  let source = audioContext.createBufferSource();
  // set the buffer in the AudioBufferSourceNode
  source.buffer = myArrayBuffer;
  // connect the AudioBufferSourceNode to the
  // destination so we can hear the sound
  source.connect(audioContext.destination);
  // start the source playing
  source.start();
}
function soundLoop() {
  // playOscillator(
  //   context.currentTime,
  //   '',
  //   300
  // )

  // buffer()

  // playOscillator(
  //   context.currentTime,
  //   '',
  //   196.2,
  //   'changes',
  //   2
  // )
  // playOscillator(
  //   context.currentTime,
  //   context.currentTime + 0.5,
  //   196.2
  // )
  // playOscillator(
  //   context.currentTime,
  //   '',
  //   Math.floor(Math.random()* 1000),
  //   'varies',
  //   100
  // )
}

export {
  setupSound,
  setupCanvas,
  canvasLoop,
  getOrientations,
  setupButton,
  soundLoop
}
