import { registerQueryClause } from '../registry'
import { oracleTextClause } from './oracle-text'
import { oracleTagClause } from './oracle-tag'
import { colorsClause } from './colors'
import { identityClause } from './identity'
import { manaValueClause } from './mana-value'
import { manaCostClause } from './mana-cost'
import { cardTypesClause } from './card-types'
import { powerClause } from './power'
import { toughnessClause } from './toughness'
import { commanderLegalClause } from './commander-legal'
import { sortClause } from './sort'
import { displayClause } from './display'

// Legality (generic multi-format dropdown) and Game aren't registered yet —
// not in this round's scope. commander-identity.ts is superseded by
// identity.ts (same `id:`/color-identity semantics) and stays unregistered
// too. Re-registering any of them later is a two-line change.

registerQueryClause(oracleTextClause)
registerQueryClause(oracleTagClause)
registerQueryClause(colorsClause)
registerQueryClause(identityClause)
registerQueryClause(manaValueClause)
registerQueryClause(manaCostClause)
registerQueryClause(cardTypesClause)
registerQueryClause(powerClause)
registerQueryClause(toughnessClause)
registerQueryClause(commanderLegalClause)
registerQueryClause(sortClause)
registerQueryClause(displayClause)
