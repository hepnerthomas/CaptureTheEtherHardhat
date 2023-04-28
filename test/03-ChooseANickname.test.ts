import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('DeployAContract', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let captureTheEther: Contract;
  let target: Contract;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    captureTheEther = await (
      await ethers.getContractFactory('CaptureTheEther', attacker)
    ).deploy(attacker.address);

    await captureTheEther.deployed();

    target = await (
      await ethers.getContractFactory('NicknameChallenge')
    ).attach(await captureTheEther.playerNicknameContract(attacker.address));

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const nickname = ethers.utils.formatBytes32String('thomas');

    await captureTheEther.connect(attacker).setNickname(nickname);

    expect(await captureTheEther.nicknameOf(attacker.address)).to.equal('0x74686f6d61730000000000000000000000000000000000000000000000000000');
    expect(await target.isComplete()).to.equal(true);
  });
});
