// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingSystem is ERC20, Ownable {
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    event ProposalApproved(
        uint256 proposalId,
        string description,
        uint256 yesVotes,
        uint256 noVotes
    );

    constructor() ERC20("VoteToken", "VTK") Ownable(msg.sender) {}

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        bool isApproved;
        mapping(address => bool) hasVoted;
    }

    function submitProposal(string memory description) public {
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.yesVotes = 0;
        newProposal.noVotes = 0;
        proposalCount++;
    }

    // task #2 mint
    // only the owner can mint
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // task #3 vote
    // check if the voter has a token check if the balance is greater than 0
    // check if the voter has voted.
    // the function takes a proposal id and a boolean value to check if the vote is yes or no.

    function vote(uint256 proposalId, bool isYes) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.hasVoted[msg.sender] == false, "Already voted");
        require(balanceOf(msg.sender) > 0, "No tokens to vote");
        proposal.hasVoted[msg.sender] = true;
        if (isYes) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }

         if (proposal.yesVotes >  proposal.noVotes) {
        emit ProposalApproved(proposal.id, proposal.description, proposal.yesVotes, proposal.noVotes);
    }
    }

    function getProposal(
        uint256 proposalId
    )
        public
        view
        returns (
            uint256 id,
            address proposer,
            string memory description,
            uint256 yesVotes,
            uint256 noVotes
        )
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes
        );
    }
}