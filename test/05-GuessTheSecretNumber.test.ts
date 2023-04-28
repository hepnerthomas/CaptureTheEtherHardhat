import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheSecretNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheSecretNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {

    // Use a loop to brute force the secret number
    // let targetBalance = await provider.getBalance(target.address);
    // for(let i = 0; i < 256; i++) {
    //   await target.guess(i, {value: utils.parseEther('1')});
    //   const newBalance = await provider.getBalance(target.address);
    //   if (newBalance.sub(targetBalance).isNegative()) {
    //     console.log(`${i}: ` , targetBalance);
    //   }
    //   targetBalance = newBalance;
    // }

    await target.guess(170, {value: utils.parseEther('1')});

    expect(await target.isComplete()).to.equal(true);
  });
});
