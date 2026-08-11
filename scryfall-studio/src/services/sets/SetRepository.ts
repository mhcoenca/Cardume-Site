import type { ScryfallSet } from './types'

export class SetRepository {
  private readonly all: ScryfallSet[]
  private readonly byCode = new Map<string, ScryfallSet>()

  constructor(sets: ScryfallSet[]) {
    this.all = sets
    for (const set of sets) this.byCode.set(set.code.toLowerCase(), set)
  }

  list(): ScryfallSet[] {
    return this.all
  }

  getByCode(code: string): ScryfallSet | undefined {
    return this.byCode.get(code.toLowerCase())
  }
}
