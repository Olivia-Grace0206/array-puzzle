import './Tile.css'
import { TILE_COLORS } from './tileColors'

type TileProps = {
  value: string
  index: number
  isMatched?: boolean
  isPreviewChanged?: boolean
}

export function Tile({
  value,
  index,
  isMatched = false,
  isPreviewChanged = false,
}: TileProps) {
  const backgroundColor = TILE_COLORS[value] ?? '#dddddd'

  return (
    <div className="tile-wrapper">
      <div className="tile-index">{index}</div>

      <div
        className={[
          'tile',
          isMatched ? 'tile-matched' : '',
          isPreviewChanged ? 'tile-preview-changed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ backgroundColor }}
      >
        {value}
      </div>
    </div>
  )
}