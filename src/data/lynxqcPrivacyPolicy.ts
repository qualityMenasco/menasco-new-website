/**
 * LYNXqc Privacy Policy — full text transcribed verbatim from the supplied
 * LYNXqc_PrivacyPolicy.html source (English only; see LynxqcPrivacyPolicyPage
 * for why no Arabic legal translation is provided). Wording is preserved
 * exactly; only markup/structure was adapted to render through the site's
 * existing typography components. `**...**` marks inline emphasis matching
 * the source's <strong> spans.
 */

export const lynxqcPrivacyPolicyLastUpdated = 'June 2026';
export const lynxqcPrivacyPolicyContactEmail = 'quality@menascouae.com';

export type PolicyBlock = { type: 'p'; text: string } | { type: 'list'; items: string[] };

export interface LynxqcPolicySubsection {
  heading?: string;
  blocks: PolicyBlock[];
}

export interface LynxqcPolicySection {
  heading: string;
  blocks?: PolicyBlock[];
  subsections?: LynxqcPolicySubsection[];
}

export const lynxqcPrivacyPolicySections: LynxqcPolicySection[] = [
  {
    heading: '1. Who We Are',
    blocks: [
      {
        type: 'p',
        text: 'LYNXqc is a construction site reporting and quality management platform used by authorized employees, contractors, consultants, clients, and project stakeholders participating in managed construction and engineering projects.',
      },
      {
        type: 'p',
        text: 'This Privacy Policy explains what information we collect, why we collect it, how it is used, how long it is retained, and your rights regarding your personal information.',
      },
    ],
  },
  {
    heading: '2. Information We Collect',
    subsections: [
      {
        heading: 'Account Information',
        blocks: [
          { type: 'p', text: 'When you create or are assigned an account, we collect:' },
          { type: 'list', items: ['Full name', 'Email address', 'User role and permissions', 'Organization and project assignments'] },
        ],
      },
      {
        heading: 'Device Information',
        blocks: [
          { type: 'p', text: 'To operate the application and deliver notifications, we collect:' },
          {
            type: 'list',
            items: ['Device type and operating system', 'Application version', 'Push notification token', 'OTA update identifiers', 'Device-generated timestamps'],
          },
        ],
      },
      {
        heading: 'Usage and Session Information',
        blocks: [
          {
            type: 'p',
            text: 'To support platform administration, performance monitoring, security, adoption reporting, and operational analytics, LYNXqc collects limited usage and session information, including:',
          },
          {
            type: 'list',
            items: [
              'Login and logout timestamps',
              'Session duration',
              'Features and screens accessed within the application',
              'Actions performed within the platform',
              'Device-generated activity timestamps',
            ],
          },
          {
            type: 'p',
            text: 'This information is used exclusively for internal reporting, platform administration, security monitoring, product improvement, and operational decision-making.',
          },
        ],
      },
      {
        heading: 'Project and Site Information',
        blocks: [
          { type: 'p', text: 'When using the platform, we collect information necessary to create, manage, and track project records, including:' },
          {
            type: 'list',
            items: [
              'Snag reports',
              'Snag photographs and attachments',
              'Comments and responses',
              'Status updates',
              'Project locations and descriptions entered by users',
              'Workflow assignments and approvals',
            ],
          },
        ],
      },
      {
        heading: 'Voice Notes',
        blocks: [
          { type: 'p', text: 'When you choose to record a voice note, we collect:' },
          { type: 'list', items: ['Voice recordings', 'AI-generated transcriptions of those recordings'] },
        ],
      },
      {
        heading: 'Activity and Audit Information',
        blocks: [
          { type: 'p', text: 'To maintain project accountability and governance, we collect:' },
          { type: 'list', items: ['Records you create', 'Status changes', 'Assignment history', 'Approval actions', 'Audit trail events associated with your account'] },
        ],
      },
    ],
  },
  {
    heading: '3. Purpose of Data Collection',
    blocks: [
      { type: 'p', text: 'We collect and process information solely to provide the services offered by LYNXqc, including:' },
      {
        type: 'list',
        items: [
          'Creating and managing snag reports',
          'Routing issues to responsible engineers, contractors, or reviewers',
          'Sending workflow notifications and reminders',
          'Maintaining project records and audit trails',
          'Supporting quality assurance and project governance requirements',
          'Generating reports and project documentation',
          'Diagnosing technical issues and improving platform reliability',
          'Processing voice notes into written snag descriptions',
          'Measuring platform adoption, usage trends, and operational effectiveness through internal usage reporting',
        ],
      },
      {
        type: 'p',
        text: 'We do not collect information for advertising, behavioral profiling, marketing analytics, or any purpose unrelated to project delivery and management.',
      },
    ],
  },
  {
    heading: '4. Camera, Microphone, and Media Access',
    blocks: [{ type: 'p', text: 'LYNXqc requests access to your device only when you explicitly use a related feature.' }],
    subsections: [
      { heading: 'Camera Access', blocks: [{ type: 'p', text: 'Used to capture photographs and documentation related to project issues, inspections, and snag reports.' }] },
      { heading: 'Photo Library Access', blocks: [{ type: 'p', text: 'Used when you choose to attach existing images or documents to a report.' }] },
      {
        heading: 'Microphone Access',
        blocks: [
          { type: 'p', text: 'Used exclusively to record voice notes that are converted into text and attached to snag reports.' },
          { type: 'p', text: 'LYNXqc does not access your camera, microphone, photo library, contacts, or media files in the background.' },
        ],
      },
    ],
  },
  {
    heading: '5. Data Sharing and Processing',
    subsections: [
      {
        heading: 'No Sale, Sharing, or Commercial Distribution of Personal Information',
        blocks: [
          {
            type: 'p',
            text: 'LYNXqc does not sell, rent, trade, license, monetize, distribute, or otherwise disclose personal information to advertisers, marketing companies, data brokers, or unrelated third parties.',
          },
          {
            type: 'p',
            text: 'Information collected through the platform, including account information, project records, photographs, voice notes, audit trails, usage analytics, and session activity, is used exclusively for:',
          },
          { type: 'list', items: ['Operation of the platform', 'Project delivery and management', 'Security and compliance', 'Internal reporting and analytics', 'Product maintenance and improvement'] },
          {
            type: 'p',
            text: 'Usage statistics, session activity, and platform analytics are reviewed solely by authorized personnel for internal operational purposes and are not shared with external organizations except where required by law or necessary to provide the services described in this policy.',
          },
        ],
      },
      {
        heading: 'Service Providers',
        blocks: [
          {
            type: 'p',
            text: 'LYNXqc utilizes third-party infrastructure, hosting, storage, notification, analytics, artificial intelligence, and technology service providers that support the operation of the platform.',
          },
          {
            type: 'p',
            text: 'These providers may process information solely as necessary to deliver their services on our behalf and are contractually or operationally restricted from using your information for their own advertising, marketing, or commercial purposes.',
          },
          {
            type: 'p',
            text: 'We require service providers to maintain appropriate security measures and to process information only for purposes related to the operation, maintenance, security, and improvement of the platform.',
          },
        ],
      },
    ],
  },
  {
    heading: '6. Who Can Access Your Information',
    blocks: [
      { type: 'p', text: 'Access to information is controlled through role-based permissions. Depending on your role, information may be visible to:' },
      {
        type: 'list',
        items: ['Administrators', 'Project Managers', 'QA/QC Personnel', 'Engineers', 'Assigned Contractors', 'Authorized Client Representatives', 'Other users explicitly granted access within a project'],
      },
      {
        type: 'p',
        text: 'Authorized system administrators and support personnel may access records when required for operational, security, compliance, maintenance, or support purposes.',
      },
    ],
  },
  {
    heading: '7. Data Retention',
    subsections: [
      {
        heading: 'Account Information',
        blocks: [{ type: 'p', text: 'Account information is retained while your account remains active. If your account is deleted, personal account information will be removed in accordance with Section 9 of this policy.' }],
      },
      {
        heading: 'Project Records',
        blocks: [
          {
            type: 'p',
            text: 'Project records, including snag reports, photographs, comments, assignments, audit trails, and status histories, are retained until the associated project is deleted or otherwise removed by the project owner or administrator.',
          },
        ],
      },
      {
        heading: 'Voice Notes',
        blocks: [
          {
            type: 'p',
            text: 'Voice recordings are retained for a maximum of **48 hours**. This temporary retention period exists solely to support offline operation and synchronization when a device is not connected to the internet.',
          },
          { type: 'p', text: 'After successful upload and transcription, voice recordings are automatically removed. If a device remains offline for more than 48 hours:' },
          {
            type: 'list',
            items: [
              'The pending voice recording may be permanently deleted.',
              'Associated snag records relying on that voice recording may fail to save.',
              'Users should ensure internet connectivity within 48 hours of creating voice-based reports.',
            ],
          },
          { type: 'p', text: 'Text transcriptions generated from voice notes may remain attached to the associated snag report as part of the project record.' },
        ],
      },
      {
        heading: 'Session and Usage Information',
        blocks: [
          {
            type: 'p',
            text: 'Session logs, usage analytics, and platform activity reporting data are retained for **24 months** from the date of collection, solely for operational reporting, security monitoring, platform administration, adoption measurement, trend analysis, auditing, and product improvement purposes.',
          },
        ],
      },
    ],
  },
  {
    heading: '8. Security',
    blocks: [
      {
        type: 'p',
        text: 'We implement reasonable administrative, technical, and organizational safeguards to protect information against unauthorized access, disclosure, alteration, or destruction. Security measures include:',
      },
      { type: 'list', items: ['Encryption in transit (TLS)', 'Encryption at rest', 'Role-based access controls', 'Authentication and authorization controls', 'Audit logging', 'Access control and permission management'] },
      { type: 'p', text: 'While we strive to protect information, no method of electronic transmission or storage can be guaranteed to be completely secure.' },
    ],
  },
  {
    heading: '9. Right to Be Forgotten and Account Deletion',
    blocks: [
      { type: 'p', text: "Users may request deletion of their personal account information at any time by using the **Delete Profile** option located within the application's Profile section." },
      { type: 'p', text: 'When an account is deleted, the following personal information will be permanently removed:' },
      { type: 'list', items: ['Name', 'Email address', 'Authentication credentials', 'User profile information', 'Notification tokens'] },
    ],
    subsections: [
      {
        heading: 'Project Records and Audit History',
        blocks: [
          {
            type: 'p',
            text: 'Deletion of an account does not remove project records, snag reports, approvals, comments, assignments, or audit trail entries associated with ongoing or historical projects. These records are retained to preserve project integrity, contractual obligations, compliance requirements, and the accuracy of project audit histories.',
          },
          {
            type: 'p',
            text: 'Where account information is removed, project records may continue to display historical actions performed by the deleted account for audit and governance purposes.',
          },
        ],
      },
    ],
  },
  {
    heading: '10. Your Rights',
    blocks: [
      { type: 'p', text: 'Subject to applicable laws and project requirements, you may have the right to:' },
      { type: 'list', items: ['Access your personal information', 'Correct inaccurate information', 'Delete your account information', 'Request information regarding how your data is processed'] },
      { type: 'p', text: 'Requests relating to project records may be subject to contractual, legal, operational, or compliance obligations.' },
    ],
  },
  {
    heading: '11. Changes to This Policy',
    blocks: [{ type: 'p', text: 'We may update this Privacy Policy from time to time. Updated versions will be published within the application and will become effective upon publication.' }],
  },
  {
    heading: '12. Contact Information',
    blocks: [{ type: 'p', text: 'For privacy-related questions or requests, please contact:' }],
  },
];
