export type Role = 'Officer' | 'Commissioner' | 'Citizen';

export type Department = 
  | 'Finance'
  | 'HR'
  | 'Operations'
  | 'IT & Security'
  | 'Legal & Compliance'
  | 'Public Services';

export type Classification = 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'Top Secret';

export interface UserSession {
  userName: string;
  role: Role;
  department: Department | '' | 'All' | string;
  title?: string;
  badgeId?: string;
  email?: string;
  govId?: string;
  aadhaarRedacted?: string;
  kycVerified?: boolean;
  mfaVerified?: boolean;
  parichayToken?: string;
  ssoProvider?: 'PARICHAY_SSO' | 'NIC_E_PRAMAAN' | 'CITIZEN_AADHAAR_KYC' | 'MASTER_KEY';
}

export interface TransferRecord {
  id: string;
  fromUser: string;
  fromBadgeId: string;
  fromDepartment: Department | string;
  toUser: string;
  toBadgeId: string;
  toDepartment: Department | string;
  timestamp: string;
  payloadHash: string;
  barcode: string;
  notes?: string;
  status: 'DELIVERED' | 'VERIFIED' | 'TAMPER_ALERT';
}

export interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  department: Department;
  classification: Classification;
  fileSize: string;
  updatedAt: string;
  author: string;
  description: string;
  content: string;
  tags: string[];
  version: string;
  downloadUrl?: string;
  
  // Anti-Tamper & Digitization Fields
  barcode: string; // Auto-generated unique barcode ID e.g. DOC-DIGI-882194
  sha256Hash: string; // SHA-256 cryptographic hash of exact document text & signature
  digitalSignature: {
    signerName: string;
    signerBadgeId: string;
    signedAt: string;
    signatureAlgorithm: string; // e.g., RSA-2048 / HMAC-SHA256
    signatureKey: string;
  };
  isDigitized: boolean; // True if scanned/digitized from physical/raw document
  digitizedAt?: string;
  digitizedBy?: string;
  rawSourceType?: 'PHYSICAL_PAPER' | 'SCANNED_PDF' | 'HANDWRITTEN_MEMO' | 'DISPATCH_ORDER' | 'DIRECT_DIGITAL';
  tamperStatus: 'SEALED_INTACT' | 'TAMPER_DETECTED';
  transferHistory?: TransferRecord[];
  
  // Recipient Barcode Verification
  assignedToUser?: string;
  assignedToBadgeId?: string;
  isPendingVerification?: boolean;
  verifiedByUsers?: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  role: Role;
  userDepartment: string;
  action: 
    | 'VIEW' 
    | 'SEARCH' 
    | 'AI_QUERY' 
    | 'DOWNLOAD' 
    | 'UPLOAD' 
    | 'ACCESS_DENIED'
    | 'SCAN_DIGITIZE'
    | 'TRANSFER_DISPATCH'
    | 'TAMPER_CHECK_PASS'
    | 'TAMPER_CHECK_FAIL';
  targetDocumentId?: string;
  targetDocumentTitle?: string;
  targetDepartment?: Department | string;
  status: 'GRANTED' | 'DENIED' | 'FILTERED';
  details: string;
  ipAddress: string;
  barcode?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  accessCheck?: {
    evaluatedRole: Role;
    evaluatedDept: string;
    requestedDept?: string;
    granted: boolean;
    denialReason?: string;
    inspectedPolicyRule?: string;
  };
  sourcesCited?: Array<{
    documentId: string;
    title: string;
    department: Department;
  }>;
}

export interface SecurityMetrics {
  totalRequests: number;
  grantedCount: number;
  deniedCount: number;
  activeComplianceScore: number;
  recentViolations: AuditLog[];
}
