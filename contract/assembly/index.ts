import { PersistentMap, PersistentSet, env, storage, logging, Context, ContractPromiseBatch, base58, u128 } from 'near-sdk-as'

const registry = new PersistentMap<string, string>('r')
const schemas = new PersistentSet<string>('s')
const definitions = new PersistentSet<string>('d')
const aliases = new PersistentSet<string>('a')

const allAliases = new PersistentMap<string, string>('l')

//DID REGISTRY
/**
* Returns the app owner which we use in multiple places to confirm user can override/update definitions 
* @param owner 
*/
function _isOwner(): boolean {
  let owner = storage.getSome<string>("owner")
  return owner == Context.predecessor
}

export function getDID(accountId: string) : string {
  assert(env.isValidAccountID(accountId), 'not a valid near account')
  assert(registry.contains(accountId), 'no did registered for this near account')
  return registry.getSome(accountId)
}

export function hasDID(accountId: string) : bool {
  if(registry.contains(accountId)){
    return true
  } else {
    return false
  }
}

export function putDID(accountId: string, did: string): bool {
  assert(Context.sender == Context.predecessor, 'only account owner can register or change a DID for it')
  assert(env.isValidAccountID(accountId), 'not a valid near account')
  registry.set(accountId, did)
  return true
}

// NEW ALIAS TRACKING
export function retrieveAlias(alias: string) : string {
  assert(allAliases.contains(alias), 'alias does not exist')
  return allAliases.getSome(alias)
}

export function hasAlias(alias: string) : bool {
  if(allAliases.contains(alias)){
    return true
  } else {
    return false
  }
}

export function storeAlias(alias: string, definition: string): bool {
  assert(!allAliases.contains(alias), 'alias already exists')
  allAliases.set(alias, definition)
  logging.log('registered alias' + alias + ':' + definition)
  return true
}

export function changeDefinition(alias: string, definition: string): bool {
  storage.set<string>('owner', 'vitalpointai.testnet')
  assert(_isOwner(), 'not the owner')
  allAliases.set(alias, definition)
  logging.log('updated alias' + alias + ':' + definition)
  return true
}

export function initialize(): void {
  let promise = ContractPromiseBatch.create(Context.contractName)
  .add_access_key(
    base58.decode(Context.senderPublicKey),
    new u128(250),
    Context.contractName,
    ['storeAlias', 'putDID'],
    0)
  storage.set<bool>('done', true)
}

export function getInitialize(): bool {
  if (storage.contains('done')) {
    if(storage.getSome<bool>('done') == true ) {
      return true
    } else {
      return false
    }
  }
  return false
}

// Schemas
export function getSchemas(): Array<string> {
  return schemas.values()
}

export function findSchema(schema: string): bool {
  return schemas.has(schema)
}

export function addSchema(schema: string): bool {
  schemas.add(schema)
  return true
}

// Aliases
export function getAliases(): Array<string> {
  return aliases.values()
}

export function findAlias(alias: string): bool {
  return aliases.has(alias)
}

export function addAlias(alias: string): bool {
  aliases.add(alias)
  return true
}

// Definitions
export function getDefinitions(): Array<string> {
  return definitions.values()
}

export function findDefinition(def: string): bool {
  return definitions.has(def)
}

export function addDefinition(def: string): bool {
  definitions.add(def)
  return true
}


