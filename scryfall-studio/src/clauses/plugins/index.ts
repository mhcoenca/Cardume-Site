import { registerQueryClause } from '../registry'
import { oracleTextClause } from './oracle-text'
import { oracleTagClause } from './oracle-tag'
import { reverseOracleTagClause } from './reverse-oracle-tag'
import { colorsClause } from './colors'
import { identityClause } from './identity'
import { manaValueClause } from './mana-value'
import { manaCostClause } from './mana-cost'
import { cardTypesClause } from './card-types'
import { powerClause } from './power'
import { toughnessClause } from './toughness'
import { rarityClause } from './rarity'
import { setClause } from './set'
import { priceClause } from './price'
import { legalityClause } from './legality'
import { criteriaClause } from './criteria'
import { artistClause } from './artist'
import { flavorTextClause } from './flavor-text'
import { loreFinderClause } from './lore-finder'

// Game isn't registered yet — not in this round's scope. commander-identity.ts
// is superseded by identity.ts (same `id:`/color-identity semantics) and
// stays unregistered. Re-registering it later is a two-line change.
//
// Sort and Display aren't clauses at all anymore — neither ever affected the
// query, only the result URL/display, so Sort now lives as a fixed control
// on the Results action bar (see src/lib/sortOptions.ts) and Display was
// dropped outright (unused in practice). Card Name and Printed Only are the
// same story — fixed header controls (see useQueryStore.tsx), not clauses;
// Printed Only in particular needs to apply globally regardless of which
// clauses are active, which it couldn't do as part of a removable clause.
//
// Category taxonomy: Rarity, Set, Price, Legality, and Criteria were each
// (or would have been, for Criteria) their own single-clause sidebar
// category — merged into "Collecting", since all five describe a card's
// real-world printing/availability (what edition, how rare, what it costs,
// where it's legal, promo/foil/frame attributes) rather than its rules
// identity. Type Line similarly merged into "Type & Stats" alongside
// Power/Toughness.

registerQueryClause(oracleTextClause)
registerQueryClause(oracleTagClause)
registerQueryClause(reverseOracleTagClause)
registerQueryClause(colorsClause)
registerQueryClause(identityClause)
registerQueryClause(manaValueClause)
registerQueryClause(manaCostClause)
registerQueryClause(cardTypesClause)
registerQueryClause(powerClause)
registerQueryClause(toughnessClause)
registerQueryClause(rarityClause)
registerQueryClause(setClause)
registerQueryClause(priceClause)
registerQueryClause(legalityClause)
registerQueryClause(criteriaClause)
registerQueryClause(artistClause)
registerQueryClause(flavorTextClause)
registerQueryClause(loreFinderClause)
