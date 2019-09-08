!(function() {
  var options = {
    dropPerSecond: 20, // 每秒下落
    isBoundingSize: true, // 元素缩小消失（长宽为0）后是否约束其变大
    z: [0.2, 0.3],
    r: [0, 2 * Math.PI],
    a: [1, 1],
    vX: [-60, 60],
    vY: [200, 500],
    vZ: [0, 0],
    vR: [-1, 1],
    vA: [0, 0],
    aX: [0, 0],
    aY: [80, 200],
    aZ: [-0.3, 0],
    aR: [0, 0],
    aA: [-1, -0.6]
  }
  var canvas = document.getElementById('canvas')
  var images = ['./images/1.png', './images/2.png', './images/3.png']
  var droppingCanvas = new DroppingCanvas(canvas, images, options)

  droppingCanvas.start()
  resize()
  initOptions()
  initActions()
  listenInput()
  window.addEventListener('resize', resize)

  function resize() {
    canvas.width = document.body.offsetWidth
    canvas.height = document.body.offsetHeight
  }

  function initOptions() {
    var key
    for (key in options) {
      if (options[key] instanceof Array) {
        var inputMinEle = document.getElementsByName(key + 'Min')[0]
        var inputMaxEle = document.getElementsByName(key + 'Max')[0]
        if (inputMinEle) {
          inputMinEle.value = options[key][0]
        }
        if (inputMaxEle) {
          inputMaxEle.value = options[key][1]
        }
      } else if (typeof options[key] === 'boolean') {
        var inputEle = document.getElementsByName(key)[0]
        if (inputEle) {
          inputEle.checked = options[key]
        }
      } else {
        var inputEle = document.getElementsByName(key)[0]
        if (inputEle) {
          inputEle.value = options[key]
        }
      }
    }
  }

  function listenInput() {
    document.addEventListener('change', function(e) {
      var ele = e.target
      var key

      if (ele.name[0] === 'x' && !options.x) {
        options.x = []
      }
      if (ele.name[0] === 'y' && !options.y) {
        options.y = []
      }

      if (ele.name.indexOf('Min') > 0) {
        key = ele.name.substr(0, ele.name.indexOf('Min'))
        options[key][0] = ele.value
      } else if (ele.name.indexOf('Max') > 0) {
        key = ele.name.substr(0, ele.name.indexOf('Max'))
        options[key][1] = ele.value
      } else if (ele.type === 'checkbox') {
        options[key] = ele.checked
      } else if (ele.type === 'file') {
        droppingCanvas.updateImages(e.target.files)
      } else {
        key = ele.name
        options[key] = ele.value
      }

      droppingCanvas.updateOptions(options)
    })
  }

  function initActions() {
    document.addEventListener('click', function(e) {
      switch (e.target.id) {
        case 'start':
          droppingCanvas.start()
          break
        case 'pause':
          droppingCanvas.pause()
          break
        case 'stop':
          droppingCanvas.stop()
      }
    })
  }
})()
