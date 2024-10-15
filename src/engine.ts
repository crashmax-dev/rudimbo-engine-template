import Engine, { type EngineConfig } from 'engine'

class Position {
  x: number
  y: number

  constructor(params: { x?: number; y?: number }) {
    this.x = params.x ?? 0
    this.y = params.y ?? 0
  }
}

class Player {
  name: string

  constructor(params: { name?: string }) {
    this.name = params.name ?? ''
  }
}

const config: EngineConfig = {
  fixedUpdate: 1000
}

const components = {
  position: Position,
  player: Player,
}

const queries = [
  'position',
  'player.position'
]

const Game = new Engine(config, components, queries)

const player = Game.World.addEntity({
  player: {
    name: 'guest'
  },
  position: {
    x: 0,
    y: 0,
  }
})

console.log('Player:', player)

function systemDraw(Core: Engine) {
  const entities = Core.World.Query.get<{ position: Position }>('position')

  for (let index = 0; index < entities.length; index++) {
    const entity = entities[index];
    entity.position.x += 1;

    if (entity.position.x > 10) {
      Core.World.delEntity(entity);
    };

    console.log('Entity position:', entity);
  };
}

Game.World.addSystem(systemDraw);
Game.Signal.on('game-start', () => console.log('Signal: game-start'))
Game.start();
