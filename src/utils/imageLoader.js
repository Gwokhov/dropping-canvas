/**
 * 图片加载
 *
 * @export
 * @param {string, Array, FileList} sourceImg 图片
 * @param {Function} onLoaded 加载完成后的回调
 */
export default function(sourceImg, onLoaded) {
  let tempImgs = []
  let imgs = []
  let succeedCounter = 0
  let errorCounter = 0

  if (typeof sourceImg === 'string') {
    tempImgs = [sourceImg]
  } else if (sourceImg instanceof FileList) {
    for (let i = 0, len = sourceImg.length; i < len; i++) {
      tempImgs.push(URL.createObjectURL(sourceImg[i]))
    }
  } else {
    tempImgs = [].concat(sourceImg)
  }

  tempImgs.forEach(url => {
    const img = new Image()
    img.onload = () => {
      succeedCounter++
      imgs.push(img)
      checkLoadFinish()
    }
    img.onerror = msg => {
      errorCounter++
      checkLoadFinish(url)
    }
    img.src = url
  })

  /**
   * 检查图片是否全部加载完成，不论是否成功
   */
  function checkLoadFinish() {
    if (!(succeedCounter + errorCounter === tempImgs.length)) {
      return
    }
    if (!onLoaded) {
      return
    }
    if (errorCounter === 0) {
      onLoaded(null, imgs)
    } else if (errorCounter === tempImgs.length){
      console.error('[Dropping Canvas]: all images failed to load.')
      return
    } else {
      onLoaded(
        `[Dropping Canvas]: ${errorCounter} images failed to load.`,
        imgs
      )
    }
  }
}
