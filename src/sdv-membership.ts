import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import { store } from '@graphprotocol/graph-ts'
import {
  // Approval as ApprovalEvent,
  // ApprovalForAll as ApprovalForAllEvent,
  // EIP712DomainChanged as EIP712DomainChangedEvent,
  // RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Transfer as TransferEvent,
  BaseUriUpdated as BaseUriUpdatedEvent,
  UriSuffixUpdated as UriSuffixUpdatedEvent,
  TierUpdated as TierUpdatedEvent
} from "../generated/SDVMembership/SDVMembership"
import {
  Member as MemberEntity,
  SDVVVMembership as SDVVVMembershipEntity,
  TrustedEntity as TrustedEntityEntity,
  DefaultAdmin as DefaultAdminEntity,
  Membership as MembershipEntity
} from "../generated/schema"
import {
  SDVMembership as SDVMembershipContract
} from "../generated/SDVMembership/SDVMembership";
import {
  generateMembershipContractId,
  generateMembershipId,
  generateMemberId,
  generateDefaultAdminRoleTypeId,
  generateTrustedEntityRoleTypeId,
  DefaultAdminRoleHash,
  MemberEntityName,
  MembershipEntityName,
  DefaultAdminEntityName,
  TrustedEntityEntityName
} from "./utils";

export function handleRoleGranted(event: RoleGrantedEvent): void {
  const contractAddress = event.address;
  const roleHash = event.params.role;
  const membershipContractId = generateMembershipContractId(contractAddress);

  let membershipContract = SDVVVMembershipEntity.load(membershipContractId);
  if(membershipContract == null) {
    membershipContract = new SDVVVMembershipEntity(membershipContractId);

    // read data from smart contract
    const contractInstance = SDVMembershipContract.bind(contractAddress);

    // add initial data
    membershipContract.address = contractAddress;
    membershipContract.deploymentTrxHash = event.transaction.hash;
    membershipContract.deploymentBlockNumber = event.block.number;
    membershipContract.deploymentTimestamp = event.block.timestamp;
    membershipContract.baseUri = contractInstance.baseURI();
    membershipContract.suffix = contractInstance.suffix();
    membershipContract.save();
  }

  // create the entity based on what type of role is being added
  // if role ID ===  bytes32(0) then default admin else trusted entity
  const roleType = roleHash.toHexString() == DefaultAdminRoleHash ? "DEFAULT_ADMIN_ROLE" :  "TRUSTED_ENTITY";
  log.info("Role Hash: {}", [roleHash.toHexString()]);
  log.info("DefaultAdminRole: {}", [DefaultAdminRoleHash]);
  log.info("Is Default Admin Role?: {}", [(roleHash.toHexString() == DefaultAdminRoleHash).toString()]);
  if(roleType == "DEFAULT_ADMIN_ROLE") {
    // create a DEFAULT ADMIN ROLE
    const entityId = generateDefaultAdminRoleTypeId(event.params.account);
    let entity = new DefaultAdminEntity(entityId);
    // add the data
    entity.address = event.params.account;
    entity.activeSince = event.block.timestamp;
    entity.activeSinceBlockNumber = event.block.number;
    entity.activeSinceTrxHash = event.transaction.hash;
    entity.membershipContract = membershipContractId;
    entity.addedBy = event.params.sender;
  
    entity.save();
  } else {
    // create a TRUSTED_ENTITY_ROLE
    const entityId = generateTrustedEntityRoleTypeId(event.params.account);
    let entity = new TrustedEntityEntity(entityId);
    // add the data
    entity.address = event.params.account;
    entity.activeSince = event.block.timestamp;
    entity.activeSinceBlockNumber = event.block.number;
    entity.activeSinceTrxHash = event.transaction.hash;
    entity.membershipContract = membershipContractId;
    entity.addedBy = event.params.sender;
  
    entity.save();
  }
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  const contractAddress = event.address;
  const roleHash = event.params.role;

  // if role ID ===  bytes32(0) then default admin else trusted entity
  const roleType = roleHash == Bytes.empty() ? "DEFAULT_ADMIN_ROLE" :  "TRUSTED_ENTITY";
  if(roleType == "DEFAULT_ADMIN_ROLE") {
    // create a DEFAULT ADMIN ROLE
    const entityId = generateDefaultAdminRoleTypeId(event.params.account);
    store.remove(DefaultAdminEntityName, entityId);
  } else {
    // create a TRUSTED_ENTITY_ROLE
    const entityId = generateTrustedEntityRoleTypeId(event.params.account);
    store.remove(TrustedEntityEntityName, entityId);
  }
}

export function handleTransfer(event: TransferEvent): void {
  // identify what operation this is: ["mint", "burn"]
  const fromAddress = event.params.from;
  const toAddrress = event.params.to;
  const contractAddress = event.address;
  const membershipContractId = generateMembershipContractId(contractAddress);
  const tokenId = event.params.tokenId;
  const membershipId = generateMembershipId(tokenId);
  const operationType = fromAddress !== Address.zero() && toAddrress !== Address.zero() ? "transfer" : toAddrress == Address.zero() ? "burn" : "mint";

  // mint
  if(operationType == "mint") {
    // get parameters
    const toMemberId = generateMemberId(toAddrress);

    // create a new member entity
    let membersEntity = MemberEntity.load(toMemberId);
    if(membersEntity == null) {
      membersEntity = new MemberEntity(toMemberId);

      // add data
      membersEntity.address = toAddrress;
      membersEntity.membershipContract = membershipContractId;
    }

    // create a new membership entity
    let membershipEntity = new MembershipEntity(membershipId);

    // udpate data
    membershipEntity.tokenId = tokenId;
    membershipEntity.activeSince = event.block.timestamp;
    membershipEntity.blockNumber = event.block.number;
    membershipEntity.transactionHash = event.transaction.hash;
    membershipEntity.isActive = true;
    membershipEntity.tierLevel = BigInt.fromI32(1);
    membershipEntity.lastUpdate = event.block.timestamp;
    membershipEntity.membershipContract = membershipContractId;
    membershipEntity.owner = toMemberId;

    // save entities
    membersEntity.save();
    membershipEntity.save();
  } else if (operationType == "burn") {
    // get parameters
    const fromMemberId = generateMemberId(fromAddress);

    // delete the entity
    store.remove(MemberEntityName, fromMemberId);
    store.remove(MembershipEntityName, membershipId);
  } else {
    // get parameters
    const fromMemberId = generateMemberId(fromAddress);
    const toMemberId = generateMemberId(toAddrress);

    // fetch the existing member from where thee NFT is transfered
    // fetch or create new member entity for the user receiveing the NFT
    let toMemberEntity = MemberEntity.load(toMemberId);
    if(toMemberEntity == null) {
      toMemberEntity = new MemberEntity(toMemberId);

      // add data
      toMemberEntity.address = toAddrress;
      toMemberEntity.membershipContract = membershipContractId;
    }

    //  fetch membership NFT
    let membershipEntity = MembershipEntity.load(membershipId);
    if(membershipEntity == null) {
      membershipEntity = new MembershipEntity(membershipId);

      // update data
      membershipEntity.tokenId = tokenId;
      membershipEntity.activeSince = event.block.timestamp;
      membershipEntity.blockNumber = event.block.number;
      membershipEntity.transactionHash = event.transaction.hash;
      membershipEntity.isActive = true;
      membershipEntity.tierLevel = BigInt.fromI32(1);
      membershipEntity.membershipContract = membershipContractId;
    }

    // update data
    membershipEntity.lastUpdate = event.block.timestamp;
    membershipEntity.owner = toMemberId;

    // save entities
    toMemberEntity.save();
    membershipEntity.save();
  }
}

export function handleTierUpdated(event: TierUpdatedEvent): void {
  const tokenId = event.params.tierId;
  const membershipId = generateMembershipId(tokenId);
  const membershipEntity = MembershipEntity.load(membershipId);

  if(membershipEntity == null) {
    log.error("Membership entity with ID {} not created properly. It should be initialized during the constructor", [membershipId]);
    throw new Error(`Membership entity with ID ${membershipId} not created properly. It should be initialized during the constructor`);
  }

  // update the data
  membershipEntity.tierLevel = event.params.tierId;
  membershipEntity.lastUpdate =  event.block.timestamp;

  // save the data
  membershipEntity.save();
}

export function handleBaseUriUpdated(event: BaseUriUpdatedEvent): void {
  // when base URI updated, get the new values
  const updatedBaseUri = event.params.baseUri;
  const contractAddress = event.address;
  const entityId = generateMembershipContractId(contractAddress);

  // fetch the SDVVVMembership entity
  const entity = SDVVVMembershipEntity.load(entityId);

  // ensure the entity exist
  if(entity == null) {
    log.error("SDVVVMembership entity not created properly. It should be initialized during the constructor", []);
    throw new Error("SDVVVMembership entity not created properly. It should be initialized during the constructor");
  }

  // update the base URI
  entity.baseUri = updatedBaseUri;

  // save the entity
  entity.save();
}

export function handleUriSuffixUpdated(event: UriSuffixUpdatedEvent): void {
  // when Suffix updated, get the new values
  const updatedSuffix = event.params.suffix;
  const contractAddress = event.address;
  const entityId = generateMembershipContractId(contractAddress);

  // fetch the SDVVVMembership entity
  const entity = SDVVVMembershipEntity.load(entityId);

  // ensure the entity exist
  if(entity == null) {
    log.error("SDVVVMembership entity not created properly. It should be initialized during the constructor", []);
    throw new Error("SDVVVMembership entity not created properly. It should be initialized during the constructor");
  }

  // update the base URI
  entity.suffix = updatedSuffix;

  // save the entity
  entity.save();
}
