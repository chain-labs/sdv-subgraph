import {
  PerkDeactivated as PerkDeactivatedEvent,
  PerkEligibilityUpdated as PerkEligibilityUpdatedEvent,
  PerkRegistered as PerkRegisteredEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
} from "../generated/SDVPerksRegistry/SDVPerksRegistry"
import {
  PerkDeactivated,
  PerkEligibilityUpdated,
  PerkRegistered,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
} from "../generated/schema"

export function handlePerkDeactivated(event: PerkDeactivatedEvent): void {
  let entity = new PerkDeactivated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.perkId = event.params.perkId
  entity.caller = event.params.caller

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePerkEligibilityUpdated(
  event: PerkEligibilityUpdatedEvent,
): void {
  let entity = new PerkEligibilityUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.perkId = event.params.perkId
  entity._existingEligibleTierLevels = event.params._existingEligibleTierLevels
  entity._updatedEligibleTierLevels = event.params._updatedEligibleTierLevels

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePerkRegistered(event: PerkRegisteredEvent): void {
  let entity = new PerkRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.perkId = event.params.perkId
  entity.name = event.params.name
  entity.uri = event.params.uri

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
