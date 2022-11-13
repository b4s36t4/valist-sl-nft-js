import { ethers } from 'ethers';
import LicenceClient from './client';
import { getLicenseAddress, licenseABI } from './contracts';

type Provider =
  | ethers.providers.JsonRpcProvider
  | ethers.providers.Web3Provider;

interface Options {
  chainId: number;
  // metaTx: boolean; // Disabled
  wallet: ethers.Wallet;
  licenseAddress: string;
}

export async function create(
  provider: Provider,
  options: Partial<Options>
): Promise<any> {
  if (!options.chainId) {
    const network = await provider.getNetwork();
    options.chainId = network.chainId;
  }

  const licenseAddress =
    options.licenseAddress || getLicenseAddress(options.chainId);

  let license: ethers.Contract;

  let signer;
  const web3Provider = provider as ethers.providers.Web3Provider;

  if (web3Provider.provider && web3Provider.getSigner) {
    signer = web3Provider.getSigner();
    license = new ethers.Contract(licenseAddress, licenseABI, signer);
  } else {
    license = new ethers.Contract(licenseAddress, licenseABI, provider);
  }

  const client = new LicenceClient(license, signer);
  return client;
}
