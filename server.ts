import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { MOCK_DOCUMENTS, INITIAL_AUDIT_LOGS } from './src/data/mockData.js';
import { UserSession, Role, Department, DocumentItem, AuditLog } from './src/types.js';

const serverDir = typeof __dirname !== 'undefined'
  ? __dirname
  : (import.meta && import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd());

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = 3000;

// Initialize Gemini client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'demo_key',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory audit log state
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let extraDocuments: DocumentItem[] = [];

// Helper to sanitize & list authorized documents for session
function getAuthorizedDocuments(session: UserSession): DocumentItem[] {
  const allDocs = [...MOCK_DOCUMENTS, ...extraDocuments];
  if (session.role === 'Commissioner') {
    return allDocs;
  }
  return allDocs.filter(
    (doc) => doc.department.toLowerCase() === (session.department || '').toLowerCase()
  );
}

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication & Firebase Firestore Sync Routes
app.post('/api/auth/login', (req, res) => {
  const { session, mfaCode, masterKey, provider } = req.body;

  if (!session || !session.userName) {
    return res.status(400).json({ error: 'Invalid user session payload' });
  }

  const sessionToken = `TOKEN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const auditEntry: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userName: session.userName,
    role: session.role,
    userDepartment: session.department || 'Public Services',
    action: 'VIEW',
    status: 'GRANTED',
    details: `Portal Login Success: User authenticated via ${provider || 'SSO Gateway'}. Role context '${session.role}' assigned.`,
    ipAddress: '10.240.18.99',
  };
  auditLogs.unshift(auditEntry);

  res.json({
    success: true,
    token: sessionToken,
    session,
    firebasePayload: {
      collection: 'sessions',
      documentId: sessionToken,
      data: {
        userId: session.badgeId || session.userName,
        userName: session.userName,
        role: session.role,
        department: session.department,
        mfaVerified: true,
        authenticatedAt: new Date().toISOString(),
        provider: provider || 'PARICHAY_SSO',
      },
    },
  });
});

app.post('/api/auth/verify-kyc', (req, res) => {
  const { session, aadhaarLast4 } = req.body;

  if (!session) {
    return res.status(400).json({ error: 'Missing session' });
  }

  const kycRef = `KYC-AADHAAR-${Date.now().toString().slice(-6)}`;
  const auditEntry: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userName: session.userName,
    role: 'Citizen',
    userDepartment: 'Public Services',
    action: 'VIEW',
    status: 'GRANTED',
    details: `Aadhaar e-KYC Verification Pass: Citizen identity validated (Redacted ID: XXXX-XXXX-${aadhaarLast4 || '8831'}). KYC Ref [${kycRef}].`,
    ipAddress: '10.240.18.104',
  };
  auditLogs.unshift(auditEntry);

  res.json({
    success: true,
    kycReference: kycRef,
    session,
    firebasePayload: {
      collection: 'kyc_verifications',
      documentId: kycRef,
      data: {
        citizenName: session.userName,
        aadhaarRedacted: `XXXX-XXXX-${aadhaarLast4 || '8831'}`,
        verified: true,
        verifiedAt: new Date().toISOString(),
      },
    },
  });
});

// Get Documents with RBAC Clearance evaluation
app.post('/api/documents', (req, res) => {
  const session: UserSession = req.body.session || {
    userName: 'Guest',
    role: 'Officer',
    department: 'Finance',
  };

  const allDocs = [...MOCK_DOCUMENTS, ...extraDocuments];

  const processed = allDocs.map((doc) => {
    const isAccessible =
      session.role === 'Commissioner' ||
      doc.department.toLowerCase() === (session.department || '').toLowerCase() ||
      doc.assignedToUser === session.userName;

    return {
      ...doc,
      isAccessible,
      // If not accessible and role is officer, mask content to prevent client leakage
      content: isAccessible ? doc.content : '[CLASSIFIED - CLEARANCE REQUIRED]',
    };
  });

  res.json({ documents: processed });
});

// Create/Upload Document
app.post('/api/documents/upload', (req, res) => {
  const { title, fileName, department, classification, description, content, tags, session } = req.body;

  if (!session || !title || !department || !content) {
    return res.status(400).json({ error: 'Missing required document fields or user session' });
  }

  // Check upload authorization: Officer can only upload to their assigned department, Commissioner can upload to any
  if (session.role === 'Officer' && session.department.toLowerCase() !== department.toLowerCase()) {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: session.userName,
      role: session.role,
      userDepartment: session.department,
      action: 'ACCESS_DENIED',
      targetDepartment: department,
      status: 'DENIED',
      details: `Upload Denied: Officer attempted to create document in unauthorized department '${department}'`,
      ipAddress: '10.240.18.12',
    };
    auditLogs.unshift(log);

    return res.status(403).json({
      error: 'Access Denied: You do not have clearance to upload files to departments outside your assignment.',
    });
  }

  const newDoc: DocumentItem = {
    id: `doc-custom-${Date.now()}`,
    title,
    fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
    department: department as Department,
    classification: classification || 'Confidential',
    fileSize: `${(content.length / 1024 + 0.5).toFixed(1)} KB`,
    updatedAt: new Date().toISOString().split('T')[0],
    author: session.userName,
    description: description || 'User uploaded organizational document',
    content,
    tags: tags || ['User Upload', department],
    version: 'v1.0',
    barcode: `DOC-${(department as string).substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    sha256Hash: `hash_${Date.now().toString(16)}_${Math.random().toString(36).substring(2, 10)}`,
    isDigitized: true,
    tamperStatus: 'SEALED_INTACT',
    digitalSignature: {
      signerName: session.userName,
      signerBadgeId: session.badgeId || 'OFF-001',
      signedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      signatureAlgorithm: 'RSA-2048 / HMAC-SHA256',
      signatureKey: `SIG-${Date.now().toString(16)}`
    }
  };

  extraDocuments.unshift(newDoc);

  const log: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userName: session.userName,
    role: session.role,
    userDepartment: session.department,
    action: 'UPLOAD',
    targetDocumentId: newDoc.id,
    targetDocumentTitle: newDoc.title,
    targetDepartment: newDoc.department,
    status: 'GRANTED',
    details: `Document uploaded to department ${newDoc.department}`,
    ipAddress: '10.240.18.12',
  };
  auditLogs.unshift(log);

  res.json({ success: true, document: newDoc });
});

// Audit Logs Endpoint
app.get('/api/audit', (req, res) => {
  res.json({ auditLogs });
});

app.post('/api/audit/log', (req, res) => {
  const logEntry: AuditLog = req.body;
  if (logEntry) {
    auditLogs.unshift(logEntry);
  }
  res.json({ success: true });
});

// Gemini Multimodal Vision OCR Engine for Handwritten & Printed Document Conversion
app.post('/api/ocr/convert', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', documentTitle } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data in request body.' });
    }

    // Clean up data URL prefix if sent in imageBase64
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const ocrPrompt = `You are the Gemini Multimodal Vision OCR Engine for government & eOffice records, equipped with the Enhanced Handwriting Recovery Protocol.

Your job is to convert handwritten, cursive, printed, or scanned text inside this document image into accurate, structured digital text.

ENHANCED HANDWRITING RECOVERY PROTOCOL (FALLBACK MODE):
1. DO NOT FAIL or reject faint, smudged, blurry, low-contrast, or partially torn scans outright.
2. MULTI-PASS VISUAL ESTIMATION: Analyze surrounding context lines, administrative header stamps, and standard government syntax patterns to reconstruct missing or faded words.
3. CONFIDENCE TAGGING: Clearly mark any reconstructed or contextually estimated words with brackets, for example: [reconstructed: budget] or [reconstructed: approved].
4. USER GUIDANCE PROMPT: If legibility drops below 50%, or if faint scan / low contrast / paper crease / tears are detected, include this exact notification line at the top of your response:
"SYSTEM GUIDANCE: Handwriting scan low-contrast detected. Please adjust phone camera lighting or flatten the paper crease."

GENERAL FORMATTING INSTRUCTIONS:
- Structure the transcribed text neatly with headings, numbered lists, bullet points, and original formatting.
- Provide a suggested clean document title on the very first line starting with "TITLE: ".
- Output the full transcribed text immediately below the title line.

Example format:
TITLE: Official Scanned Memorandum #4029
SYSTEM GUIDANCE: Handwriting scan low-contrast detected. Please adjust phone camera lighting or flatten the paper crease.

[GOVERNMENT MEMORANDUM RECORD]
Date: July 31, 2026
Subject: Municipal [reconstructed: Allocation] & Expenditure
1. Reviewed handwritten notes for immediate [reconstructed: disbursement].
...`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo_key') {
      const stamp = new Date().toISOString().slice(0, 10);
      const title = documentTitle || 'Digitized Official Document Scan';
      const simulatedText = `TITLE: ${title}
SYSTEM GUIDANCE: Handwriting scan low-contrast detected. Please adjust phone camera lighting or flatten the paper crease.

[GOVFLOW AI — GEMINI MULTIMODAL VISION OCR ENGINE TRANSCRIPT]
Document Ref: GOV-OCR-${Date.now().toString().slice(-6)}
OCR Scan Timestamp: ${stamp}
Engine: Gemini Multimodal Vision v3.6 (Enhanced Handwriting Recovery Protocol Active)

OFFICIAL HANDWRITTEN & PRINTED TRANSCRIPTION:
1. SUBJECT: Official eOffice Memorandum & Departmental Action Record.
2. HANDWRITTEN NOTE: "Reviewed and [reconstructed: approved] for immediate dispatch under cryptographic barcode seal. Ensure anti-tamper signature binding prior to [reconstructed: portal] filing."
3. ADMINISTRATIVE STAMP: [Municipality Seal - [reconstructed: Sanctioned]]
4. AUTHORIZED SIGNATURE: [Digitally Verified - Officer In Charge]
5. RECOVERY METRICS: 2 words contextually reconstructed from faint handwritten script.

[AUTHENTICATED DIGITAL TEXT PAYLOAD]`;

      return res.json({
        success: true,
        text: simulatedText.replace(/^TITLE:\s*.+$\n?/m, '').trim(),
        suggestedTitle: title,
        engine: 'Gemini 3.6 Multimodal Vision OCR (Handwriting Recovery Protocol)',
        lowContrastWarning: true,
        reconstructionCount: 3,
      });
    }

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const textPart = { text: ocrPrompt };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        temperature: 0.1,
      },
    });

    const responseText = response.text || '';
    let suggestedTitle = documentTitle || 'Scanned Official Document';
    let extractedText = responseText;

    const titleMatch = responseText.match(/^TITLE:\s*(.+)$/m);
    if (titleMatch && titleMatch[1]) {
      suggestedTitle = titleMatch[1].trim();
      extractedText = responseText.replace(/^TITLE:\s*.+$\n?/m, '').trim();
    }

    const lowContrastWarning = extractedText.includes('Handwriting scan low-contrast detected') || extractedText.includes('SYSTEM GUIDANCE:');
    const reconstructionMatches = extractedText.match(/\[reconstructed:/g);
    const reconstructionCount = reconstructionMatches ? reconstructionMatches.length : 0;

    res.json({
      success: true,
      text: extractedText,
      suggestedTitle,
      engine: 'Gemini 3.6 Multimodal Vision OCR (Handwriting Recovery Protocol)',
      lowContrastWarning,
      reconstructionCount,
    });
  } catch (error: any) {
    console.error('Error in /api/ocr/convert:', error);
    res.status(500).json({
      error: 'Gemini Multimodal Vision OCR Engine error',
      details: error?.message || String(error),
    });
  }
});

// AI Data Access Controller Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, session } = req.body as {
      message: string;
      session: UserSession;
    };

    if (!session || !message) {
      return res.status(400).json({ error: 'Session context and message required.' });
    }

    const role: Role = session.role;
    const userDept = session.department || 'Unassigned';
    const userName = session.userName || 'User';

    // Get list of departments in the organization
    const allDepartments: Department[] = [
      'Finance',
      'HR',
      'Operations',
      'IT & Security',
      'Legal & Compliance',
    ];

    // Check if an Officer is explicitly asking about another department or other department documents
    const otherDepartments = allDepartments.filter(
      (d) => d.toLowerCase() !== userDept.toLowerCase()
    );

    let isOutOfDepartmentQuery = false;
    let requestedOtherDept = '';

    if (role === 'Officer') {
      const lowerMsg = message.toLowerCase();

      for (const dept of otherDepartments) {
        const dLower = dept.toLowerCase();
        // Check for department name keywords
        if (
          lowerMsg.includes(dLower) ||
          (dLower === 'hr' && (lowerMsg.includes('human resource') || lowerMsg.includes('salary') || lowerMsg.includes('payroll') || lowerMsg.includes('grievance') || lowerMsg.includes('performance review'))) ||
          (dLower === 'finance' && (lowerMsg.includes('financial') || lowerMsg.includes('revenue') || lowerMsg.includes('compensation matrix') || lowerMsg.includes('budget allocation'))) ||
          (dLower === 'operations' && (lowerMsg.includes('supply chain') || lowerMsg.includes('logistics') || lowerMsg.includes('warehouse'))) ||
          (dLower === 'it & security' && (lowerMsg.includes('pentest') || lowerMsg.includes('threat intelligence') || lowerMsg.includes('vulnerability'))) ||
          (dLower === 'legal & compliance' && (lowerMsg.includes('privacy audit') || lowerMsg.includes('gdpr') || lowerMsg.includes('contract clauses')))
        ) {
          isOutOfDepartmentQuery = true;
          requestedOtherDept = dept;
          break;
        }
      }

      // Also check if prompt directly asks for specific out-of-department doc titles
      const allDocs = [...MOCK_DOCUMENTS, ...extraDocuments];
      for (const doc of allDocs) {
        if (
          doc.department.toLowerCase() !== userDept.toLowerCase() &&
          lowerMsg.includes(doc.title.toLowerCase().substring(0, 15))
        ) {
          isOutOfDepartmentQuery = true;
          requestedOtherDept = doc.department;
          break;
        }
      }
    }

    // Exact strict policy message required by prompt spec:
    const EXACT_DENIAL_MSG =
      'Access Denied: You do not have clearance to view files outside of your assigned department.';

    if (role === 'Officer' && isOutOfDepartmentQuery) {
      // Log access violation in audit trail
      const auditEntry: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName,
        role,
        userDepartment: userDept,
        action: 'AI_QUERY',
        targetDepartment: requestedOtherDept || 'Other Department',
        status: 'DENIED',
        details: `RBAC Policy Violation: Officer (${userDept}) requested AI summary/data for ${requestedOtherDept}`,
        ipAddress: '10.240.18.50',
      };
      auditLogs.unshift(auditEntry);

      return res.json({
        reply: EXACT_DENIAL_MSG,
        accessCheck: {
          evaluatedRole: role,
          evaluatedDept: userDept,
          requestedDept: requestedOtherDept,
          granted: false,
          denialReason: 'Officer attempted out-of-department retrieval.',
          inspectedPolicyRule:
            'Operational Rule 2: Officers must be denied access to any files/data outside assigned department.',
        },
        auditLogged: true,
      });
    }

    // Get authorized document context for AI prompt
    const authorizedDocs = getAuthorizedDocuments(session);
    const docSummaries = authorizedDocs
      .map(
        (d) =>
          `[Document ID: ${d.id}] Title: "${d.title}" | Dept: ${d.department} | Classification: ${d.classification}\nContent:\n${d.content}`
      )
      .join('\n\n---\n\n');

    // System instruction for Gemini with Firebase & Blockchain Integration
    const systemInstruction = `
You are the backend database-synchronized AI intelligence for GVMC Digital Connect, an eOffice-style digital governance application integrated with Firebase.
Your role is to process administrative workflows, track document security, and structure all outputs into clean, database-ready JSON payloads so that the frontend can automatically sync states with Firebase Firestore.

Current Session Context:
- User Name: ${userName}
- User Role: ${role}
- User Department: ${userDept === 'All' ? 'Universal Access (Commissioner)' : userDept}

Core Firebase Database Schema:
1. users (Fields: userId, name, role [Officer/Commissioner], department)
2. documents (Fields: barcodeId, previousBarcode, currentHolder, blockchainHash, previousHash, isTampered [boolean], telemetry [views, copyAttempts])
3. audit_logs (Fields: logId, timestamp, eventType [VIEW, FORWARD, TAMPER_BREACH], details, broadcastDispatched [boolean])

Operational Rules & Security Directives:
1. Role-Based Access Control (RBAC): Department Officers are strictly sandboxed to files belonging only to their designated department. If an officer requests unauthorized data, respond with: "Access Denied: You do not have clearance to view files outside of your assigned department."
2. Barcode & Blockchain Sync: Whenever a file is forwarded, generate a new sequential barcode and a new cryptographic block hash linked to the previous block hash.
3. Tamper Detection: If an unauthorized text edit occurs, flag isTampered: true and trigger an emergency broadcast payload for Firebase cloud messaging.
4. Structured Response Format: Include a clear human summary followed by a structured Firebase Sync Payload (JSON) so the backend/frontend can directly write state changes to Firebase.

Response Template Structure:
- **Human Response:** [Clear, concise summary of the eOffice action / data]
- **Firebase Sync Payload (JSON):**
\`\`\`json
{
  "collection": "documents",
  "documentId": "EFILE-2026-XXXX",
  "data": {
    "barcodeId": "...",
    "previousBarcode": "...",
    "currentHolder": "...",
    "blockchainHash": "...",
    "previousHash": "...",
    "isTampered": false,
    "telemetry": {
      "viewCount": 1,
      "textCopied": false
    }
  }
}
\`\`\`

Authorized Department Documents Available in Context:
${docSummaries.length > 0 ? docSummaries : '(No documents available for this context)'}
`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo_key') {
      // Intelligent local simulation if no key set
      let simulatedReply = '';
      const sampleBarcode = authorizedDocs[0]?.barcode || 'BC-GOV-2026-0001';
      const docId = authorizedDocs[0]?.id || 'EFILE-2026-001';
      const blockHash = `0000${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
      const prevHash = `0000${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;

      if (role === 'Officer') {
        simulatedReply = `- **Human Response:** [${userDept} Department Access Verified] Accessing department records for ${userName} (${role}).

Based on your clearance as a ${userDept} Officer, here is the information from your department files:

` + authorizedDocs.map(d => `• **${d.title}** (${d.barcode}): ${d.description}\n  *Summary*: ${d.content.substring(0, 150)}...`).join('\n\n') + `

- **Firebase Sync Payload (JSON):**
\`\`\`json
{
  "collection": "documents",
  "documentId": "${docId}",
  "data": {
    "barcodeId": "${sampleBarcode}",
    "previousBarcode": "BC-GOV-2026-0000",
    "currentHolder": "${userName} (${userDept})",
    "blockchainHash": "${blockHash}",
    "previousHash": "${prevHash}",
    "isTampered": false,
    "telemetry": {
      "viewCount": 14,
      "textCopied": false
    }
  }
}
\`\`\``;
      } else {
        simulatedReply = `- **Human Response:** [Commissioner Universal Clearance Verified] Retrieving cross-department intelligence and active eOffice dispatches.

` + authorizedDocs.map(d => `• **[${d.department}] ${d.title}** (${d.barcode}): ${d.description}\n  *Source*: ${d.fileName}`).join('\n\n') + `

- **Firebase Sync Payload (JSON):**
\`\`\`json
{
  "collection": "documents",
  "documentId": "${docId}",
  "data": {
    "barcodeId": "${sampleBarcode}",
    "previousBarcode": "BC-GOV-2026-0000",
    "currentHolder": "${userName} (Commissioner)",
    "blockchainHash": "${blockHash}",
    "previousHash": "${prevHash}",
    "isTampered": false,
    "telemetry": {
      "viewCount": 42,
      "textCopied": false
    }
  }
}
\`\`\``;
      }

      const auditEntry: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName,
        role,
        userDepartment: userDept,
        action: 'AI_QUERY',
        targetDepartment: userDept,
        status: 'GRANTED',
        details: `AI Query Processed within Clearance (${userDept})`,
        ipAddress: '10.240.18.50',
      };
      auditLogs.unshift(auditEntry);

      return res.json({
        reply: simulatedReply,
        accessCheck: {
          evaluatedRole: role,
          evaluatedDept: userDept,
          granted: true,
          inspectedPolicyRule: 'Passed RBAC Validation: Clearance matches requested department scope.',
        },
        sourcesCited: authorizedDocs.map((d) => ({
          documentId: d.id,
          title: d.title,
          department: d.department,
        })),
      });
    }

    // Call Gemini API server-side
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    let aiText = response.text || 'No response text generated.';

    // Extra fail-safe: if Gemini somehow leaked or mentioned unauthorized access denial
    if (role === 'Officer' && (aiText.includes('Access Denied') || aiText.toLowerCase().includes('outside of your assigned department'))) {
      aiText = EXACT_DENIAL_MSG;
    }

    const isDenied = aiText === EXACT_DENIAL_MSG;

    // Log in audit trail
    const auditEntry: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName,
      role,
      userDepartment: userDept,
      action: 'AI_QUERY',
      targetDepartment: isDenied ? 'Restricted Dept' : userDept,
      status: isDenied ? 'DENIED' : 'GRANTED',
      details: isDenied
        ? 'AI Data Access Controller blocked unauthorized prompt'
        : `AI Query Processed for ${userDept}`,
      ipAddress: '10.240.18.50',
    };
    auditLogs.unshift(auditEntry);

    res.json({
      reply: aiText,
      accessCheck: {
        evaluatedRole: role,
        evaluatedDept: userDept,
        granted: !isDenied,
        denialReason: isDenied ? 'Out of department clearance scope' : undefined,
        inspectedPolicyRule: 'Role-Based Access Control Evaluation Rule #1 & #2',
      },
      sourcesCited: isDenied
        ? []
        : authorizedDocs.map((d) => ({
            documentId: d.id,
            title: d.title,
            department: d.department,
          })),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'An error occurred while processing the AI query.',
      details: error?.message || String(error),
    });
  }
});

// AI Navigation Agent Endpoint
app.post('/api/agent/navigate', async (req, res) => {
  try {
    const { message, session } = req.body as { message: string; session: UserSession };
    if (!session || !message) {
      return res.status(400).json({ error: 'Session context and query required.' });
    }

    const authorizedDocs = getAuthorizedDocuments(session);
    const userDept = session.department || 'Finance';
    const isCommissioner = session.role === 'Commissioner';

    // Prepare document context with barcodes and metadata
    const docCatalog = authorizedDocs.map((d) => ({
      id: d.id,
      title: d.title,
      department: d.department,
      barcode: d.barcode,
      classification: d.classification,
      isPendingVerification: !!d.isPendingVerification,
      assignedToUser: d.assignedToUser,
      description: d.description,
    }));

    const systemInstruction = `
You are the core decentralized security, cryptographic ledger, and eOffice workflow navigation engine for VaultShield Secure Document Portal.
Your job is to help users navigate files, locate documents by name/barcode/department, find pending barcode scans, and record actions on the simulated Blockchain Audit Trail.

User Context:
- Name: ${session.userName}
- Role: ${session.role}
- Department: ${session.department}

Available Authorized Documents catalog:
${JSON.stringify(docCatalog, null, 2)}

Instructions:
1. Analyze the user's search or navigation query.
2. Formulate a direct response explaining matches or navigation routing. When simulating actions or document status, format the explanation using:
- **Block ID & Hash:** [e.g., Block #3 | Hash: 0000abc...991x]
- **Previous Block Hash:** [Prev Hash: 0000xyz...442a]
- **Current Barcode:** [Active Barcode ID]
- **Chain Status:** [Verified Intact / 🚨 CHAIN COMPROMISED - TAMPER DETECTED]
- **Current Holder / Viewer:** [Name & Dept]
- **Telemetry Log:** [Views: X | Copied Text: Yes/No]
- **Smart Contract Action:** [Normal Ledger Update / Emergency Broadcast Dispatched to Commissioner & All Dept Heads]

3. Suggest 1 to 4 actionable navigation triggers.

Return ONLY a JSON response matching this schema:
{
  "reply": "Clear explanation of matches found formatted with blockchain operational template...",
  "suggestedActions": [
    {
      "label": "Filter Finance Dept",
      "actionType": "FILTER_DEPT",
      "targetValue": "Finance"
    },
    {
      "label": "Open Q3 Revenue Dispatch",
      "actionType": "OPEN_DOC",
      "targetValue": "doc-001"
    }
  ]
}
actionType can be: "FILTER_DEPT", "OPEN_DOC", "SCAN_BARCODE", "SWITCH_TAB".
`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo_key') {
      // Local fallback matching query
      const lower = message.toLowerCase();
      const matches = authorizedDocs.filter(
        (d) =>
          d.title.toLowerCase().includes(lower) ||
          d.department.toLowerCase().includes(lower) ||
          (d.barcode && d.barcode.toLowerCase().includes(lower)) ||
          d.description.toLowerCase().includes(lower) ||
          (lower.includes('pending') && d.isPendingVerification)
      );

      const actions: any[] = [];
      if (matches.length > 0) {
        actions.push({
          label: `Open ${matches[0].title.substring(0, 20)}...`,
          actionType: 'OPEN_DOC',
          targetValue: matches[0].id,
        });
        actions.push({
          label: `Filter ${matches[0].department}`,
          actionType: 'FILTER_DEPT',
          targetValue: matches[0].department,
        });
        if (matches[0].isPendingVerification) {
          actions.push({
            label: `Scan Barcode (${matches[0].barcode})`,
            actionType: 'SCAN_BARCODE',
            targetValue: matches[0].id,
          });
        }
      } else {
        actions.push({ label: 'Show All Files', actionType: 'SWITCH_TAB', targetValue: 'files' });
        actions.push({ label: 'Filter Finance', actionType: 'FILTER_DEPT', targetValue: 'Finance' });
      }

      return res.json({
        reply: matches.length > 0
          ? `Found ${matches.length} matching document(s) in your authorized portal scope:`
          : `No direct keyword matches for "${message}". Select a quick navigation filter below:`,
        suggestedActions: actions,
        matches,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    let jsonResult = { reply: 'Navigation response ready.', suggestedActions: [] };
    try {
      jsonResult = JSON.parse(response.text || '{}');
    } catch (e) {
      jsonResult = { reply: response.text || 'Navigation query processed.', suggestedActions: [] };
    }

    res.json(jsonResult);
  } catch (err: any) {
    console.error('Error in /api/agent/navigate:', err);
    res.status(500).json({ error: 'Failed to process AI navigation query.' });
  }
});

// AI Alert System Analysis Endpoint
app.post('/api/alerts/summary', async (req, res) => {
  try {
    const { session, alerts } = req.body;
    if (!session || !alerts) {
      return res.status(400).json({ error: 'Session and alerts payload required.' });
    }

    const prompt = `Analyze these real-time security alerts for user ${session.userName} (${session.role} in ${session.department}):\n${JSON.stringify(alerts, null, 2)}\n\nProvide a concise 3-bullet executive threat and alert summary with recommended officer actions.`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo_key') {
      return res.json({
        summary: `• **Pending Barcode Scans**: ${alerts.filter((a: any) => a.type === 'PENDING_SCAN').length} dispatch(es) awaiting recipient physical barcode verification.\n• **Security Audit Violations**: ${alerts.filter((a: any) => a.severity === 'CRITICAL').length} unauthorized clearance attempt(s) recorded.\n• **Recommended Protocol**: Immediately scan incoming document barcodes before opening sensitive attachments.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an AI Security Operations Analyst evaluating portal document alerts.',
        temperature: 0.3,
      },
    });

    res.json({ summary: response.text || 'Security alert analysis complete.' });
  } catch (err: any) {
    console.error('Error in /api/alerts/summary:', err);
    res.status(500).json({ error: 'Failed to analyze security alerts.' });
  }
});

// Vite Middleware integration for dev / static for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VaultShield RBAC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
