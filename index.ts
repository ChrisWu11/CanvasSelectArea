interface ICanvasSelectArea {
  imgId: string
}

class CanvasSelectArea implements ICanvasSelectArea {
  imgId!: string
  lineWidth: number
  originImgWidth: number
  originImgHeight: number
  img: HTMLImageElement
  canvas: HTMLCanvasElement
  width: number
  height: number
  showHistory: string[]
  newImg: HTMLImageElement
  ctx: CanvasRenderingContext2D | null
  drawing: boolean
  drawingHistory: string[]
  drawingNextHistory: string[]
  path: Array<{ x: number; y: number }>
  bgImg: HTMLImageElement
  copyCanvas: HTMLCanvasElement
  copyCtx: CanvasRenderingContext2D | null
  CopydrawingHistory: string[]
  CopydrawingNextHistory: string[]
  drawingCanvas: HTMLCanvasElement
  drawingCtx: CanvasRenderingContext2D | null
  drawModel: string
  boundDrawFree: (event: MouseEvent) => void
  boundDrawRectangle: (event: MouseEvent) => void
  boundStopDrawing: (event: MouseEvent) => void
  boundStopFreeDrawing: (event: MouseEvent) => void
  startY: number
  startX: number
  endWidth: number
  endHeight: number

  constructor({ imgId }) {
    this.img = document.getElementById(imgId) as HTMLImageElement

    this.lineWidth = 15
    // this.lineColor = lineColor

    this.startX = 0
    this.startY = 0
    this.endWidth = 0
    this.endHeight = 0

    this.canvas = document.createElement('canvas')
    // id设为canvas，方便调试
    this.canvas.id = 'canvas'

    this.width = Number(this.img.style.width.replace('px', '')) || this.img.offsetWidth
    this.height = Number(this.img.style.height.replace('px', '')) || this.img.offsetHeight

    console.log('this.img', this.img.offsetWidth, this.img.offsetHeight)

    this.originImgWidth = this.width
    this.originImgHeight = this.height

    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.borderRadius = '8px'

    this.showHistory = []

    // 创建新的 img 元素
    this.newImg = document.createElement('img')
    this.newImg.width = this.width
    this.newImg.height = this.height
    this.newImg.style.position = 'absolute'
    this.newImg.style.borderRadius = '8px'
    this.newImg.style.overflow = 'hidden'
    this.newImg.src = 'https://acceleratepic.miniso.com/images/miniso/1706583403299_touming.png'

    this.newImg.style.top = '0'
    this.newImg.style.left = '0'
    this.newImg.style.bottom = '0'
    this.newImg.style.right = '0'
    this.newImg.style.margin = 'auto'

    this.img.parentNode!.insertBefore(this.newImg, this.canvas.nextSibling)

    this.ctx = this.canvas.getContext('2d')
    this.drawing = false

    this.drawingHistory = this.createObservableArray([])
    this.drawingNextHistory = []

    this.path = [] // 添加一个数组来存储路径

    this.bgImg = new Image()
    this.bgImg.crossOrigin = 'anonymous'
    this.bgImg.src = 'https://acceleratepic.miniso.com/images/miniso/1705297991635_Rectangle.png'
    this.copyCanvas = document.createElement('canvas')
    this.copyCanvas.width = this.width
    this.copyCanvas.height = this.height
    this.copyCtx = this.copyCanvas.getContext('2d')
    this.CopydrawingHistory = []
    this.CopydrawingNextHistory = []

    this.drawingCanvas = document.createElement('canvas')
    this.drawingCanvas.id = 'drawingCanvas'
    this.drawingCanvas.width = this.width
    this.drawingCanvas.height = this.height
    this.drawingCanvas.style.position = 'absolute' // 设置 canvas 位置为绝对定位

    this.drawingCanvas.style.top = '0'
    this.drawingCanvas.style.left = '0'
    this.drawingCanvas.style.bottom = '0'
    this.drawingCanvas.style.right = '0'
    this.drawingCanvas.style.margin = 'auto'

    this.img.parentNode!.insertBefore(this.drawingCanvas, this.img)
    this.drawingCanvas.style.zIndex = '10'
    this.drawingCtx = this.drawingCanvas.getContext('2d')

    this.boundDrawFree = this.drawFree.bind(this)
    this.boundDrawRectangle = this.drawRectangle.bind(this)
    this.boundStopDrawing = this.stopDrawing.bind(this)
    this.boundStopFreeDrawing = this.stopFreeDrawing.bind(this)

    this.drawingCanvas.addEventListener('mousedown', this.startDrawing.bind(this))

    this.drawingCanvas.addEventListener('mousemove', this.boundDrawFree)

    this.drawingCanvas.addEventListener('mouseup', this.boundStopFreeDrawing)

    this.drawModel = 'free'
  }

  createObservableArray(array: Array<string>) {
    return new Proxy(array, {
      set: (target, key, value) => {
        target[key] = value
        if (key === 'length') {
          console.log('Array length has changed:', target.length)
        }
        return true
      }
    })
  }

  getHistory() {
    return {
      drawingHistory: this.drawingHistory,
      CopydrawingHistory: this.CopydrawingHistory,
      showHistory: this.showHistory
    }
  }

  reSizeCanvas(params) {
    const { width, height } = params
    this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawingCtx!.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.copyCtx!.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (String(width).indexOf('px') !== -1 && String(width).indexOf('px') !== -1) {
      this.width = Number(width.replace('px', ''))
      this.height = Number(height.replace('px', ''))
    } else {
      this.width = width
      this.height = height
    }

    this.canvas.width = this.width
    this.canvas.height = this.height
    this.drawingCanvas.width = this.width
    this.drawingCanvas.height = this.height
    this.copyCanvas.width = this.width
    this.copyCanvas.height = this.height
    this.newImg.width = this.width
    this.newImg.height = this.height
    if (this.drawingHistory.length) {
      this.newImg.src = this.drawingHistory[this.drawingHistory.length - 1]
    } else {
      this.newImg.src = 'https://acceleratepic.miniso.com/images/miniso/1706583403299_touming.png'
    }

    this.ctx!.beginPath()
    this.ctx!.drawImage(this.newImg, 0, 0, this.canvas.width, this.canvas.height)
    this.ctx!.closePath()

    const copyImg = new Image()
    copyImg.width = this.width
    copyImg.height = this.height
    if (this.CopydrawingHistory.length) {
      copyImg.src = this.CopydrawingHistory[this.CopydrawingHistory.length - 1]
    } else {
      copyImg.src = 'https://acceleratepic.miniso.com/images/miniso/1706583403299_touming.png'
    }

    copyImg.onload = () => {
      this.copyCtx!.drawImage(copyImg, 0, 0, this.width, this.height)
    }
  }

  startDrawing(event) {
    this.drawing = true
    this.ctx!.beginPath()
    this.drawingCtx!.beginPath()
    this.copyCtx!.strokeStyle = 'transparent'
    this.ctx!.strokeStyle = 'transparent'
    this.copyCtx!.fillStyle = 'white'

    if (this.drawModel === 'free') {
      this.copyCtx!.beginPath()
      this.drawingCtx!.strokeStyle = 'transparent'
      this.copyCtx!.moveTo(event.offsetX, event.offsetY)
      this.drawingCtx!.moveTo(event.offsetX, event.offsetY)
    } else {
      this.drawingCtx!.moveTo(event.offsetX, event.offsetY)
      this.drawingCtx!.fillStyle = 'transparent'
      this.drawingCtx!.strokeStyle = 'transparent'
    }
    this.ctx!.moveTo(event.offsetX, event.offsetY)
    this.path.push({ x: event.offsetX, y: event.offsetY }) // 在开始绘制时，将坐标添加到路径中

    this.startX = event.offsetX // 在开始绘制时，将当前坐标设置为矩形的起始坐标
    this.startY = event.offsetY
  }

  drawFree(event) {
    if (!this.drawing) return
    const pattern = this.drawingCtx!.createPattern(this.bgImg, 'repeat')

    this.drawingCtx!.lineTo(event.offsetX, event.offsetY)
    this.drawingCtx!.stroke()

    // this.ctx.beginPath();
    this.ctx!.lineTo(event.offsetX, event.offsetY)
    this.ctx!.stroke()
    if (pattern) {
      this.ctx!.fillStyle = pattern
    }

    // this.copyCtx.beginPath();
    this.copyCtx!.lineTo(event.offsetX, event.offsetY)
    this.copyCtx!.stroke()

    this.path.push({ x: event.offsetX, y: event.offsetY }) // 在绘制时，将坐标添加到路径中
    // 使用图案填充矩形
    if (pattern) {
      this.drawingCtx!.fillStyle = pattern
    }

    if (this.isClosedPath()) {
      // 如果形成了闭环，就填充颜色
      // this.ctx.fillStyle = this.lineColor;
      this.drawingCtx!.fill()
      this.ctx!.fill()
      this.copyCtx!.fill()
    }
  }

  async drawRectangle(event) {
    console.log('drawRectangle')
    if (!this.drawing) return

    const width = event.offsetX - this.startX // 计算矩形的宽度
    const height = event.offsetY - this.startY // 计算矩形的高度
    this.endWidth = width
    this.endHeight = height

    // // 使用 createPattern 方法创建一个图案
    const pattern = this.ctx!.createPattern(this.bgImg, 'repeat')

    this.drawingCtx!.clearRect(0, 0, this.canvas.width, this.canvas.height) // 清除之前的绘制
    this.drawingCtx!.closePath()
    this.drawingCtx!.beginPath()

    this.drawingCtx!.rect(this.startX, this.startY, width, height) // 绘制矩形
    this.drawingCtx!.fillStyle = pattern!
    this.drawingCtx!.fill()
    // this.drawingCtx.strokeStyle = this.lineColor;
    this.drawingCtx!.stroke()
  }

  changeDrawModel(model) {
    this.drawModel = model
    if (model === 'free') {
      this.changeMode(this.boundDrawFree, this.boundStopFreeDrawing)
    } else if (model === 'rectangle') {
      this.changeMode(this.boundDrawRectangle, this.boundStopDrawing)
    }
  }

  changeMode(drawMethod, stopMethod) {
    this.removeEventListeners()
    this.drawingCanvas.addEventListener('mousemove', drawMethod)
    this.drawingCanvas.addEventListener('mouseup', stopMethod)
  }

  removeEventListeners() {
    this.drawingCanvas.removeEventListener('mousemove', this.boundDrawFree)
    this.drawingCanvas.removeEventListener('mouseup', this.boundStopFreeDrawing)
    this.drawingCanvas.removeEventListener('mousemove', this.boundDrawRectangle)
    this.drawingCanvas.removeEventListener('mouseup', this.boundStopDrawing)
  }

  isClosedPath() {
    // const firstPoint = this.path[0]
    const lastPoint = this.path[this.path.length - 1]

    // 使用 Array.prototype.some 方法检查是否有任何点接近最后一个点
    return this.path.some((point, index) => {
      if (index === this.path.length - 1) return false // 忽略最后一个点，因为它总是接近自己
      const distance = Math.sqrt(Math.pow(lastPoint.x - point.x, 2) + Math.pow(lastPoint.y - point.y, 2))
      return distance < this.lineWidth
    })
  }

  async stopDrawing(event) {
    if (this.drawing) {
      this.drawing = false

      // this.ctx.fillStyle = this.lineColor;
      const width = event.offsetX - this.startX // 计算矩形的宽度
      const height = event.offsetY - this.startY // 计算矩形的高度

      await this.bgImg.decode()
      // 使用 createPattern 方法创建一个图案
      const pattern = this.ctx!.createPattern(this.bgImg, 'repeat')
      // 使用图案填充矩形
      this.ctx!.fillStyle = pattern!
      this.ctx!.fillRect(this.startX, this.startY, width, height) // 填充矩形
      this.ctx!.closePath()

      this.copyCtx!.beginPath()
      this.copyCtx!.rect(this.startX, this.startY, width, height) // 绘制矩形
      this.copyCtx!.fill()
      this.copyCtx!.closePath()

      this.drawingCtx!.closePath()
      this.drawingHistory.push(this.canvas.toDataURL())
      this.CopydrawingHistory.push(this.copyCanvas.toDataURL())
      this.newImg.src = this.drawingHistory[this.drawingHistory.length - 1]
      this.path = [] // 清空路径
    }
  }

  async stopFreeDrawing() {
    if (this.drawing) {
      this.drawing = false

      this.drawingCtx!.closePath()
      this.ctx!.closePath()
      this.copyCtx!.closePath()

      this.drawingHistory.splice(this.drawingHistory.length, 0, this.canvas.toDataURL())
      this.CopydrawingHistory.splice(this.CopydrawingHistory.length, 0, this.copyCanvas.toDataURL())
      this.newImg.src = this.drawingHistory[this.drawingHistory.length - 1]

      this.path = []
    }
  }

  undoLastDraw() {
    if (this.drawingHistory.length > 0) {
      const drawingItem = this.drawingHistory.pop()
      const copyItem = this.CopydrawingHistory.pop()
      this.addNextDraw(drawingItem, copyItem)
      this.clearCanvas()
      this.redrawHistory()
      this.redrawCopyHistory()
    }
  }

  addNextDraw(drawingItem, copyItem) {
    this.drawingNextHistory.push(drawingItem)
    this.CopydrawingNextHistory.push(copyItem)
  }

  redoNextDraw() {
    if (this.drawingNextHistory.length > 0) {
      const drawingItem = this.drawingNextHistory.pop()
      const copyItem = this.CopydrawingNextHistory.pop()
      this.drawingHistory.push(drawingItem as string)
      this.CopydrawingHistory.push(copyItem as string)
      this.clearCanvas()
      this.redrawHistory()
      this.redrawCopyHistory()
    }
  }

  clearCanvas() {
    this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.copyCtx!.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawingCtx!.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  redrawHistory() {
    let dataURL = this.drawingHistory[this.drawingHistory.length - 1]
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    if (!dataURL) {
      img.src = 'https://acceleratepic.miniso.com/images/miniso/1706583403299_touming.png'
      dataURL = img.src
    } else {
      img.src = dataURL
    }
    img.onload = () => {
      this.ctx!.drawImage(img, 0, 0, this.width, this.height)
      this.newImg.src = dataURL
    }
  }

  async redrawCopyHistory() {
    const dataURL = this.CopydrawingHistory[this.CopydrawingHistory.length - 1]
    const img = new Image()
    img.src = dataURL
    img.onload = () => {
      this.copyCtx!.drawImage(img, 0, 0)
    }
  }

  clearAll() {
    this.drawingHistory = []
    this.CopydrawingHistory = []
    this.clearCanvas()
  }

  async extraction() {
    return new Promise((resolve, reject) => {
      const dataURL = this.CopydrawingHistory[this.CopydrawingHistory.length - 1]
      if (!dataURL) {
        reject('no dataURL')
      }
      let res = ''
      const img = new Image()
      img.width = this.originImgWidth
      img.height = this.originImgHeight
      img.src = dataURL

      const newCanvas = document.createElement('canvas')
      const newContext = newCanvas.getContext('2d')
      newCanvas.width = this.originImgWidth
      newCanvas.height = this.originImgHeight
      newContext!.fillStyle = 'black'
      newContext!.fillRect(0, 0, this.originImgWidth, this.originImgHeight)
      img.onload = () => {
        newContext!.drawImage(img, 0, 0, this.originImgWidth, this.originImgHeight)
        res = newCanvas.toDataURL('image/png')
        resolve(res)
      }
    })
  }

  erase() {
    this.ctx!.globalCompositeOperation = 'destination-out' // 设置合成操作为 'destination-out'，这样就可以擦除涂抹区域了
  }

  drawAgain() {
    this.ctx!.globalCompositeOperation = 'source-over' // 设置合成操作为 'source-over'
  }
}

export default CanvasSelectArea
