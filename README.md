# 超级牛逼的 Canvas 选区工具

> 支持不规则和矩形选区，自适应，上一步，下一步

> 兼容所有框架

> 导出为黑色底白色内容的蒙版

## 使用说明

### 新建实例

**在图片加载完后初始化 canvas**

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
      // 在图片加载完后初始化canvas
      this.$refs.bgImg.onload = () => {
        this.canvasSelectArea = new CanvasSelectArea({ imgId: 'bgImg' })
      }
    }
  }
</script>
```

### 切换模式

```js
// 自由选取模式
this.canvasSelectArea.changeDrawModel('free')

// 矩形选取模式
this.canvasSelectArea.changeDrawModel('rectangle')
```

### 上一步，下一步

```js
// 上一步
this.canvasSelectArea.undoLastDraw()

// 下一步
this.canvasSelectArea.redoNextDraw()
```

### 导出图片

```js
// 是一个promise，需要等待结果返回
const img = await this.canvasSelectArea.extraction()
```

### 支持自适应

```js
window.addEventListener('resize', this.handleResize)

handleResize() {
  // 获取图片的宽度和高度
  const imgWidth = this.$refs.bgImg.width
  const imgHeight = this.$refs.bgImg.height

  this.canvasSelectArea.reSizeCanvas({
    width: imgWidth,
    height: imgHeight
  })
},
```
