import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingSystem", function () {
  let voting: any;
  let owner: any;
  let Aziz: any;
  let notVoter: any;

  beforeEach(async function () {
    const Voting = await ethers.getContractFactory("VotingSystem");
    voting = await Voting.deploy();
    [owner, Aziz, notVoter] = await ethers.getSigners();
  });

  it("Should deploy with the correct name and symbol", async function () {
    expect(await voting.name()).to.equal("VoteToken");
    expect(await voting.symbol()).to.equal("VTK");
  });

  it("Should set the right owner", async function () {
    expect(await voting.owner()).to.equal(owner.address);
  });

  it("Should mint tokens only by the owner", async function () {
    await voting.mint(owner.address, 100);
    expect(await voting.balanceOf(owner.address)).to.equal(100);

    await expect(voting.connect(Aziz).mint(Aziz.address, 50)).to.be.reverted;
  });

  it("Should allow users to submit proposals", async function () {
    await voting.connect(owner).submitProposal("Proposal 1");
    await voting.connect(Aziz).submitProposal("Proposal 2");

    const proposal1 = await voting.proposals(0);
    const proposal2 = await voting.proposals(1);

    expect(proposal1.description).to.equal("Proposal 1");
    expect(proposal1.proposer).to.equal(owner.address);

    expect(proposal2.description).to.equal("Proposal 2");
    expect(proposal2.proposer).to.equal(Aziz.address);
  });

  it("Should allow users with tokens to vote on proposals", async function () {
    await voting.mint(owner.address, 100);
    await voting.mint(Aziz.address, 100);

    await voting.connect(owner).submitProposal("Proposal 1");
    await voting.connect(Aziz).submitProposal("Proposal 2");

    await voting.connect(owner).vote(0, true);
    await voting.connect(Aziz).vote(1, false);

    const proposal1 = await voting.proposals(0);
    const proposal2 = await voting.proposals(1);

    expect(proposal1.yesVotes).to.equal(1);
    expect(proposal1.noVotes).to.equal(0);
    expect(proposal2.yesVotes).to.equal(0);
    expect(proposal2.noVotes).to.equal(1);
  });

  it("Should prevent users without tokens from voting", async function () {
    await voting.connect(owner).submitProposal("Proposal 1");

    await expect(voting.connect(notVoter).vote(0, true)).to.be.revertedWith("No tokens to vote");
  });

  it("Should prevent users from voting more than once", async function () {
    await voting.mint(owner.address, 100);
    await voting.connect(owner).submitProposal("Proposal 1");

    await voting.connect(owner).vote(0, true);
    await expect(voting.connect(owner).vote(0, true)).to.be.revertedWith("Already voted");
  });

  it("Should return the correct proposal details", async function () {
    await voting.connect(owner).submitProposal("Proposal 1");

    const proposal = await voting.getProposal(0);
    expect(proposal.id).to.equal(0);
    expect(proposal.proposer).to.equal(owner.address);
    expect(proposal.description).to.equal("Proposal 1");
    expect(proposal.yesVotes).to.equal(0);
    expect(proposal.noVotes).to.equal(0);
  });

  it("Should emit an event when a proposal is approved", async function () {
    await voting.mint(owner.address, 100);
    await voting.connect(owner).submitProposal("Proposal 1");

    await expect(voting.connect(owner).vote(0, true))
      .to.emit(voting, "ProposalApproved")
      .withArgs(0, "Proposal 1", 1, 0);

    await expect(voting.connect(owner).vote(0, true)).to.be.revertedWith("Already voted");
  });
});
