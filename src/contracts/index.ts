import * as licenseContract from './License.json';

export const licenseABI = licenseContract.abi; // ABI for the complied contract

export const licenseByteCode = licenseContract.bytecode; // Given Contract's bytecode

export const supportedChainIDs = [137, 80001, 1337]; // Supported testnets

export const chainIDContracts: { [key: number]: string } = {
  137: '0x3cE643dc61bb40bB0557316539f4A93016051b81', // Mainnet Ploygon
  80001: '0x3cE643dc61bb40bB0557316539f4A93016051b81', // Polygon Mubmai testnet
  1337: '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24', // Testnet
};

export function getLicenseAddress(chainId: number): string {
  if (!Object.keys(chainIDContracts).includes(chainId.toString())) {
    throw new Error(
      "Unsupported network chainId, supported chainID's includes 137, 80001 and 1337"
    );
  }

  return chainIDContracts[chainId];
}
