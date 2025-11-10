// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract institutionRegistry{

    address immutable i_admin;

    constructor (address admin){
      i_admin = admin;
    }
    
    struct institution{
        uint id;
        address walletAddress;
        string name;
        string country;
        string accreditedURL;
        bool isVerified;
        uint256 dateRegistered;
        string email;
    }
   mapping(address => institution) institutions;
   uint256 public numberOfInstitutions;
   uint256 public numberOfVerifiedInstitutions;

   event InstitutionRegistered(address indexed _walletAddress, string _name, string _country, string _accreditedURL, string email);
   event InstitutionVerified(address indexed _walletAddress, string _name, string _country, string _accreditedURL, string email);
   event InstitutionSuspended(address indexed _walletAddress, string _name, string _country, string _accreditedURL, string email);

   modifier onlyAdmin(){
        require(msg.sender == i_admin, "Only the admin can call this function");
        _;
   }

   error InstitutionDoesNotExist();
   error InstitutionAlreadyVerified();
   error InstitutionAlreadyRegistered();
   
   function registerInstitution(string memory _name, string memory _country, string memory _accreditedURL,  string memory email) external {
        if (institutions[msg.sender].walletAddress != address(0)) {
            revert InstitutionAlreadyRegistered();
        }
        numberOfInstitutions++;
        institutions[msg.sender] = institution({
            id: numberOfInstitutions,
            walletAddress: msg.sender,
            name: _name,
            country: _country,
            accreditedURL: _accreditedURL,
            isVerified: false,
            dateRegistered: block.timestamp,
            email: email
        } );

        emit InstitutionRegistered(msg.sender, _name, _country, _accreditedURL, email);
   }

   function VerifyInstitution(address _institutionAddress) external onlyAdmin {
      if (institutions[_institutionAddress].walletAddress == address(0)) {
           revert InstitutionDoesNotExist();
      }
      if (institutions[_institutionAddress].isVerified == true)  {
         revert InstitutionAlreadyVerified();
      }

      institution memory inst = institutions[_institutionAddress];

      numberOfVerifiedInstitutions++;
      institutions[_institutionAddress].isVerified = true;
      emit InstitutionVerified(_institutionAddress, inst.name, inst.country, inst.accreditedURL, inst.email);
   }

   function suspendInstitution(address _institutionAddress) external onlyAdmin {
       institutions[_institutionAddress].isVerified = false;
       numberOfVerifiedInstitutions--;

       institution memory inst = institutions[_institutionAddress];
       emit InstitutionSuspended(_institutionAddress, inst.name, inst.country, inst.accreditedURL, inst.email);

   }

   function isInstitutionVerified(address _institutionAddress) external view returns (bool) { 
       if (institutions[_institutionAddress].walletAddress == address(0)) {
           revert InstitutionDoesNotExist();
      }  
       return institutions[_institutionAddress].isVerified;
   }

   
   function getInstitutionDetails(address _institutionAddress) external view returns(institution memory){
        if (institutions[_institutionAddress].walletAddress == address(0)) {
           revert InstitutionDoesNotExist();
      }  
      return institutions[_institutionAddress];
   }
}