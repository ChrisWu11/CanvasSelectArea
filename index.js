class CanvasSelectArea {
  constructor({ imgId }) {
    this.img = document.getElementById(imgId);

    this.lineWidth = 15;

    this.startX = 0;
    this.startY = 0;
    this.endWidth = 0;
    this.endHeight = 0;

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'canvas';

    this.width = Number(this.img.style.width.replace('px', '')) || this.img.offsetWidth;
    this.height = Number(this.img.style.height.replace('px', '')) || this.img.offsetHeight;

    this.originImgWidth = this.width;
    this.originImgHeight = this.height;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.borderRadius = '8px';

    this.showHistory = [];

    this.newImg = document.createElement('img');
    this.newImg.width = this.width;
    this.newImg.height = this.height;
    this.newImg.style.position = 'absolute';
    this.newImg.style.borderRadius = '8px';
    this.newImg.style.overflow = 'hidden';
    this.newImg.src = 'https://acceleratepic.miniso.com/images/miniso/1706583403299_touming.png';

    this.newImg.style.top = '0';
    this.newImg.style.left = '0';
    this.newImg.style.bottom = '0';
    this.newImg.style.right = '0';
    this.newImg.style.margin = 'auto';

    this.img.parentNode.insertBefore(this.newImg, this.canvas.nextSibling);

    this.ctx = this.canvas.getContext('2d');
    this.drawing = false;

    this.drawingHistory = this.createObservableArray([]);
    this.drawingNextHistory = [];

    this.path = [];

    this.bgImg = new Image();
    this.bgImg.crossOrigin = 'anonymous';
    this.bgImg.src = 'https://acceleratepic.miniso.com/images/miniso/1705297991635_Rectangle.png';
    this.copyCanvas = document.createElement('canvas');
    this.copyCanvas.width = this.width;
    this.copyCanvas.height = this.height;
    this.copyCtx = this.copyCanvas.getContext('2d');
    this.CopydrawingHistory = [];
    this.CopydrawingNextHistory = [];

    this.drawingCanvas = document.createElement('canvas');
    this.drawingCanvas.id = 'drawingCanvas';
    this.drawingCanvas.width = this.width;
    this.drawingCanvas.height = this.height;
    this.drawingCanvas.style.position = 'absolute';

    this.drawingCanvas.style.top = '0';
    this.drawingCanvas.style.left = '0';
    this.drawingCanvas.style.bottom = '0';
    this.drawingCanvas.style.right = '0';
    this.drawingCanvas.style.margin = 'auto';

    this.img.parentNode.insertBefore(this.drawingCanvas, this.img);
    this.drawingCanvas.style.zIndex = '10';
    this.drawingCtx = this.drawingCanvas.getContext('2d');

    this.boundDrawFree = this.drawFree.bind(this);
    this.boundDrawRectangle = this.drawRectangle.bind(this);
    this.boundStopDrawing = this.stopDrawing.bind(this);
    this.boundStopFreeDrawing = this.stopFreeDrawing.bind(this);

    this.drawingCanvas.addEventListener('mousedown', this.startDrawing.bind(this));

    this.drawingCanvas.addEventListener('mousemove', this.boundDrawFree);

    this.drawingCanvas.addEventListener('mouseup', this.boundStopFreeDrawing);

    this.drawModel = 'free';
  }

  createObservableArray(array) {
    return new Proxy(array, {
      set: (target, key, value) => {
        target[key] = value;
        if (key === 'length') {
          console.log('Array length has changed:', target.length);
        }
        return true;
      }
    });
  }

  getHistory() {
    return {
      drawingHistory: this.drawingHistory,
      CopydrawingHistory: this.CopydrawingHistory,
      showHistory: this.showHistory
    };
  }

  reSizeCanvas(params) {
    const { width, height } = params;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawingCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.copyCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (String(width).indexOf('px') !== -1 && String(width).indexOf('px') !== -1) {
      this.width = Number(width.replace('px', ''));
      this.height = Number(height.replace('px', ''));
    } else {
      this.width = width;
      this.height = height;
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.drawingCanvas.width = this.width;
    this.drawingCanvas.height = this.height;
    this.copyCanvas.width = this.width;
    this.copyCanvas.height = this.height;
    this.newImg.width = this.width;
    this.newImg.height = this.height;
    if (this.drawingHistory.length) {
      this.newImg.src = this.drawingHistory[this.drawingHistory.length - 1];
    } else {
      this.newImg.src = 'https://acceleratepic.miniso.com/images/miniso/1706583403299_touming.png';
    }

    this.ctx.beginPath();
    this.ctx.drawImage(this.newImg, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.closePath();

    const copyImg = new Image();
    copyImg.width = this.width;
    copyImg.height = this.height;
    if (this.CopydrawingHistory.length) {
      copyImg.src = this.CopydrawingHistory[this.CopydrawingHistory.length - 1];
    } else {
      copyImg.src = 'https://acceleratepic.miniso.com/images/miniso/1706583403299_touming.png';
    }

    copyImg.onload = () => {
      this.copyCtx.drawImage(copyImg, 0, 0, this.width, this.height);
    };
  }

  startDrawing(event) {
    this.drawing = true;
    this.ctx.beginPath();
    this.drawingCtx.beginPath();
    this.copyCtx.strokeStyle = 'transparent';
    this.ctx.strokeStyle = 'transparent';
    this.copyCtx.fillStyle = 'white';

    if (this.drawModel === 'free') {
      this.copyCtx.beginPath();
      this.drawingCtx.strokeStyle = 'transparent';
      this.copyCtx.moveTo(event.offsetX, event.offsetY);
      this.drawingCtx.moveTo(event.offsetX, event.offsetY);
    } else {
      this.drawingCtx.moveTo(event.offsetX, event.offsetY);
      this.drawingCtx.fillStyle = 'transparent';
      this.drawingCtx.strokeStyle = 'transparent';
    }
    this.ctx.moveTo(event.offsetX, event.offsetY);
    this.path.push({ x: event.offsetX, y: event.offsetY });

    this.startX = event.offsetX;
    this.startY = event.offsetY;
  }

  drawFree(event) {
    if (!this.drawing) return;
    const pattern = this.drawingCtx.createPattern(this.bgImg, 'repeat');

    this.drawingCtx.lineTo(event.offsetX, event.offsetY);
    this.drawingCtx.stroke();

    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
    if (pattern) {
      this.ctx.fillStyle = pattern;
    }

    this.copyCtx.lineTo(event.offsetX, event.offsetY);
    this.copyCtx.stroke();

    this.path.push({ x: event.offsetX, y: event.offsetY });
    if (pattern) {
      this.drawingCtx.fillStyle = pattern;
    }

    if (this.isClosedPath()) {
      this.drawingCtx.fill();
      this.ctx.fill();
      this.copyCtx.fill();
    }
  }

  async drawRectangle(event) {
    if (!this.drawing) return;

    const width = event.offsetX - this.startX;
    const height = event.offsetY - this.startY;
    this.endWidth = width;
    this.endHeight = height;

    const pattern = this.ctx.createPattern(this.bgImg, 'repeat');

    this.drawingCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawingCtx.closePath();
    this.drawingCtx.beginPath();

    this.drawingCtx.rect(this.startX, this.startY, width, height);
    this.drawingCtx.fillStyle = pattern;
    this.drawingCtx.fill();
    this.drawingCtx.stroke();
  }

  changeDrawModel(model) {
    this.drawModel = model;
    if (model === 'free') {
      this.changeMode(this.boundDrawFree, this.boundStopFreeDrawing);
    } else if (model === 'rectangle') {
      this.changeMode(this.boundDrawRectangle, this.boundStopDrawing);
    }
  }

  changeMode(drawMethod, stopMethod) {
    this.removeEventListeners();
    this.drawingCanvas.addEventListener('mousemove', drawMethod);
    this.drawingCanvas.addEventListener('mouseup', stopMethod);
  }

  removeEventListeners() {
    this.drawingCanvas.removeEventListener('mousemove', this.boundDrawFree);
    this.drawingCanvas.removeEventListener('mouseup', this.boundStopFreeDrawing);
    this.drawingCanvas.removeEventListener('mousemove', this.boundDrawRectangle);
    this.drawingCanvas.removeEventListener('mouseup', this.boundStopDrawing);
  }

  isClosedPath() {
    const lastPoint = this.path[this.path.length - 1];

    return this.path.some((point, index) => {
      if (index === this.path.length - 1) return false;
      const distance = Math.sqrt(Math.pow(lastPoint.x - point.x, 2) + Math.pow(lastPoint.y - point.y, 2));
      return distance < this.lineWidth;
    });
  }

  async stopDrawing(event) {
    if (this.drawing) {
      this.drawing = false;

      const width = event.offsetX - this.startX;
      const height = event.offsetY - this.startY;

      await this.bgImg.decode();
      const pattern = this.ctx.createPattern(this.bgImg, 'repeat');
      this.ctx.fillStyle = pattern;
      this.ctx.fillRect(this.startX, this.startY, width, height);
      this.ctx.closePath();

      this.copyCtx.beginPath();
      this.copyCtx.rect(this.startX, this.startY, width, height);
      this.copyCtx.fill();
      this.copyCtx.closePath();

      this.drawingCtx.closePath();
      this.drawingHistory.push(this.canvas.toDataURL());
      this.CopydrawingHistory.push(this.copyCanvas.toDataURL());
      this.newImg.src = this.drawingHistory[this.drawingHistory.length - 1];
      this.path = [];
    }
  }

  async stopFreeDrawing() {
    if (this.drawing) {
      this.drawing = false;

      this.drawingCtx.closePath();
      this.ctx.closePath();
      this.copyCtx.closePath();

      this.drawingHistory.splice(this.drawingHistory.length, 0, this.canvas.toDataURL());
      this.CopydrawingHistory.splice(this.CopydrawingHistory.length, 0, this.copyCanvas.toDataURL());
      this.newImg.src = this.drawingHistory[this.drawingHistory.length - 1];

      this.path = [];
    }
  }

  undoLastDraw() {
    if (this.drawingHistory.length > 0) {
      const drawingItem = this.drawingHistory.pop();
      const copyItem = this.CopydrawingHistory.pop();
      this.addNextDraw(drawingItem, copyItem);
      this.clearCanvas();
      this.redrawHistory();
      this.redrawCopyHistory();
    }
  }

  addNextDraw(drawingItem, copyItem) {
    this.drawingNextHistory.push(drawingItem);
    this.CopydrawingNextHistory.push(copyItem);
  }

  redoNextDraw() {
    if (this.drawingNextHistory.length > 0) {
      const drawingItem = this.drawingNextHistory.pop();
      const copyItem = this.CopydrawingNextHistory.pop();
      this.drawingHistory.push(drawingItem);
      this.CopydrawingHistory.push(copyItem);
      this.clearCanvas();
      this.redrawHistory();
      this.redrawCopyHistory();
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.copyCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawingCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  redrawHistory() {
    let dataURL = this.drawingHistory[this.drawingHistory.length - 1];
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    if (!dataURL) {
      img.src = 'https://acceleratepic.miniso.com/images/miniso/1706583403299_touming.png';
      dataURL = img.src;
    } else {
      img.src = dataURL;
    }
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, this.width, this.height);
      this.newImg.src = dataURL;
    };
  }

  async redrawCopyHistory() {
    const dataURL = this.CopydrawingHistory[this.CopydrawingHistory.length - 1];
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
      this.copyCtx.drawImage(img, 0, 0);
    };
  }

  clearAll() {
    this.drawingHistory = [];
    this.CopydrawingHistory = [];
    this.clearCanvas();
  }

  async extraction() {
    return new Promise((resolve, reject) => {
      const dataURL = this.CopydrawingHistory[this.CopydrawingHistory.length - 1];
      if (!dataURL) {
        reject('no dataURL');
      }
      let res = '';
      const img = new Image();
      img.width = this.originImgWidth;
      img.height = this.originImgHeight;
      img.src = dataURL;

      const newCanvas = document.createElement('canvas');
      const newContext = newCanvas.getContext('2d');
      newCanvas.width = this.originImgWidth;
      newCanvas.height = this.originImgHeight;
      newContext.fillStyle = 'black';
      newContext.fillRect(0, 0, this.originImgWidth, this.originImgHeight);
      img.onload = () => {
        newContext.drawImage(img, 0, 0, this.originImgWidth, this.originImgHeight);
        res = newCanvas.toDataURL('image/png');
        resolve(res);
      };
    });
  }

  erase() {
    this.ctx.globalCompositeOperation = 'destination-out';
  }

  drawAgain() {
    this.ctx.globalCompositeOperation = 'source-over';
  }
}

window.CanvasSelectArea = CanvasSelectArea;
