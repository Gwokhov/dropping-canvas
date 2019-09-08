export function randomRange(min, max) {
  const diff = max - min
  return min + diff * Math.random()
}

/**
 * 随机选择数组元素
 *
 * @export
 * @param {Array} array 被挑选数组
 * @returns
 */
export function randomPick(array) {
  const min = 0
  const max = array.length
  const pickedIndex = Math.floor(randomRange(min, max))
  return array[pickedIndex]
}

export function samplePoisson(rate) {
  var L, k, p, u
  L = Math.exp(-rate)
  k = 0
  p = 1
  do {
    k += 1
    u = Math.random()
    p *= u
  } while (p > L)
  return k - 1
}
