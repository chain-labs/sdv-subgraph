import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  PerkDeactivated,
  PerkEligibilityUpdated,
  PerkRegistered,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/SDVPerksRegistry/SDVPerksRegistry"

export function createPerkDeactivatedEvent(
  perkId: BigInt,
  caller: Address
): PerkDeactivated {
  let perkDeactivatedEvent = changetype<PerkDeactivated>(newMockEvent())

  perkDeactivatedEvent.parameters = new Array()

  perkDeactivatedEvent.parameters.push(
    new ethereum.EventParam("perkId", ethereum.Value.fromUnsignedBigInt(perkId))
  )
  perkDeactivatedEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  )

  return perkDeactivatedEvent
}

export function createPerkEligibilityUpdatedEvent(
  perkId: BigInt,
  _existingEligibleTierLevels: Array<BigInt>,
  _updatedEligibleTierLevels: Array<BigInt>
): PerkEligibilityUpdated {
  let perkEligibilityUpdatedEvent = changetype<PerkEligibilityUpdated>(
    newMockEvent()
  )

  perkEligibilityUpdatedEvent.parameters = new Array()

  perkEligibilityUpdatedEvent.parameters.push(
    new ethereum.EventParam("perkId", ethereum.Value.fromUnsignedBigInt(perkId))
  )
  perkEligibilityUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_existingEligibleTierLevels",
      ethereum.Value.fromUnsignedBigIntArray(_existingEligibleTierLevels)
    )
  )
  perkEligibilityUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_updatedEligibleTierLevels",
      ethereum.Value.fromUnsignedBigIntArray(_updatedEligibleTierLevels)
    )
  )

  return perkEligibilityUpdatedEvent
}

export function createPerkRegisteredEvent(
  perkId: BigInt,
  name: string,
  uri: string
): PerkRegistered {
  let perkRegisteredEvent = changetype<PerkRegistered>(newMockEvent())

  perkRegisteredEvent.parameters = new Array()

  perkRegisteredEvent.parameters.push(
    new ethereum.EventParam("perkId", ethereum.Value.fromUnsignedBigInt(perkId))
  )
  perkRegisteredEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  perkRegisteredEvent.parameters.push(
    new ethereum.EventParam("uri", ethereum.Value.fromString(uri))
  )

  return perkRegisteredEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}
