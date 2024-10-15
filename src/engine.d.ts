declare module 'engine' {
  type Entity = new (...args: any[]) => {};

  interface EngineConfig {
    fixedUpdate: number;
  }

  type SignalNames = 'game-start' | 'game-stop' | 'game-pause' | (string & {});

  class Signals<T = SignalNames> {
    on(name: T, callback: (...args: any[]) => any): void;
    off(name: T, callback: (...args: any[]) => any): void;
    emit(name: T, ...args: any[]): void;
  }

  class Query {
    list: Record<string, Entity[]>;

    constructor(components: string[]);

    destroy(): void;
    init(components: string[]): void;
    ySort(target: Entity): void;
    get<T = Entity>(name: string): T[]
    add(entity: Entity): void;
    del(entity: Entity): void;
    addTo(componentName: string, entity: Entity): void;
    delFrom(componentName: string, entity: Entity): void;
  }

  class World {
    Entities: Entity[];
    FixSystems: Function[];
    FixSubSystems: Function[];
    FixPostSystems: Function[];
    Systems: Function[];
    SubSystems: Function[];
    PostSystems: Function[];
    Query: Query;
    Components: Record<string, BaseClass>;
    t: number;

    constructor(components: Record<string, BaseClass>, queries: string[]);

    init(): void;
    addFixSystem(system: (engine: Engine, entities: Entity[], delta: number) => any): void;
    addFixSubSystem(system: Function): void;
    addFixPostSystem(system: Function): void;
    addPostSystem(system: Function): void;
    addSubSystem(system: Function): void;
    addSystem(system: (engine: Engine, entities: Entity[], delta: number) => any): void;
    addEntity<T>(components: T): T;
    delEntity(entity: any): void;
    addComponentEntity(entity: Entity, componentName: string, component: any): void;
    delComponentEntity(entity: Entity, componentName: string): void;
  }

  class Engine {
    World: World;
    Signal: Signals;

    private stopped: boolean;
    private paused: boolean;

    constructor(
      config: EngineConfig,
      components: Record<string, BaseClass>,
      queries: string[]
    );

    addModule(name: string, module: any): void;
    start(): void;
    stop(): void;
    pause(): void;
    unpause(): void;
  }

  export type { EngineConfig }
  export default Engine
}
