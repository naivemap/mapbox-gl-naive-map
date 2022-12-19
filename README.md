# mapbox-gl-ex-map

Extended Map of `mapboxgl.Map`.

[API Reference](./docs/index.md)

## 安装

```bash
npm i mapbox-gl @naivemap/mapbox-gl-ex-map
```

## 使用

```js
import ExMap from '@naivemap/mapbox-gl-ex-map'
import 'mapbox-gl/dist/mapbox-gl.css'

const map = new ExMap({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-74.5, 40],
  zoom: 9
})

map.on('load', () => {
  map.addGroupLayer('', {
    sources: {
      maine: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-67.13734, 45.13745],
                [-66.96466, 44.8097],
                [-68.03252, 44.3252],
                [-69.06, 43.98],
                [-70.11617, 43.68405],
                [-70.64573, 43.09008],
                [-70.75102, 43.08003],
                [-70.79761, 43.21973],
                [-70.98176, 43.36789],
                [-70.94416, 43.46633],
                [-71.08482, 45.30524],
                [-70.66002, 45.46022],
                [-70.30495, 45.91479],
                [-70.00014, 46.69317],
                [-69.23708, 47.44777],
                [-68.90478, 47.18479],
                [-68.2343, 47.35462],
                [-67.79035, 47.06624],
                [-67.79141, 45.70258],
                [-67.13734, 45.13745]
              ]
            ]
          }
        }
      }
    },
    layers: [
      {
        id: 'maine',
        type: 'fill',
        source: 'maine',
        layout: {},
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.5
        }
      },
      {
        id: 'outline',
        type: 'line',
        source: 'maine',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 3
        }
      }
    ]
  })
})
```

## UMD

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css" rel="stylesheet" />
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@naivemap/mapbox-gl-ex-map"></script>
  </head>
  <body>
    <div id="map" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"></div>
    <script>
      mapboxgl.accessToken = ''

      const map = new ExMap({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.5, 40],
        zoom: 9
      })
    </script>
  </body>
</html>
```
