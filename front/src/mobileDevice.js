import socket from './socket'
import config from './config'
import { convertRange } from './helpers'

const cross = document.createElement('div')
const gammaPos = document.createElement('div')
const gammaNeg = document.createElement('div')
const betaPos = document.createElement('div')
const betaNeg = document.createElement('div')

function setupCross() {
  cross.className = 'cross'
  gammaPos.className = 'cross_a_pos'
  gammaNeg.className = 'cross_a_neg'
  betaPos.className = 'cross_b_pos'
  betaNeg.className = 'cross_b_neg'

  cross.append(gammaPos, gammaNeg, betaPos, betaNeg)

  config.app.append(cross)
}

function updateCross(beta, gamma) {
  if (beta < 0) {
    betaNeg.style.height = `${-beta*5}px`
    betaNeg.style.transform = `translateY(${beta*5}px)`
    //reset
    betaPos.style.height = '0px'

  } else {
    betaPos.style.height = `${beta*3}px`
    //reset
    betaNeg.style.height = '0px'
    // betaNeg.style.transform = 'translateX(0px)'
  }

  if (gamma > 0) {
    gammaPos.style.width = `${gamma*2}px`
    //reset
    gammaNeg.style.width = '0px'
    gammaNeg.style.transform = 'translateX(-2px)'

  } else {
    gammaNeg.style.width = `${-gamma*2}px`
    gammaNeg.style.transform = `translateX(${gamma*2}px)`
    //reset
    gammaPos.style.width = '0px'
  }
}

function detectDeviceOrientation() {
  if(window.DeviceOrientationEvent) {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', (event) => {
            // alpha 0-360 // beta 0-180 // gamma 0-180
            let alpha = Math.round(event.alpha)
            let beta = Math.round(event.beta)
            let gamma =  Math.round(event.gamma)

            updateCross(beta, gamma)

            socket.emit('movement', {
              movements: {
                alpha: alpha,
                beta: beta,
                gamma: gamma
              }
            })
          })
        }
      })
      .catch(console.error)
  } else {
    window.alert('Votre navigateur ne supporte pas deviceorientation');
  }
}

export {
  setupCross,
  detectDeviceOrientation
}
