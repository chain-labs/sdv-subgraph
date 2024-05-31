import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export const MemberEntityName = "Member";
export const SDVVVMembershipEntityName = "SDVVVMembership";
export const TrustedEntityEntityName = "TrustedEntity";
export const DefaultAdminEntityName = "DefaultAdmin";
export const MembershipEntityName = "Membership";

// helper functions to generate IDs for each entity
export function generateMembershipContractId(contractAddress: Address): string {
    return contractAddress.toHexString();
}

export function generateMembershipId(tokenId: BigInt): string {
  return tokenId.toHexString();
}

export function generateMemberId(account: Address): string{
  return account.toHexString();
}

export function generateDefaultAdminRoleTypeId(roleHash: Bytes): string{
  return `DEFAULT_ADMIN_ROLE-${roleHash.toHexString()}`;
}

export function generateTrustedEntityRoleTypeId(roleHash: Bytes): string{
  return `TRUSTED_ENTITY-${roleHash.toHexString()}`;
}

export const DefaultAdminRoleHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
  