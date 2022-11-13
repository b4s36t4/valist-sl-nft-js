import { ContractTransaction, ethers } from 'ethers';
import { arrayify, hashMessage } from 'ethers/lib/utils';

const erc20ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
]; // Minimal ABI taken from current valist SDK

export default class LicenceClient {
  constructor(
    private license: ethers.Contract,
    private signer?: ethers.providers.JsonRpcSigner
  ) {}

  async purchaseProduct(
    projectID: ethers.BigNumberish,
    recipient: string
  ): Promise<ContractTransaction> {
    const price = await this.getProductPrice(projectID);
    const purchase = this.license['purchase(uint256,address)'];
    const result = await purchase(projectID, recipient, { value: price }); // No redundant await
    return result;
  }

  async purchaseProductToken(
    token: string,
    projectID: ethers.BigNumberish,
    recipient: string
  ): Promise<ContractTransaction> {
    const erc20 = new ethers.Contract(token, erc20ABI, this.license.signer);
    const price = await this.getProductPrice(projectID, token); // Re-order Variables by preference
    // approve the transfer
    const approveTx = await erc20.approve(this.license.address, price);
    await approveTx.wait();
    // purchase the product
    const purchase = this.license['purchase(address,uint256,address)'];
    const result = await purchase(token, projectID, recipient);
    return result;
  }

  async getProductPrice(
    projectID: ethers.BigNumberish,
    token?: string
  ): Promise<ethers.BigNumber> {
    let getPrice;
    if (token) {
      getPrice = this.license['getPrice(address,uint256)'];
    } else {
      getPrice = this.license['getPrice(uint256)'];
    }
    const result = token
      ? await getPrice(token, projectID)
      : await getPrice(projectID); // No redundant await
    return result;
  }

  async checkLicense(signatureMessage: string, projectID: ethers.BigNumberish) {
    if (!this.signer) {
      throw new Error('No signer Provided');
    }

    const hash = await this.signer.signMessage(signatureMessage);
    const digest = arrayify(hashMessage(signatureMessage));
    const userAddress = ethers.utils.recoverAddress(digest, hash);

    const getBalance = this.license['balanceOf(address, uint256)'];

    const result = getBalance(userAddress, projectID);
    return result;
  }
}
