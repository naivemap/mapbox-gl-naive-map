const ExMap = require('../src/')

function createMap(options, callback) {
  const container = document.createElement('div')
  const defaultOptions = {
    container,
    interactive: false,
    attributionControl: false,
    trackResize: true,
    testMode: true,
    style: {
      version: 8,
      sources: {},
      layers: []
    }
  }

  Object.defineProperty(container, 'getBoundingClientRect', {
    value: () => ({ height: 200, width: 200 }),
    configurable: true
  })

  if (options && options.deleteStyle) delete defaultOptions.style

  const map = new ExMap.default(Object.assign({}, defaultOptions, options))
  if (callback)
    map.on('load', () => {
      callback(null, map)
    })

  return map
}

describe('test', () => {
  test('constructor', (t) => {
    const map = createMap()
    t.ok(map.getContainer())
    t.equal(map.getStyle(), undefined)
    t.ok(map.boxZoom.isEnabled())
    t.ok(map.doubleClickZoom.isEnabled())
    t.ok(map.dragPan.isEnabled())
    t.ok(map.dragRotate.isEnabled())
    t.ok(map.keyboard.isEnabled())
    t.ok(map.scrollZoom.isEnabled())
    t.ok(map.touchZoomRotate.isEnabled())
    t.notok(map._language)
    t.notok(map._worldview)
    t.throws(
      () => {
        new Map({
          container: 'anElementIdWhichDoesNotExistInTheDocument',
          testMode: true
        })
      },
      new Error("Container 'anElementIdWhichDoesNotExistInTheDocument' not found"),
      'throws on invalid map container id'
    )
    t.end()
  })
})
