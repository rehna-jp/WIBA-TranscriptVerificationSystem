Blockchain-Based Transcript Verification System
A decentralized platform for issuing and verifying academic credentials using blockchain technology, IPFS storage, and Firebase backend infrastructure.

🎯 Overview
This project addresses the critical problem of academic credential fraud by creating an immutable, instantly verifiable system for educational transcripts. Traditional verification processes take days or weeks and are prone to fraud. Our blockchain-based solution provides instant, cryptographically-secure verification.
The Problem

Credential Fraud: Fake degrees cost employers millions annually
Slow Verification: Traditional processes take 3-14 days
High Costs: Manual verification is expensive
Lost Documents: Students frequently lose paper transcripts
No Global Standard: Each institution has different verification procedures

The Solution
A decentralized platform where:

Institutions issue tamper-proof credentials on blockchain
Documents are stored on decentralized IPFS
Anyone can verify authenticity instantly
Students control their own credentials
Zero trust required in intermediaries


✨ Features
For Institutions

✅ Issue digital credentials with cryptographic proof
✅ Upload and encrypt transcripts to IPFS
✅ Revoke credentials if necessary (fraud, error)
✅ View all issued credentials
✅ Batch issuance capability

For Students

✅ View all their credentials in one portal
✅ Download transcripts from IPFS
✅ Share verifiable links with employers
✅ Full ownership and control of credentials
✅ Access from anywhere, anytime

For Verifiers (Employers/Institutions)

✅ Upload document for instant verification
✅ Verify by IPFS CID
✅ Get complete credential details
✅ No login required (public verification)
✅ Verification logging and audit trail

For Administrators

✅ Register and verify institutions
✅ Suspend/reactivate institutions
✅ Monitor system statistics
✅ Manage system access

🛠️ Technology Stack
Blockchain Layer

Smart Contracts: Solidity ^0.8.20
Development Framework: Foundry
Network: Polygon Mumbai Testnet → Polygon Mainnet
Web3 Library: ethers.js v6

Backend Infrastructure

Platform: Firebase

Authentication (Email/Password + Wallet)
Cloud Firestore (NoSQL Database)
Cloud Functions (Serverless)
Firebase Storage (Backup)
Firebase Hosting



Document Storage

Primary: Pinata Cloud (IPFS)
Backup: Firebase Storage
Encryption: AES-256

Frontend

Framework: React.js 18.x
Styling: Tailwind CSS 3.x
Build Tool: Vite
State Management: React Context API
Routing: React Router v6

Development Tools

Package Manager: npm/yarn
Version Control: Git
Testing: Foundry (smart contracts), Jest (frontend)
Linting: ESLint, Prettier


🏗️ Architecture
┌─────────────────────────────────────────────────────────┐
│                    USER LAYER                           │
│   Admin | Institution | Student | Verifier              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React + Tailwind)                │
│   4 Portals: Admin | Institution | Student | Verifier   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│           FIREBASE ECOSYSTEM (Backend)                  │
│  Auth | Firestore | Cloud Functions | Storage           │
└─────┬──────────────┬──────────────────┬─────────────────┘
      │              │                  │
      ↓              ↓                  ↓
┌──────────┐  ┌─────────────┐  ┌──────────────────┐
│ Polygon  │  │   Pinata    │  │     Firebase     │
│Blockchain│  │ IPFS Cloud  │  │     Storage      │
│ (Hashes) │  │(Documents)  │  │    (Backup)      │
└──────────┘  └─────────────┘  └──────────────────┘

Data Flow
Credential Issuance:
Institution → Upload PDF → Encrypt → Upload to IPFS → Get CID
                                        ↓
                                 Calculate Hash
                                        ↓
                              Store on Blockchain
                                        ↓
                             Save Metadata (Firestore)
                                        ↓
                           Backup Copy (Firebase Storage)

Credential Verification:
Verifier → Upload PDF → Calculate Hash → Query Blockchain
                                              ↓
                                    Hash Found & Active?
                                              ↓
                              YES → Display Valid Result
                              NO  → Display Invalid Result


