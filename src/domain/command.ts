export type CommandType =
  | 'SWAP'
  | 'REVERSE'
  | 'ROTATE'
  | 'MOVE'

export type SwapCommand = {
  readonly type: 'SWAP'
  readonly a: number
  readonly b: number
}

export type ReverseCommand = {
  readonly type: 'REVERSE'
  readonly l: number
  readonly r: number
}

export type RotateCommand = {
  readonly type: 'ROTATE'
  readonly l: number
  readonly r: number
  readonly k: number
}

export type MoveCommand = {
  readonly type: 'MOVE'
  readonly a: number
  readonly b: number
}

export type Command =
  | SwapCommand
  | ReverseCommand
  | RotateCommand
  | MoveCommand