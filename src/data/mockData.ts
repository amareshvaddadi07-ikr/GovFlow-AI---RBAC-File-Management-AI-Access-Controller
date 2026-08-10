import { DocumentItem, UserSession, AuditLog } from '../types';

export const USER_PRESETS: UserSession[] = [
  {
    userName: 'Commissioner Sarah Vance',
    role: 'Commissioner',
    department: 'All',
    title: 'High Commissioner & Director of Oversight',
    badgeId: 'COMM-001'
  },
  {
    userName: 'Officer Robert Chen',
    role: 'Officer',
    department: 'Finance',
    title: 'Senior Financial Analyst',
    badgeId: 'OFF-FIN-104'
  },
  {
    userName: 'Officer Elena Rostova',
    role: 'Officer',
    department: 'HR',
    title: 'Personnel & HR Compliance Lead',
    badgeId: 'OFF-HR-208'
  },
  {
    userName: 'Officer Marcus Brody',
    role: 'Officer',
    department: 'Operations',
    title: 'Logistics & Field Operations Manager',
    badgeId: 'OFF-OPS-312'
  },
  {
    userName: 'Officer David Kalu',
    role: 'Officer',
    department: 'IT & Security',
    title: 'Cybersecurity & Systems Officer',
    badgeId: 'OFF-IT-405'
  },
  {
    userName: 'Officer Amanda Hayes',
    role: 'Officer',
    department: 'Legal & Compliance',
    title: 'Legal Counsel & Regulatory Auditor',
    badgeId: 'OFF-LEG-519'
  },
  {
    userName: 'Citizen Priya Sharma',
    role: 'Citizen',
    department: 'Public Services',
    title: 'Verified Citizen Petitioner',
    badgeId: 'CIT-8831-KYC',
    email: 'priya.sharma@citizen.in',
    aadhaarRedacted: 'XXXX-XXXX-8831',
    kycVerified: true,
    mfaVerified: true,
    ssoProvider: 'CITIZEN_AADHAAR_KYC'
  }
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  // FINANCE
  {
    id: 'doc-fin-001',
    title: 'Q3 Financial Revenue Audit & Variance Report',
    fileName: 'Q3_2026_Revenue_Audit.pdf',
    department: 'Finance',
    classification: 'Confidential',
    fileSize: '2.4 MB',
    updatedAt: '2026-07-15',
    author: 'Robert Chen',
    description: 'Detailed analysis of Q3 departmental allocations, revenue streams, and variance calculations.',
    version: 'v2.1',
    tags: ['Revenue', 'Audit', 'Q3', 'Budget'],
    barcode: 'DOC-FIN-2026-90412',
    sha256Hash: 'sha256:7f8e32a10b49c71d62e30129f8c14a938217d842b109e4a0',
    isDigitized: true,
    digitizedAt: '2026-07-15 09:30:12',
    digitizedBy: 'Officer Robert Chen (OFF-FIN-104)',
    rawSourceType: 'PHYSICAL_PAPER',
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Robert Chen',
      signerBadgeId: 'OFF-FIN-104',
      signedAt: '2026-07-15 09:30:12',
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: 'SIG-FIN-RC-0912-99214'
    },
    transferHistory: [
      {
        id: 'tr-1001',
        fromUser: 'Robert Chen',
        fromBadgeId: 'OFF-FIN-104',
        fromDepartment: 'Finance',
        toUser: 'Commissioner Sarah Vance',
        toBadgeId: 'COMM-001',
        toDepartment: 'All',
        timestamp: '2026-07-15 10:14:02',
        payloadHash: 'sha256:7f8e32a10b49c71d62e30129f8c14a938217d842b109e4a0',
        barcode: 'DOC-FIN-2026-90412',
        notes: 'Official Quarterly Revenue Dispatch for High Commissioner Review',
        status: 'DELIVERED'
      }
    ],
    assignedToUser: 'Commissioner Sarah Vance',
    assignedToBadgeId: 'COMM-001',
    isPendingVerification: true,
    verifiedByUsers: [],
    content: `CONFIDENTIAL - FINANCE DEPARTMENT ONLY
Projected Q3 Fiscal Summary:
- Total Operating Revenue: $14.8M (+6.2% YoY)
- Departmental Budget Allocation:
  * Operations: $5.2M
  * IT & Infrastructure: $3.9M
  * Finance & Accounting: $1.8M
  * HR & Talent: $1.5M
  * Legal & Regulatory: $1.2M
- Net Profit Margin: 18.4%
Key Audit Notes:
1. Operations exceeded software licensing budget by $140,000 due to unexpected server scaling.
2. Revenue from enterprise contracts saw a $1.1M bump in June.
3. Unclaimed capital reserves stand at $850,000 pending board clearance.`
  },
  {
    id: 'doc-fin-002',
    title: 'Annual Executive Compensation & Salary Matrix 2026',
    fileName: '2026_Exec_Compensation_Matrix.xlsx',
    department: 'Finance',
    classification: 'Restricted',
    fileSize: '1.8 MB',
    updatedAt: '2026-06-30',
    author: 'Finance Oversight Committee',
    description: 'Executive pay scales, performance bonus structures, and equity distribution formulas.',
    version: 'v1.0',
    tags: ['Compensation', 'Executive', 'Payroll', 'Restricted'],
    barcode: 'DOC-FIN-2026-88102',
    sha256Hash: 'sha256:4a120c91e842bf773a019e001f3c5b8d2910a39c11827419',
    isDigitized: true,
    digitizedAt: '2026-06-30 14:20:00',
    digitizedBy: 'Finance Oversight Board',
    rawSourceType: 'SCANNED_PDF',
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Finance Oversight Board',
      signerBadgeId: 'OFF-FIN-BOARD',
      signedAt: '2026-06-30 14:20:00',
      signatureAlgorithm: 'RSA-4096 / HMAC-SHA256',
      signatureKey: 'SIG-FIN-BOARD-2026-88'
    },
    content: `RESTRICTED - FINANCE & COMMISSIONER ACCESS
2026 Executive Compensation Breakdown:
- Commissioner Level: Base $285,000 + 15% Performance Incentive
- Department Directors: Base $195,000 - $220,000
- Senior Officers: Base $115,000 - $145,000
- Performance Bonus Pool Total: $1.2M distributed across Q4 targets.
Tax and compliance withholding schedules attached in Appendix B.`
  },
  {
    id: 'doc-fin-003',
    title: 'Capital Expenditure & Hardware Refresh Budget',
    fileName: 'CapEx_Hardware_Refresh_2026.pdf',
    department: 'Finance',
    classification: 'Internal',
    fileSize: '3.1 MB',
    updatedAt: '2026-05-12',
    author: 'Finance & IT Joint Board',
    description: 'Procurement roadmap for server upgrades, employee laptops, and datacenter hardware.',
    version: 'v1.3',
    tags: ['CapEx', 'Procurement', 'Hardware'],
    barcode: 'DOC-FIN-2026-77319',
    sha256Hash: 'sha256:9d817420e1189c412f801a2c90e1823f4091a281726a1098',
    isDigitized: false,
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Robert Chen',
      signerBadgeId: 'OFF-FIN-104',
      signedAt: '2026-05-12 11:00:00',
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: 'SIG-FIN-RC-0512-33'
    },
    content: `FINANCE DEPARTMENT INTERNAL MEMO
Approved CapEx Items for 2026-2027:
1. Datacenter Blade Servers: $420,000 (Scheduled Q3)
2. Workstation Upgrades (250 units): $310,000 (Scheduled Q4)
3. Encrypted Mobile Device Deployment: $95,000
Approved Vendor: TechFleet Solutions Inc.`
  },

  // HR
  {
    id: 'doc-hr-001',
    title: 'Q2 Employee Performance Evaluations & Promotion List',
    fileName: 'Q2_Performance_Evaluations.pdf',
    department: 'HR',
    classification: 'Confidential',
    fileSize: '3.8 MB',
    updatedAt: '2026-07-02',
    author: 'Elena Rostova',
    description: 'Confidential review ratings, salary recommendations, and promotion candidate nominations.',
    version: 'v3.0',
    tags: ['Performance', 'Evaluations', 'Promotions', 'Personnel'],
    barcode: 'DOC-HR-2026-55109',
    sha256Hash: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    isDigitized: true,
    digitizedAt: '2026-07-02 16:45:00',
    digitizedBy: 'Officer Elena Rostova (OFF-HR-208)',
    rawSourceType: 'HANDWRITTEN_MEMO',
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Elena Rostova',
      signerBadgeId: 'OFF-HR-208',
      signedAt: '2026-07-02 16:45:00',
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: 'SIG-HR-ER-0702-881'
    },
    content: `CONFIDENTIAL - HR DEPARTMENT ONLY
Q2 Employee Performance Summary:
- Total Reviewed Staff: 340
- Exceeds Expectations (Tier 1): 42 personnel (Recommended 8% salary bump)
- Meets Expectations (Tier 2): 265 personnel (Standard 3.5% inflation adjustment)
- Performance Improvement Plans (PIP): 12 personnel
Key Promotion Recommendations:
- Sarah Miller (Operations) -> Senior Operations Lead
- David Kalu (IT) -> Lead Systems Security Officer
- Mark Vance (Finance) -> Senior Audit Analyst`
  },
  {
    id: 'doc-hr-002',
    title: 'Internal Workplace Harassment & Code of Conduct Grievance Logs',
    fileName: 'HR_Grievance_Case_Logs_2026.docx',
    department: 'HR',
    classification: 'Top Secret',
    fileSize: '1.2 MB',
    updatedAt: '2026-07-20',
    author: 'HR Standards Bureau',
    description: 'Formal employee dispute investigations, disciplinary actions, and confidential mediation records.',
    version: 'v4.1',
    tags: ['Grievance', 'Conduct', 'Legal', 'Sensitive'],
    barcode: 'DOC-HR-2026-99014',
    sha256Hash: 'sha256:881f9a0c1e2d3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c',
    isDigitized: true,
    digitizedAt: '2026-07-20 11:15:30',
    digitizedBy: 'Elena Rostova',
    rawSourceType: 'PHYSICAL_PAPER',
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Elena Rostova',
      signerBadgeId: 'OFF-HR-208',
      signedAt: '2026-07-20 11:15:30',
      signatureAlgorithm: 'RSA-4096 / HMAC-SHA256',
      signatureKey: 'SIG-HR-ER-0720-990'
    },
    content: `TOP SECRET - HR CLEARANCE REQUIRED
Active HR Dispute Files (Jul 2026):
- Case #HR-2026-89: Resolved via mutual conciliation.
- Case #HR-2026-92: Active formal investigation regarding inter-departmental resource misallocation.
- Mandatory Training Completion Rate: 98.4% across all regional offices.`
  },
  {
    id: 'doc-hr-003',
    title: '2026 Organization Benefits & Health Plan Policy',
    fileName: '2026_Benefits_Policy_Guide.pdf',
    department: 'HR',
    classification: 'Internal',
    fileSize: '4.5 MB',
    updatedAt: '2026-01-10',
    author: 'Elena Rostova',
    description: 'Comprehensive health coverage, dental, vision, mental wellness, and 401(k) matching guidelines.',
    version: 'v1.0',
    tags: ['Benefits', 'Health', 'Insurance', 'Policy'],
    barcode: 'DOC-HR-2026-33104',
    sha256Hash: 'sha256:2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a',
    isDigitized: false,
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Elena Rostova',
      signerBadgeId: 'OFF-HR-208',
      signedAt: '2026-01-10 10:00:00',
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: 'SIG-HR-ER-0110-112'
    },
    content: `HR DEPARTMENT POLICY DOCUMENT
Standard Organizational Benefits Overview:
- Health Care: 90% Employer Paid Premium (PPO & HSA options)
- 401(k) Match: Dollar-for-dollar up to 6% of base salary.
- Parental Leave: 16 weeks fully paid for all eligible personnel.
- Annual Wellness Stipend: $1,200 per employee.`
  },

  // OPERATIONS
  {
    id: 'doc-ops-001',
    title: 'Global Supply Chain & Logistics Continuity Plan',
    fileName: 'Logistics_Continuity_Plan_2026.pdf',
    department: 'Operations',
    classification: 'Confidential',
    fileSize: '5.2 MB',
    updatedAt: '2026-07-10',
    author: 'Marcus Brody',
    description: 'Primary transport routes, warehouse inventory levels, contingency suppliers, and disaster protocols.',
    version: 'v2.4',
    tags: ['Logistics', 'Supply Chain', 'Warehouses', 'Continuity'],
    barcode: 'DOC-OPS-2026-11849',
    sha256Hash: 'sha256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a',
    isDigitized: true,
    digitizedAt: '2026-07-10 08:30:00',
    digitizedBy: 'Officer Marcus Brody (OFF-OPS-312)',
    rawSourceType: 'DISPATCH_ORDER',
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Marcus Brody',
      signerBadgeId: 'OFF-OPS-312',
      signedAt: '2026-07-10 08:30:00',
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: 'SIG-OPS-MB-0710-551'
    },
    content: `CONFIDENTIAL - OPERATIONS DEPARTMENT ONLY
Operations Contingency & Route Optimization Protocol:
- Primary Warehouse Centers: North Hub (Chicago), West Hub (Reno), East Hub (Atlanta).
- Active Field Fleet Units: 142 transport vehicles with real-time GPS tracking.
- Reserve Stock Ratio: Maintained at 35% above average monthly throughput.
- Emergency rerouting activated for Sector 4 due to port congestion; estimated turnaround overhead +4 hours.`
  },
  {
    id: 'doc-ops-002',
    title: 'Facility Security Maintenance & Deployment Logs',
    fileName: 'Facility_Maintenance_Log_Q2.xlsx',
    department: 'Operations',
    classification: 'Internal',
    fileSize: '2.1 MB',
    updatedAt: '2026-06-25',
    author: 'Marcus Brody',
    description: 'Physical access control repairs, HVAC servicing, generator testing, and contractor access logs.',
    version: 'v1.1',
    tags: ['Facility', 'Maintenance', 'Physical Security'],
    barcode: 'DOC-OPS-2026-66412',
    sha256Hash: 'sha256:3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f',
    isDigitized: false,
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Marcus Brody',
      signerBadgeId: 'OFF-OPS-312',
      signedAt: '2026-06-25 14:00:00',
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: 'SIG-OPS-MB-0625-771'
    },
    content: `OPERATIONS FIELD LOG
Facility Status Audit:
- HQ Building A: Full generator test passed on Jun 18.
- Backup Datacenter B: Perimeter sensor recalibrated.
- HVAC Unit 3 replaced under warranty.
- Visitor badge printer firmware updated to v4.2.`
  },

  // IT & SECURITY
  {
    id: 'doc-it-001',
    title: 'Threat Intelligence & Network Penetration Test Findings',
    fileName: 'Q2_Penetration_Test_Report.pdf',
    department: 'IT & Security',
    classification: 'Top Secret',
    fileSize: '4.8 MB',
    updatedAt: '2026-07-18',
    author: 'David Kalu',
    description: 'External security assessment results, vulnerability disclosures, firewall rules, and zero-trust audit.',
    version: 'v1.0',
    tags: ['Security', 'Vulnerability', 'PenTest', 'Network'],
    barcode: 'DOC-IT-2026-44019',
    sha256Hash: 'sha256:5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f',
    isDigitized: true,
    digitizedAt: '2026-07-18 17:10:00',
    digitizedBy: 'Officer David Kalu (OFF-IT-405)',
    rawSourceType: 'SCANNED_PDF',
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'David Kalu',
      signerBadgeId: 'OFF-IT-405',
      signedAt: '2026-07-18 17:10:00',
      signatureAlgorithm: 'RSA-4096 / HMAC-SHA256',
      signatureKey: 'SIG-IT-DK-0718-440'
    },
    content: `TOP SECRET - IT & SECURITY CLEARANCE ONLY
Cyber Security Assessment Highlights:
- External Perimeter Scan: Zero Critical Zero-Days detected.
- Remediation Task #402: Patched legacy SSL/TLS protocol on API Proxy server.
- Zero-Trust Identity Enforcement: MFA enforced on 100% of user endpoints.
- Isolated Sandbox Alert: 3 suspicious phishing emails intercepted and neutralized.`
  },
  {
    id: 'doc-it-002',
    title: 'Enterprise Server Migration Architecture & SLA Rules',
    fileName: 'Server_Migration_Architecture.pdf',
    department: 'IT & Security',
    classification: 'Internal',
    fileSize: '3.6 MB',
    updatedAt: '2026-04-14',
    author: 'David Kalu',
    description: 'Cloud migration timeline, database failover clusters, backup retention schedules, and 99.99% uptime SLAs.',
    version: 'v2.0',
    tags: ['Architecture', 'Cloud', 'SLA', 'Databases'],
    barcode: 'DOC-IT-2026-22901',
    sha256Hash: 'sha256:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
    isDigitized: false,
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'David Kalu',
      signerBadgeId: 'OFF-IT-405',
      signedAt: '2026-04-14 09:15:00',
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: 'SIG-IT-DK-0414-229'
    },
    content: `IT DEPARTMENT TECHNICAL SPECS
System Architecture & Availability Guidelines:
- Primary Cloud Region: US-Central
- Secondary Disaster Recovery Region: US-East
- Automated RPO (Recovery Point Objective): 15 minutes.
- RTO (Recovery Time Objective): 1 hour.`
  },

  // LEGAL & COMPLIANCE
  {
    id: 'doc-leg-001',
    title: 'Regulatory Data Privacy Audit (GDPR/CCPA Compliance)',
    fileName: 'Data_Privacy_Compliance_2026.pdf',
    department: 'Legal & Compliance',
    classification: 'Confidential',
    fileSize: '2.9 MB',
    updatedAt: '2026-07-08',
    author: 'Amanda Hayes',
    description: 'Data mapping registry, subject access request metrics, third-party vendor privacy agreements.',
    version: 'v1.2',
    tags: ['Legal', 'Privacy', 'GDPR', 'Compliance'],
    barcode: 'DOC-LEG-2026-88301',
    sha256Hash: 'sha256:1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a',
    isDigitized: true,
    digitizedAt: '2026-07-08 13:40:00',
    digitizedBy: 'Officer Amanda Hayes (OFF-LEG-519)',
    rawSourceType: 'PHYSICAL_PAPER',
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Amanda Hayes',
      signerBadgeId: 'OFF-LEG-519',
      signedAt: '2026-07-08 13:40:00',
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: 'SIG-LEG-AH-0708-883'
    },
    content: `CONFIDENTIAL - LEGAL & COMPLIANCE DEPARTMENT ONLY
2026 Regulatory Audit Report:
- Total Data Subject Requests Processed: 148 (100% fulfilled within 30-day window).
- Data Protection Impact Assessment (DPIA): Complete for cloud file manager.
- Vendor Privacy Binding Agreements: 100% signed across active software vendors.
- Regulatory Risk Assessment: LOW.`
  },
  {
    id: 'doc-leg-002',
    title: 'Master Service Agreement (MSA) Standard Contract Clauses',
    fileName: 'MSA_Standard_Contract_Template_2026.docx',
    department: 'Legal & Compliance',
    classification: 'Internal',
    fileSize: '1.5 MB',
    updatedAt: '2026-02-19',
    author: 'Amanda Hayes',
    description: 'Approved indemnification, liability limitation, intellectual property, and arbitration clauses.',
    version: 'v4.0',
    tags: ['Legal', 'Contracts', 'MSA', 'Templates'],
    barcode: 'DOC-LEG-2026-77109',
    sha256Hash: 'sha256:4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d',
    isDigitized: false,
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: 'Amanda Hayes',
      signerBadgeId: 'OFF-LEG-519',
      signedAt: '2026-02-19 15:20:00',
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: 'SIG-LEG-AH-0219-771'
    },
    content: `LEGAL DEPARTMENT TEMPLATE
Standard Contract Terms:
- Standard Limitation of Liability: Capped at 12 months fees paid.
- Governing Law: State of Delaware.
- Dispute Resolution: Binding AAA arbitration prior to court filings.`
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-07-31 11:42:05',
    userName: 'Commissioner Sarah Vance',
    role: 'Commissioner',
    userDepartment: 'All',
    action: 'VIEW',
    targetDocumentId: 'doc-fin-001',
    targetDocumentTitle: 'Q3 Financial Revenue Audit & Variance Report',
    targetDepartment: 'Finance',
    status: 'GRANTED',
    details: 'Universal Commissioner Clearance Granted',
    ipAddress: '10.240.12.89'
  },
  {
    id: 'log-102',
    timestamp: '2026-07-31 11:45:12',
    userName: 'Officer Robert Chen',
    role: 'Officer',
    userDepartment: 'Finance',
    action: 'VIEW',
    targetDocumentId: 'doc-fin-001',
    targetDocumentTitle: 'Q3 Financial Revenue Audit & Variance Report',
    targetDepartment: 'Finance',
    status: 'GRANTED',
    details: 'Department Match: Finance = Finance',
    ipAddress: '10.240.14.22'
  },
  {
    id: 'log-103',
    timestamp: '2026-07-31 11:48:30',
    userName: 'Officer Robert Chen',
    role: 'Officer',
    userDepartment: 'Finance',
    action: 'ACCESS_DENIED',
    targetDocumentId: 'doc-hr-001',
    targetDocumentTitle: 'Q2 Employee Performance Evaluations & Promotion List',
    targetDepartment: 'HR',
    status: 'DENIED',
    details: 'RBAC Policy Violation: Finance Officer attempted to access HR file',
    ipAddress: '10.240.14.22'
  },
  {
    id: 'log-104',
    timestamp: '2026-07-31 11:52:10',
    userName: 'Officer Marcus Brody',
    role: 'Officer',
    userDepartment: 'Operations',
    action: 'AI_QUERY',
    targetDepartment: 'HR',
    status: 'DENIED',
    details: 'AI Access Controller blocked prompt requesting HR salary information',
    ipAddress: '10.240.18.50'
  }
];
