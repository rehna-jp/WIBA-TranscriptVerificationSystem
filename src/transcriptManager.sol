// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {institutionRegistry} from './institutionRegistry.sol';

contract TranscriptManager{
     institutionRegistry public registry;
     constructor (address _registryAddress) {
         registry = institutionRegistry(_registryAddress);
     }

     error TranscriptDoesNotExist();

     enum status{ACTIVE, REVOKED}
     enum degreeType {ASSOCIATE, BACHELOR, MASTER, DOCTORATE, CERTIFICATE, DIPLOMA, POSTDOCTORATE}

     struct Transcript {
        uint id;
        string studentId;   
        address issuedBy;
        bytes32 documenthash;
        degreeType degreeType;
        uint256 dateIssued;
        string ipfscid;
        address studentAddress;
        status status;
        uint256 graduationyear;
     }

     uint public transcriptCount;

     mapping (uint => Transcript) public transcripts;
     mapping(string => bool) public existingCIDs;
     mapping (string => uint) cidToTranscriptId;
     mapping (address => uint[]) studentToTranscript;


     event TranscriptIssued(address indexed studentAddress,string ipfsCid,uint256 dateissued, address issuedby);
     event TranscriptInvalidated(address indexed studentAddress, uint256 dateissued, address issuedby);
     
     modifier onlyVerifiedInstitution{
        require(registry.isInstitutionVerified(msg.sender), "Only verified institutions can issue transcripts");
        _;
     }

     function issueTranscripts(
        string memory studentId, 
        string memory cid, 
         bytes32 documenthash, 
        degreeType degreetype,
        address studentAddress,
        uint256 graduationyear
        ) external onlyVerifiedInstitution{
            require(!existingCIDs[cid], "CID already used for another transcript");

            transcriptCount++;
            Transcript memory t = Transcript({
                 id: transcriptCount,
                 studentId: studentId,
                 issuedBy: msg.sender,
                 documenthash: documenthash,
                 degreeType: degreetype,
                 dateIssued: block.timestamp,
                 ipfscid: cid,
                 studentAddress: studentAddress,
                 status: status.ACTIVE,
                 graduationyear: graduationyear
             });
            transcripts[transcriptCount] = t;

            existingCIDs[cid] = true;
            cidToTranscriptId[cid] = transcriptCount;
            studentToTranscript[studentAddress].push(transcriptCount);
            emit TranscriptIssued(studentAddress,cid, block.timestamp, msg.sender);

     }
     
     function verifyTranscript(string memory cid) external view returns(Transcript memory){
          uint id = cidToTranscriptId[cid];
         if (id == 0 || transcripts[id].status != status.ACTIVE ) {
            revert TranscriptDoesNotExist();
         }

         return transcripts[id];

     }

     function inValidateTranscript(uint256 transcriptId) external onlyVerifiedInstitution{
         Transcript storage t = transcripts[transcriptId];
        require(t.studentAddress != address(0), "Transcript does not exist");
        require(transcripts[transcriptId].issuedBy == msg.sender, "Only the issuer can invalidate the transcript");
        require(transcripts[transcriptId].status == status.ACTIVE, "Transcript is already invalidated");
        
        t.status = status.REVOKED;
        emit TranscriptInvalidated(t.studentAddress, block.timestamp, msg.sender);
     }

     function getTranscriptDetails(uint256 transcriptId) external view returns (Transcript memory){
         require(transcripts[transcriptId].status == status.ACTIVE, "Transcript is invalidated");
         Transcript memory t = transcripts[transcriptId];
         return t;
     }

    function getStudentTranscripts(address student) external view returns (Transcript[] memory) {
    uint[] memory ids = studentToTranscript[student];
    Transcript[] memory result = new Transcript[](ids.length);
    for (uint i = 0; i < ids.length; i++) {
        result[i] = transcripts[ids[i]];
    }
    return result;
}


}