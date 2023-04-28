import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNewNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheNewNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = await target.connect(attacker);
  });

  it('exploit', async () => {

    let targetSolver: Contract;

    targetSolver = await (
      await ethers.getContractFactory('GuessTheNewNumberSolver', attacker)
    ).deploy(target.address);

    targetSolver = await targetSolver.connect(attacker);

    targetSolver.solve();

    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
