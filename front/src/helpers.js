const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet"
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile"
  }
  return "desktop"
}

function playOscillator (
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

export {
  getDeviceType,
  playOscillator
}
