import { assertNotNull } from "@subsquid/evm-processor";
import { Entity, EntityClass, Store } from "@subsquid/typeorm-store";
import chunk from "lodash/chunk.js";
import { In } from "typeorm";

export class EntityManager {
  private deferredIds = new Map<EntityClass<Entity>, Set<string>>();
  private cache = new Map<EntityClass<any>, Map<string, any>>();

  constructor(private store: Store) {}

  defer<T extends Entity>(entity: EntityClass<T>, ...ids: string[]) {
    let set = this.deferredIds.get(entity);
    if (set == null) {
      set = new Set();
      this.deferredIds.set(entity, set);
    }

    const cache = this.getCache(entity);
    for (const id of ids) {
      if (!cache.has(id)) set.add(id);
    }

    return this;
  }

  async load<T extends Entity>(entity: EntityClass<T>) {
    const fetched = new Map<string, T>();

    const cache = this.getCache(entity);

    const ids = this.deferredIds.get(entity);
    if (!ids || ids.size == 0) return fetched;

    for (const idBatch of chunk([...ids], 1000))
      await this.store.findBy(entity, { id: In(idBatch) } as any).then((es) =>
        es.forEach((e) => {
          cache.set(e.id, e);
          fetched.set(e.id, e);
        })
      );

    ids.clear();

    return fetched;
  }

  hasData() {
    return this.cache.size > 0;
  }

  has<T extends Entity>(entity: EntityClass<T>, id: string): boolean {
    const cache = this.getCache(entity);
    return cache.has(id);
  }

  get<T extends Entity>(entity: EntityClass<T>, id: string): Promise<T | undefined>;
  get<T extends Entity>(entity: EntityClass<T>, id: string, search: false): T | undefined;
  get<T extends Entity>(entity: EntityClass<T>, id: string, search = true): Promise<T | undefined> | (T | undefined) {
    const cache = this.getCache(entity);
    const value = cache.get(id);
    if (search) {
      return value != null
        ? new Promise((resolve) => resolve(value))
        : this.store.get(entity, id).then((e) => {
            if (e) cache.set(e.id, e);
            return e;
          });
    }

    return value;
  }

  getOrFail<T extends Entity>(entity: EntityClass<T>, id: string): Promise<T>;
  getOrFail<T extends Entity>(entity: EntityClass<T>, id: string, search: false): T;
  getOrFail<T extends Entity>(entity: EntityClass<T>, id: string, search = true): Promise<T> | T {
    if (search) {
      return this.get(entity, id).then((e) => assertNotNull(e));
    }

    return assertNotNull(this.get(entity, id, search));
  }

  add<T extends Entity>(entity: T) {
    this.getCache(entity.constructor as EntityClass<T>).set(entity.id, entity);
    return this;
  }

  // update<T extends Entity>(entity: T) {
  //   if (!entity.id) {
  //     throw new Error('Entity does not have an id.');
  //   }

  //   const cache = this.getCache(entity.constructor as EntityClass<T>);
  //   const value = cache.get(entity.id);

  //   cache.set(entity.id, value ? Object.assign(value, entity) : entity);

  //   return this;
  // }

  values<T extends Entity>(entity: EntityClass<T>): T[] {
    return [...this.getCache(entity).values()];
  }

  private getCache<T extends Entity>(entity: EntityClass<T>) {
    let value = this.cache.get(entity);
    if (value == null) {
      value = new Map();
      this.cache.set(entity, value);
    }

    return value;
  }
}
