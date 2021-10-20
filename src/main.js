import config from './config.js'
import css from "./style.css";

const BaseAudioContext = window.AudioContext || window.webkitAudioContext
const context = new BaseAudioContext()
const app = document.getElementById('app')

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet"
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile"
  }
  return "desktop"
};

function requestOrientationPermission() {
  if(window.DeviceOrientationEvent) {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', (event) => {
            let alpha = Math.round(event.alpha)
            let beta = Math.round(event.beta)
            let gamma =  Math.round(event.gamma)

            // alpha 0-360
            // beta 0-180
            // gamma 0-180

            if (alpha > 10 && alpha < 100) {
              console.log(alpha)
            }
          })
        }
      })
      .catch(console.error)
  } else {
    window.alert('Votre navigateur ne supporte pas deviceorientation');
  }
}

/* Boutons */
function setupButtons() {
  const button = document.createElement('button')
  button.className = 'button'
  button.innerHTML = 'pause'
  let playing = true

  button.addEventListener('click', () => {
    if (playing) {
      button.innerHTML = 'play'
      context.suspend().then(() => {
        console.log('paused')
      })
    } else {
      button.innerHTML = 'pause'
      context.resume().then(() => {
        console.log('playing')
      });
    }
    playing = !playing
  })

  app.append(button)

  document.addEventListener('keydown', (event) => {
    const nomTouche = event.code;
    // alert(`Touche pressée ${nomTouche}`);

    if (nomTouche === 'Space') {
      if (playing) {
        context.suspend().then(() => {
          console.log('paused')
        })
      } else {
        context.resume().then(() => {
          console.log('playing')
        });
      }
      playing = !playing
    }
  }, false);
}

function playOscillator(
  startTime,
  endTime,
  value,
  type,
  param
) {
  // console.log(type, param)
  const oscillator = context.createOscillator()

  if (type === 'changes') {
    oscillator.frequency.setValueAtTime(value, param)
  } else {
    oscillator.frequency.value = value
  }

  oscillator.connect(context.destination)
  oscillator.start(startTime)

  if (type === 'varies') {
    setInterval(() => {
      oscillator.frequency.value = Math.floor(Math.random()* 1000)
    }, 100)
  }

  // endTime && (oscillator.stop(endTime))
  oscillator.stop(endTime || 10)
}

function soundLoop() {
  playOscillator(
    context.currentTime,
    '',
    196.2,
    'changes',
    2
  )
  playOscillator(
    context.currentTime,
    context.currentTime + 0.5,
    196.2
  )
  // playOscillator(
  //   context.currentTime,
  //   '',
  //   Math.floor(Math.random()* 1000),
  //   'varies',
  //   100
  // )
}

document.addEventListener('DOMContentLoaded', () => {
  console.log(getDeviceType())

  const welcomeScreen = document.createElement('div')
  welcomeScreen.className = 'welcome-screen'
  welcomeScreen.innerHTML = '<div>Click or tap anywhere</div>'

  app.appendChild(welcomeScreen)

  welcomeScreen.addEventListener('click', () => {
    app.removeChild(welcomeScreen)
    // window.alert('test')

    if (getDeviceType() === 'mobile' || getDeviceType() === 'tablet') {
      requestOrientationPermission()

    } else {
      setupButtons()
      soundLoop()
    }
  })
})
