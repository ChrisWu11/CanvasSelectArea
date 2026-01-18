# Canvas Selection Tool

> Supports irregular and rectangular selections, adaptive resizing, undo, and redo.

> Compatible with all frameworks.

> Export a mask with a black background and white content.

## Usage

### Create an instance

**Initialize the canvas after the image finishes loading.**

```vue
<template>
  <div>
    <img ref="bgImg" class="img" id="bgImg" :src="imgSrc" />
  </div>
</template>

<script>
import { CanvasSelectArea } from 'xxxxx'
  export default {
    mounted: {
      // Initialize the canvas after the image finishes loading
      this.$refs.bgImg.onload = () => {
        this.canvasSelectArea = new CanvasSelectArea({ imgId: 'bgImg' })
      }
    }
  }
</script>
```

### Switch modes

```js
// Free selection mode
this.canvasSelectArea.changeDrawModel('free')

// Rectangular selection mode
this.canvasSelectArea.changeDrawModel('rectangle')
```

### Undo and redo

```js
// Undo
this.canvasSelectArea.undoLastDraw()

// Redo
this.canvasSelectArea.redoNextDraw()
```

### Export image

```js
// Returns a promise; wait for the result
const img = await this.canvasSelectArea.extraction()
```

### Adaptive resizing

```js
window.addEventListener('resize', this.handleResize)

handleResize() {
  // Get the image width and height
  const imgWidth = this.$refs.bgImg.width
  const imgHeight = this.$refs.bgImg.height

  this.canvasSelectArea.reSizeCanvas({
    width: imgWidth,
    height: imgHeight
  })
},
```
