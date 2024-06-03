import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  PerkDeactivated as PerkDeactivatedEvent,
  PerkReactivated as PerkReactivatedEvent,
  PerkEligibilityUpdated as PerkEligibilityUpdatedEvent,
  PerkRegistered as PerkRegisteredEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  PerkUriUpdated as PerkUriUpdatedEvent
} from "../generated/SDVPerksRegistry/SDVPerksRegistry"
import {
  PerksRegistry as PerksRegistryEntity,
  Perk as PerkEntity
} from "../generated/schema"
import {
  SDVPerksRegistry as PerksRegistryContract
} from "../generated/SDVPerksRegistry/SDVPerksRegistry";
import {
  generatePerkId,
  generatePerkRegistryId
} from "./utils";
import { log } from "matchstick-as";
import { generateMembershipContractId } from "./utils";

export function handlePerkDeactivated(event: PerkDeactivatedEvent): void {
  const perkIdFromEvent = event.params.perkId;
  const perkId = generatePerkId(perkIdFromEvent);
  let perkEntity =  PerkEntity.load(perkId);
  if(perkEntity == null) {
    log.error("Perk entity {}, not created correctly", [perkId]);
    return;
  }
  perkEntity.isPerkActive = false;
  perkEntity.lastUpdateTrxHash = event.transaction.hash;
  perkEntity.lastUpdatedOn = event.block.timestamp;
  perkEntity.save();
}

export function handlePerkReactivated(event: PerkReactivatedEvent): void {
  const perkIdFromEvent = event.params.perkId;
  const perkId = generatePerkId(perkIdFromEvent);
  let perkEntity =  PerkEntity.load(perkId);
  if(perkEntity == null) {
    log.error("Perk entity {}, not created correctly", [perkId]);
    return;
  }
  perkEntity.isPerkActive = true;
  perkEntity.lastUpdateTrxHash = event.transaction.hash;
  perkEntity.lastUpdatedOn = event.block.timestamp;
  perkEntity.save();
}

export function handlePerkEligibilityUpdated(
  event: PerkEligibilityUpdatedEvent,
): void {
  const perkId = generatePerkId(event.params.perkId);
  const entity = PerkEntity.load(perkId);
  if(entity == null) {
    log.error("Perk {}, not created properly.", [perkId]);
    return;
  }
  entity.eligiblePerksForTier = event.params._updatedEligibleTierLevels;
  entity.lastUpdatedOn = event.block.timestamp;
  entity.lastUpdateTrxHash = event.transaction.hash;

  entity.save()
}

export function handlePerkUriUpdated(event: PerkUriUpdatedEvent): void {
  const perkIdFromEvent = event.params.perkId;
  const perkId = generatePerkId(perkIdFromEvent);
  let perkEntity =  PerkEntity.load(perkId);
  if(perkEntity == null) {
    log.error("Perk entity {}, not created correctly", [perkId]);
    return;
  }
  perkEntity.perkUri = event.params.newUri;
  perkEntity.lastUpdateTrxHash = event.transaction.hash;
  perkEntity.lastUpdatedOn = event.block.timestamp;
  perkEntity.save();
}

export function handlePerkRegistered(event: PerkRegisteredEvent): void {
  const perkId = generatePerkId(event.params.perkId);
  const perkRegistryId = generatePerkRegistryId(event.address);
  const entity = new PerkEntity(perkId);
  entity.perkId = event.params.perkId
  entity.name = event.params.name
  entity.perkUri = event.params.uri
  entity.isPerkActive = true;
  entity.createdOn = event.block.timestamp;
  entity.creationTrxHash = event.transaction.hash;
  entity.perksRegistry = perkRegistryId;
  entity.eligiblePerksForTier = [];
  entity.lastUpdateTrxHash = event.transaction.hash;
  entity.lastUpdatedOn = event.block.timestamp;

  entity.save();
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  const contractAddress = event.address;
  const perksRegistryId = generatePerkRegistryId(contractAddress);

  let perksRegistry = PerksRegistryEntity.load(perksRegistryId);
  if(perksRegistry == null) {
    perksRegistry = new PerksRegistryEntity(perksRegistryId);

    // read data from smart contract
    const contractInstance = PerksRegistryContract.bind(contractAddress);

    // add initial data
    perksRegistry.address = contractAddress;
    perksRegistry.deploymentTrxHash = event.transaction.hash;
    perksRegistry.deploymentBlockNumber = event.block.number;
    perksRegistry.deploymentTimestamp = event.block.timestamp;
    perksRegistry.membershipContract = generateMembershipContractId(contractInstance.sdvMembershipContract());
    perksRegistry.save();
  }
}
