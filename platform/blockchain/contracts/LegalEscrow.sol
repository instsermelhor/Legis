// platform/blockchain/contracts/LegalEscrow.sol
// Smart Contract para Pagamentos Condicionais de Honorários Sucumbenciais / Acordos
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LegalEscrow is Ownable {
    enum EscrowStatus { CREATED, FUNDED, RELEASED, DISPUTED }

    struct Agreement {
        address payer;
        address payee;
        uint256 amount;
        EscrowStatus status;
        bytes32 documentHash;
    }

    mapping(bytes32 => Agreement) public agreements;

    event EscrowFunded(bytes32 indexed agreementId, uint256 amount);
    event EscrowReleased(bytes32 indexed agreementId, address payee);

    constructor() Ownable(msg.sender) {}

    function fundEscrow(bytes32 agreementId, address payee, bytes32 documentHash) external payable {
        require(msg.value > 0, "Valor deve ser maior que zero");
        agreements[agreementId] = Agreement(msg.sender, payee, msg.value, EscrowStatus.FUNDED, documentHash);
        emit EscrowFunded(agreementId, msg.value);
    }

    function releaseEscrow(bytes32 agreementId) external {
        Agreement storage agr = agreements[agreementId];
        require(agr.status == EscrowStatus.FUNDED, "Escrow nao esta financiado");
        require(msg.sender == agr.payer || msg.sender == owner(), "Nao autorizado");

        agr.status = EscrowStatus.RELEASED;
        payable(agr.payee).transfer(agr.amount);
        emit EscrowReleased(agreementId, agr.payee);
    }
}
