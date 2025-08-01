'use client'

import { useEffect, useRef } from 'react'
import { BlockDefinition, BlockModel, Identifier, ItemModel, ItemRendererResources, jsonToNbt, NbtTag, Resources, Structure, StructureRenderer, TextureAtlas, upperPowerOfTwo } from 'deepslate'
import { mat4 } from 'gl-matrix'
import { InteractiveCanvas } from './InteractiveCanvas'

export default function StructureViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const render = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const gl = canvas.getContext('webgl')
      if (!gl) {
        console.error('WebGL not supported')
        return
      }


      const structure = new Structure([3, 3, 2])
      structure.addBlock([1, 2, 0], 'minecraft:pink_terracotta')
      structure.addBlock([1, 0, 0], 'minecraft:white_terracotta')
      structure.addBlock([1, 1, 0], 'minecraft:white_terracotta')
      structure.addBlock([2, 0, 0], 'minecraft:white_terracotta')
      structure.addBlock([0, 0, 0], 'minecraft:white_terracotta')

      const size = structure.getSize() // [width, height, depth]


      /* structure.addBlock([2, 0, 0], 'minecraft:stone')
      structure.addBlock([1, 1, 0], 'minecraft:skeleton_skull', { rotation: '15' })
      structure.addBlock([2, 1, 0], 'minecraft:acacia_fence', { waterlogged: 'true', north: 'true' })
      structure.addBlock([0, 0, 0], 'minecraft:wall_torch', { facing: 'west' })
      structure.addBlock([1, 0, 1], 'minecraft:oak_trapdoor', { facing: 'south', half: 'bottom', open: 'true', powered: 'false', waterlogged: 'false' }) */

      const MCMETA = 'https://raw.githubusercontent.com/misode/mcmeta/'

      Promise.all([
        fetch(`${MCMETA}registries/item/data.min.json`).then(r => r.json()),
        fetch(`${MCMETA}summary/assets/block_definition/data.min.json`).then(r => r.json()),
        fetch(`${MCMETA}summary/assets/model/data.min.json`).then(r => r.json()),
        fetch(`${MCMETA}summary/assets/item_definition/data.min.json`).then(r => r.json()),
        fetch(`${MCMETA}summary/item_components/data.min.json`).then(r => r.json()),
        fetch(`${MCMETA}atlas/all/data.min.json`).then(r => r.json()),
        new Promise<HTMLImageElement>(res => {
          const image = new Image()
          image.onload = () => res(image)
          image.crossOrigin = 'Anonymous'
          image.src = `${MCMETA}atlas/all/atlas.png`
        }),
      ]).then(([items, blockstates, models, item_models, item_components, uvMap, atlas]) => {

        const itemList = document.createElement('datalist')
        itemList.id = 'item-list'
        items.forEach((item: string) => {
          const option = document.createElement('option')
          option.textContent = item
          itemList.append(option)
        })

        document.getElementById('item-input')?.after(itemList)

        const blockDefinitions: Record<string, BlockDefinition> = {}
        Object.keys(blockstates).forEach(id => {
          blockDefinitions['minecraft:' + id] = BlockDefinition.fromJson(blockstates[id])
        })

        const blockModels: Record<string, BlockModel> = {}
        Object.keys(models).forEach(id => {
          blockModels['minecraft:' + id] = BlockModel.fromJson(models[id])
        })
        Object.values(blockModels).forEach((m: BlockModel) =>
          m.flatten({
            getBlockModel: (id: Identifier) => blockModels[id.toString()] ?? null
          })
        )


        const itemModels: Record<string, ItemModel> = {}
        Object.keys(item_models).forEach(id => {
          itemModels['minecraft:' + id] = ItemModel.fromJson(item_models[id].model)
        })

        const itemComponents: Record<string, Map<string, NbtTag>> = {}
        Object.keys(item_components).forEach(id => {
          const components = new Map<string, NbtTag>()
          Object.keys(item_components[id]).forEach(c_id => {
            components.set(c_id, jsonToNbt(item_components[id][c_id]))
          })
          itemComponents['minecraft:' + id] = components
        })

        const atlasCanvas = document.createElement('canvas')
        const atlasSize = upperPowerOfTwo(Math.max(atlas.width, atlas.height))
        atlasCanvas.width = atlasSize
        atlasCanvas.height = atlasSize
        const atlasCtx = atlasCanvas.getContext('2d')!
        atlasCtx.drawImage(atlas, 0, 0)
        const atlasData = atlasCtx.getImageData(0, 0, atlasSize, atlasSize)
        const idMap: Record<string, [number, number, number, number]> = {}
        Object.keys(uvMap).forEach(id => {
          const [u, v, du, dv] = uvMap[id]
          const dv2 = (du !== dv && id.startsWith('block/')) ? du : dv
          idMap[Identifier.create(id).toString()] = [u / atlasSize, v / atlasSize, (u + du) / atlasSize, (v + dv2) / atlasSize]
        })
        const textureAtlas = new TextureAtlas(atlasData, idMap)
        const resources: Resources & ItemRendererResources = {
          getBlockDefinition(id) { return blockDefinitions[id.toString()] },
          getBlockModel(id) { return blockModels[id.toString()] },
          getTextureUV(id) { return textureAtlas.getTextureUV(id) },
          getTextureAtlas() { return textureAtlas.getTextureAtlas() },
          getPixelSize() { return textureAtlas.getPixelSize() },
          getBlockFlags(id) { return { opaque: false } },
          getBlockProperties(id) { return null },
          getDefaultBlockProperties(id) { return null },
          getItemModel(id) { return itemModels[id.toString()] },
          getItemComponents(id) { return itemComponents[id.toString()] },
        }



        const renderer = new StructureRenderer(gl, structure, resources)

        /* const view = mat4.create()
        mat4.translate(view, view, [0, 0, -5])
        renderer.drawStructure(view) */

        const center: [number, number, number] = [
          size[0] / 2,
          size[1] / 2,
          size[2] / 2,
        ]


        new InteractiveCanvas(canvas, view => {
          renderer.drawStructure(view)
        }, center)

      })


    }

    render()
  }, [])

  return <canvas ref={canvasRef} width={1000} height={800} className='bg-amber-500' />
}
