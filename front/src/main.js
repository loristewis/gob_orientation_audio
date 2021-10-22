import css from "./style.css";
import config from './config.js'
import { getDeviceType } from './helpers'
import {
  setupCross,
  detectDeviceOrientation
} from './mobileDevice'
import {
  setupButton,
  getOrientations,
  setupSound,
  setupCanvas,
  canvasLoop,
} from './desktopDevice'
import socket from './socket'

socket.on("connect", () => {
  console.log(`connect: ${socket.id}`)
})
socket.on("disconnect", () => {
  console.log(`disconnect: ${socket.id}`)
})

document.addEventListener('DOMContentLoaded', () => {
  console.log('getDeviceType - ' + getDeviceType())

  const welcomeScreen = document.createElement('div')
  welcomeScreen.className = 'welcome-screen'
  welcomeScreen.innerHTML = `<div>${config.i18n.welcomeScreen}</div>`
  config.app.appendChild(welcomeScreen)

  welcomeScreen.addEventListener('click', () => {
    config.app.removeChild(welcomeScreen)
    if (getDeviceType() === 'mobile' || getDeviceType() === 'tablet') {
      // mobileDevice.js
      setupCross()
      detectDeviceOrientation()
    } else {
      // desktopDevice.js
      setupSound()
      setupCanvas()
      canvasLoop()
      getOrientations()
      setupButton()
    }
  })
})
