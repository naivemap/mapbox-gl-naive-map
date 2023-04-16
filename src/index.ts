import mapboxgl from 'mapbox-gl'

/**
 * 图层组
 * @public
 */
export interface GroupLayer {
  sources?: mapboxgl.Sources
  layers: mapboxgl.Layer[]
  bounds?: mapboxgl.LngLatBoundsLike
  fitBoundsOptions?: mapboxgl.FitBoundsOptions
  flyToOptions?: mapboxgl.FlyToOptions
}

/**
 * 图层元数据
 * @public
 */
export interface LayerMetaData {
  /**
   * 已有图层组的 id 或 图层的 id（优先判断为图层组 id），添加该属性后，当前图层会添加到指定图层之前，
   */
  before?: string | string[]
  /**
   * 鼠标样式，添加该属性后，鼠标移入要素时鼠标样式会变成指定的样式
   */
  cursor?: CSSStyleDeclaration['cursor']
  /**
   * 其他任意属性
   */
  [key: string]: any
}

/**
 * Mapbox 地图扩展
 * @public
 */
export default class NaiveMap extends mapboxgl.Map {
  private _groupLayers: Map<string, GroupLayer> = new Map()

  /**
   * @param options - 地图配置 https://docs.mapbox.com/mapbox-gl-js/api/map/
   */
  constructor(options: mapboxgl.MapboxOptions) {
    super(options)
  }

  /**
   * 获取图层组
   * @param id - 图层组 id
   */
  getGroupLayer(id: string): GroupLayer | undefined {
    return this._groupLayers.get(id)
  }

  /**
   * 添加图层组
   * @param id - 图层组 id
   * @param groupLayer - 图层组
   */
  addGroupLayer(id: string, groupLayer: GroupLayer) {
    if (this.getGroupLayer(id)) {
      throw new Error(`The groupLayer '${id}' has already existed.`)
    }
    const {
      sources = {},
      layers = [],
      bounds,
      fitBoundsOptions = {
        padding: { top: 20, bottom: 20, left: 20, right: 20 }
      },
      flyToOptions
    } = groupLayer

    // 添加数据源
    for (const sourceId in sources) {
      if (Object.prototype.hasOwnProperty.call(sources, sourceId)) {
        if (!this.getSource(sourceId)) {
          this.addSource(sourceId, sources[sourceId])
        } else {
          console.warn(`The source '${sourceId}' has already existed.`)
        }
      }
    }
    // 添加图层
    for (const layer of layers) {
      if (!this.getLayer(layer.id)) {
        const metadata = (layer.metadata || {}) as LayerMetaData
        // beforeId
        const beforeId = !!metadata.before
          ? this._getBeforeLayerId(layer.id, metadata.before)
          : undefined

        // 给图层添加类型
        layer.metadata = {
          ...metadata,
          grouplayer: id
        }
        // 添加图层
        this.addLayer(layer as mapboxgl.AnyLayer, beforeId)
        // 设置鼠标样式
        this._setLayerCursor(layer)
      } else {
        throw new Error(`The layer '${layer.id}' has already existed.`)
      }
    }
    if (bounds) {
      this.fitBounds(bounds, fitBoundsOptions)
    } else if (flyToOptions) {
      this.flyTo(flyToOptions)
    }
    this._groupLayers.set(id, groupLayer)
    return this
  }

  /**
   * 删除图层组
   * @param id - 图层组 id
   * @param deleteSources - 是否删除数据源
   */
  public removeGroupLayer(id: string, deleteSources = true) {
    const groupLayer = this.getGroupLayer(id)
    if (groupLayer) {
      const { sources = {}, layers = [] } = groupLayer
      // 删除图层
      for (const layer of layers) {
        const layerId = layer.id
        this.getLayer(layerId) && this.removeLayer(layerId)

        if (layer['source'] && 'object' === typeof layer['source']) {
          // 如果图层的数据源是对象，map会自动添加{图层id}数据源
          if (deleteSources) {
            this.getSource(layerId) && this.removeSource(layerId)
          }
        }
      }
      // 删除数据源
      if (deleteSources) {
        Object.keys(sources).map((sourceId) => {
          this.getSource(sourceId) && this.removeSource(sourceId)
        })
      }
      this._groupLayers.delete(id)
    }
    return this
  }

  /**
   * 删除所有图层组
   * @param deleteSources - 是否删除数据源
   */
  public removeGroupLayers(deleteSources = true) {
    this._groupLayers.forEach((groupLayer, key) => {
      this.removeGroupLayer(key, deleteSources)
    })
    return this
  }

  /**
   * 设置底图样式
   * @param style - 样式
   * @param restoreGroupLayers - 恢复图层组
   * @param styleOptions - 样式配置
   */
  public setBasemapStyle(
    style: mapboxgl.Style | string,
    restoreGroupLayers = true,
    styleOptions?: { diff?: boolean; localIdeographFontFamily?: string }
  ) {
    this.setStyle(style, styleOptions)
    const tempGroupLayers = restoreGroupLayers ? new Map(this._groupLayers) : undefined
    this._groupLayers.clear()
    if (tempGroupLayers) {
      this.once('styledata', () => {
        tempGroupLayers.forEach((groupLayer, key) => {
          this.addGroupLayer(key, groupLayer)
        })
      })
    }
  }

  private _getBeforeLayerIdByString(before: string) {
    // 先判断是否为图层组
    const groupLayer = this.getGroupLayer(before)

    if (groupLayer && groupLayer.layers.length > 0) {
      return groupLayer.layers[0].id
    }

    // 不是图层组，判断是否存在图层，存在直接返回，不存在返回 undefined
    return !!this.getLayer(before) ? before : undefined
  }

  private _getBeforeLayerId(layerId: string, before: string | string[]) {
    let beforeId = undefined
    if (typeof before === 'string') {
      beforeId = this._getBeforeLayerIdByString(before)
    } else if (Array.isArray(before)) {
      for (const item of before) {
        beforeId = this._getBeforeLayerIdByString(item)
        if (beforeId) {
          break
        }
      }
    }
    if (!beforeId) {
      console.warn(
        `Layer with id "${before}" does not exist on this map. The layer with id "${layerId}" will be appended to the end of the layers array and appear visually above all other layers.`
      )
    }
    return beforeId
  }

  private _setLayerCursor(layer: mapboxgl.Layer) {
    const metadata = (layer.metadata || {}) as LayerMetaData
    const layerId = layer.id

    if (metadata && metadata.cursor) {
      this.on('mouseenter', layerId, () => {
        this.getCanvas().style.cursor = metadata.cursor as string
      })
      this.on('mouseleave', layerId, () => {
        this.getCanvas().style.cursor = ''
      })
    }
  }
}
