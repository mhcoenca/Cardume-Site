import { registerQueryClause } from '../registry'
import { oracleTextClause } from './oracle-text'
import { oracleTagClause } from './oracle-tag'

// Commander Identity, Legality, and Game are implemented in this directory
// but intentionally not registered: Scryfall's own Advanced Search already
// covers them well. This tool focuses on what it doesn't — Oracle Text and
// Oracle Tag — plus importing an existing Scryfall URL as a base query.
// Re-registering them later is a two-line change.

registerQueryClause(oracleTextClause)
registerQueryClause(oracleTagClause)
