import Cell from './Cell.js'
import DEFAULT_OPTIONS from './defaultOptions.js'
import loadImages from './utils/imageLoader.js'
import { randomPick, randomRange, samplePoisson } from './utils/randoms.js'

// 立即停止动画时的淡出加速度值
const STOP_ALPHA_ACC = -8

export default class DroppingCanvas {
  /**
   * 创建DroppingCanvas实例
   *
   * @param {HTMLCanvasElement} $canvas 执行动画的Canvas元素
   * @param {Array, string} [imgUrls=[]] 动画图片
   * @param {Object} [options=DEFAULT_OPTIONS]
   * @memberof DroppingCanvas
   */
  constructor($canvas, imgUrls = [], options = DEFAULT_OPTIONS) {
    if (!$canvas) {
      throw '[Dropping Canvas]: Missing canvas element.'
    }
    this.imgUrls = imgUrls
    this.images = []
    this.cells = []
    this.options = {}
    this.isRunning = false
    this.isImageLoaded = false
    this.isStopGenerate = false
    this.isImmediateClean = false
    this.past = null
    this.$canvas = $canvas
    this.context = $canvas.getContext('2d')
    this._assignOptions(options)
  }

  /**
   * 更新Cell的参数
   *
   * @param {Object} options 配置参数
   * @param {boolean} [isCover=false] 若为false则没有提供的参数会用默认值代替，true则只对提供的参数进行更新
   * @memberof DroppingCanvas
   */
  _assignOptions(options, isCover = false) {
    if (!options) {
      this.options = DEFAULT_OPTIONS
    }
    if (isCover) {
      this.options = Object.assign(this.options, options)
    } else {
      this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    }
  }

  /**
   * 创建单个Cell实例
   *
   * @param {Object} options 配置参数
   * @returns
   * @memberof DroppingCanvas
   */
  _createCell(options) {
    const img = randomPick(this.images)

    const formattedOptions = {}

    for (let key in options) {
      if (options[key] instanceof Array) {
        formattedOptions[key] = randomRange(+options[key][0], +options[key][1])
      } else if (typeof options[key] === 'string') {
        formattedOptions[key] = +options[key]
      } else {
        formattedOptions[key] = options[key]
      }
    }

    if (!('x' in formattedOptions) || formattedOptions.x === null) {
      formattedOptions.x = randomRange(0, this.$canvas.width)
    }
    if (!('y' in formattedOptions) || formattedOptions.y === null) {
      formattedOptions.y = -formattedOptions.z * Math.max(img.width, img.height)
    }

    return new Cell(img, img.width, img.height, formattedOptions)
  }

  _createCells(options, duration) {
    const newCellsNum = samplePoisson(duration * +options.dropPerSecond)
    for (let i = 0; i < newCellsNum; i++) {
      this.cells.push(this._createCell(options))
    }
  }

  /**
   * 对目前所有的Cell实例进行单帧绘制
   *
   * @memberof DroppingCanvas
   */
  _render() {
    const { context, cells } = this
    context.clearRect(0, 0, this.$canvas.width, this.$canvas.height)

    for (let i = 0; i < cells.length; i++) {
      if (this.isStopGenerate && this.isImmediateClean) {
        cells[i].aA = Math.min(STOP_ALPHA_ACC, cells[i].aA)
      }
      context.globalAlpha = cells[i].a
      let width
      let height

      if (!this.options.isBoundingSize) {
        width = cells[i].z * cells[i].width
        height = cells[i].z * cells[i].height
      } else {
        width = Math.max(0, cells[i].z * cells[i].width)
        height = Math.max(0, cells[i].z * cells[i].height)
      }
      context.translate(cells[i].x, cells[i].y)
      context.rotate(cells[i].r)

      // 尺寸可视才执行绘制
      if (width !== 0 && height !== 0) {
        context.drawImage(
          cells[i].img,
          -Math.floor(width / 2),
          -Math.floor(height / 2),
          width,
          height
        )
      }
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.globalAlpha = 1
    }
  }

  _tickModel(duration) {
    const cells = this.cells

    if (duration < 0.5) {
      for (let i = 0, len = cells.length; i < len; i++) {
        cells[i].tick(duration)
      }
      if (!this.isStopGenerate) {
        this._createCells(this.options, duration)
      }
    }

    // 此时所有Cell实例已消失，关闭动画
    if (cells.length === 0 && this.isStopGenerate) {
      this.isRunning = false
      this.isImmediateClean = false
    }

    // 当Cell在画布外，清除其实例
    const canvasHeight = this.$canvas.height
    for (let i = 0; i < cells.length; i++) {
      const width = cells[i].width
      const height = cells[i].height
      const maxRadius = (cells[i].z * Math.max(width, height)) / 2
      const isVisible = cells[i].y < canvasHeight + maxRadius
      if (!isVisible) {
        cells.splice(i, 1)
      }
    }
  }

  _startAnimation() {
    const now = Date.now()
    const duration = this.past === null ? 0 : now - this.past
    this.past = now

    this._tickModel(duration / 1000)

    this._render()

    if (this.isRunning) {
      window.requestAnimationFrame(this._startAnimation.bind(this))
    }
  }

  start() {
    if (this.isRunning && !this.isStopGenerate) {
      return
    }
    if (!this.isImageLoaded) {
      loadImages(this.imgUrls, (msg, images) => {
        if (msg) {
          console.error(msg)
        }
        this.isImageLoaded = true
        this.isRunning = true
        this.isStopGenerate = false
        this.images = images
        this._startAnimation()
      })
    } else {
      this.isRunning = true
      this.isStopGenerate = false
      this._startAnimation()
    }
  }

  pause() {
    this.isRunning = false
  }

  /**
   * 停止生成
   *
   * @param {boolean} [isImmediateClean=false] 若为false则等待全部Cell离开画布才停止绘制，true则立即淡出并停止绘制
   * @memberof DroppingCanvas
   */
  stop(isImmediateClean = false) {
    this.isStopGenerate = true
    this.isImmediateClean = isImmediateClean
  }

  updateOptions(options, isCover) {
    this._assignOptions(options, isCover)
  }

  updateImages(images) {
    loadImages(images, (msg, images) => {
      if (msg) {
        console.error(msg)
      }
      this.images = images
    })
  }
}
