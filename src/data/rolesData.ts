import { Language, UserRole } from '../types/sdas';

export interface RoleDefinition {
  id: UserRole;
  order: number;
  code: string;
  category: 'national' | 'regional_district' | 'specialist' | 'field' | 'external';
  tierLabel: Record<Language, string>;
  name: Record<Language, string>;
  scope: Record<Language, string>;
  department: string;
  sampleHolder: string;
  assignedArea: string;
  summary: Record<Language, string>;
  visibleModules: string[];
  capabilities: string[];
  permissions: string[];
  restrictions: string[];
  canApproveAddress: boolean;
  canVerifyAddress: boolean;
  canWriteData: boolean;
}

export const ALL_ROLES: RoleDefinition[] = [
  {
    id: 'national_super_admin',
    order: 1,
    code: 'R01',
    category: 'national',
    tierLabel: {
      en: 'Platform Level · Highest Technical Access',
      so: 'Heerka Platform-ka · Awoodda Farsamo ee Ugu Sareysa',
      ar: 'مستوى المنصة · أعلى صلاحية تقنية'
    },
    name: {
      en: 'National Super Administrator',
      so: 'Maamulaha Sare ee Qaranka',
      ar: 'مدير النظام الوطني الأعلى'
    },
    scope: { en: 'Platform Level', so: 'Heer Platform', ar: 'مستوى المنصة' },
    department: 'Technology & Platform Operations',
    sampleHolder: 'Eng. Cabdiraxmaan Maxamed (MOCT)',
    assignedArea: 'Platform-wide Technical Control (Routine Data Masked)',
    summary: {
      en: 'Platform configuration, top-level account security, MFA, API infrastructure, backups, and emergency access.',
      so: 'Habaynta farsamo ee platform-ka, koontooyinka maamulka, amniga MFA, iyo xaaladda degdegga ah.',
      ar: 'تهيئة المنصة الفنية، إدارة الحسابات العليا، المصادقة متعددة العوامل، والوصول الطارئ.'
    },
    visibleModules: [
      'Global System Overview',
      'System Configuration',
      'User Accounts Management',
      'Role & Permission Management',
      'Security Monitoring',
      'Authentication & MFA Management',
      'API Infrastructure',
      'Database & Backup Status',
      'System Logs',
      'Platform Health',
      'Emergency Access Management'
    ],
    capabilities: [
      'Maamuli karo technical configuration-ka platform-ka.',
      'Abuuri karo ama joojin karo administrative accounts.',
      'Maamuli karo system permissions.',
      'Kormeeri karo security incidents.',
      'Maamuli karo infrastructure settings.'
    ],
    permissions: ['platform.config', 'accounts.admin_manage', 'permissions.manage', 'security.monitor', 'break_glass.manage'],
    restrictions: [
      'Ma ansixin karo ama ma daabici karo official addresses.',
      'Hawlaha awoodda sare leh waxay u baahan yihiin dual control iyo hardware MFA.',
      'Xogta caadiga ah ee ciwaanada waa la qariyay ilaa Break-Glass la furo.'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: false
  },
  {
    id: 'national_authority_admin',
    order: 2,
    code: 'R02',
    category: 'national',
    tierLabel: {
      en: 'National Level · National Registry Governance',
      so: 'Heer Qaran · Maamulka Diiwaanka Qaranka',
      ar: 'المستوى الوطني · حوكمة السجل الوطني'
    },
    name: {
      en: 'National Authority Administrator',
      so: 'Maamulaha Hay’adda Qaranka',
      ar: 'مسؤول الهيئة الوطنية'
    },
    scope: { en: 'National Level', so: 'Heer Qaran', ar: 'المستوى الوطني' },
    department: 'Legal & National Registry Governance',
    sampleHolder: 'Xaliimo Axmed Warsame (Custodian)',
    assignedArea: 'All Federal Regions & Districts (Standards & Governance)',
    summary: {
      en: 'National addressing standards, address code rules, departments, national staff, and governance monitoring.',
      so: 'Halbeegyada ciwaanada qaranka, xeerarka koodadka, waaxyaha, shaqaalaha qaranka, iyo warbixinada.',
      ar: 'معايير العنونة الوطنية، قواعد الرموز، الأقسام، الموظفون الوطنيون، وتقارير الحوكمة.'
    },
    visibleModules: [
      'National Overview',
      'National Address Registry',
      'All Regions & Districts',
      'Department Management',
      'National Address Standards',
      'Address Code Management',
      'National Staff Management',
      'Regional Performance',
      'National Reports',
      'Approval Monitoring',
      'Data Quality Overview'
    ],
    capabilities: [
      'Maamuli karo national addressing standards.',
      'Dejinta iyo maamulidda address code rules.',
      'Maamuli karo departments iyo national staff.',
      'Kormeeri karo waxqabadka gobollada.',
      'Diyaarin karo national reports.',
      'Maamuli karo nidaamka guud ee registry governance.'
    ],
    permissions: ['standards.manage', 'code_rules.manage', 'departments.manage', 'staff.national', 'reports.national'],
    restrictions: [
      'Ma ansixin karo shaqadiisa (Self-approval blocked).',
      'Go’aannada saameynta weyn leh waxay u baahan yihiin approver labaad (Dual Control).'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: true
  },
  {
    id: 'director_general',
    order: 3,
    code: 'R03',
    category: 'national',
    tierLabel: {
      en: 'National Level · Executive Authority',
      so: 'Heer Qaran · Awoodda Fulinta Sare',
      ar: 'المستوى الوطني · السلطة التنفيذية'
    },
    name: {
      en: 'Director General',
      so: 'Agaasimaha Guud',
      ar: 'المدير العام'
    },
    scope: { en: 'Executive National', so: 'Agaasinka Guud', ar: 'تنفيذي وطني' },
    department: 'Executive Authority',
    sampleHolder: 'Mudane Maxamed Cali Xasan (DG)',
    assignedArea: 'Federal Republic of Somalia',
    summary: {
      en: 'Executive oversight, official address designation, dual-control countersigning, and publication policy approval.',
      so: 'Ansixinta rasmiga ah ee ciwaanada dowladda, saxiixa laba-geesoodka ah, iyo siyaasadda daabacaadda.',
      ar: 'الرقابة التنفيذية، الاعتماد الرسمي للعناوين، التوقيع المزدوج، وسياسة النشر.'
    },
    visibleModules: [
      'Executive Dashboard',
      'National Performance Overview',
      'Regional Progress',
      'National Coverage Reports',
      'Pending Executive Approvals',
      'Official Address Designation Requests',
      'Publication Requests',
      'Governance Reports',
      'Compliance Overview',
      'Decision History'
    ],
    capabilities: [
      'Ansixin karo official address designation marka shuruudaha iyo awoodda sharci la buuxiyo.',
      'Countersign-gareyn karo go’aannada dual-control.',
      'Ansixin karo publication policy.',
      'Kormeeri karo waxqabadka qaranka.',
      'Go’aan ka gaari karo arrimaha loo soo gudbiyo heerkiisa.'
    ],
    permissions: ['address.designate_official', 'dual_control.countersign', 'publication_policy.approve', 'executive.oversight'],
    restrictions: [
      'Ma aha shaqaale data-entry ah.',
      'Ma samaynayo routine address editing ama field operations.'
    ],
    canApproveAddress: true,
    canVerifyAddress: false,
    canWriteData: false
  },
  {
    id: 'department_admin',
    order: 4,
    code: 'R04',
    category: 'national',
    tierLabel: {
      en: 'Department Level',
      so: 'Heer Waaxeed',
      ar: 'مستوى القسم'
    },
    name: {
      en: 'Department Administrator',
      so: 'Maamulaha Waaxda',
      ar: 'مدير القسم'
    },
    scope: { en: 'Department Level', so: 'Waax Gaar ah', ar: 'مستوى القسم' },
    department: 'Data Quality & Verification Dept',
    sampleHolder: 'Fartuun Cumar Geedi',
    assignedArea: 'Own Department Only (Scoped)',
    summary: {
      en: 'Manages department staff, work queues, task assignments, SLA performance, and escalations within one department.',
      so: 'Maamulka shaqaalaha waaxda, qaybinta shaqooyinka, kormeerka codsiyada, iyo warbixinada waaxda.',
      ar: 'إدارة موظفي القسم وتوزيع المهام ومراقبة الطلبات والتقارير ضمن قسم واحد.'
    },
    visibleModules: [
      'Department Dashboard',
      'Department Address Requests',
      'Department Work Queue',
      'Department Staff',
      'Staff Assignments',
      'Department Reports',
      'Pending Tasks',
      'Department Performance',
      'Escalated Requests',
      'Activity History'
    ],
    capabilities: [
      'Maamuli karo shaqaalaha department-kiisa.',
      'Shaqooyin u qaybin karo staff.',
      'Kormeeri karo address requests.',
      'La socon karo shaqada department-ka.',
      'Diyaarin karo departmental reports.',
      'U gudbin karo arrimaha u baahan go’aan heer sare ah.'
    ],
    permissions: ['dept.staff.manage', 'dept.tasks.assign', 'dept.queue.monitor', 'dept.reports.create', 'dept.escalate'],
    restrictions: [
      'Wuxuu ku kooban yahay department-ka loo xilsaaray.',
      'Ma maamuli karo waaxyo kale ama ma beddeli karo xadka guud ee qaranka.'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: true
  },
  {
    id: 'regional_admin',
    order: 5,
    code: 'R05',
    category: 'regional_district',
    tierLabel: {
      en: 'Regional Level',
      so: 'Heer Gobol (Gobolka Banaadir)',
      ar: 'المستوى الإقليمي'
    },
    name: {
      en: 'Regional Administrator',
      so: 'Maamulaha Gobolka',
      ar: 'مدير الإقليم'
    },
    scope: { en: 'Regional (Banaadir)', so: 'Gobolka Banaadir', ar: 'إقليم بنادر' },
    department: 'Banaadir Regional Administration (BRA)',
    sampleHolder: 'Yuusuf Xasan Nuur (BRA)',
    assignedArea: 'Banaadir Region — 17 Districts',
    summary: {
      en: 'Coordinates all districts in Banaadir, approves & publishes regional addresses, oversees staff, and handles escalations.',
      so: 'Maamulka gobolka, degmooyinka hoos yimaada, ansixinta & daabacaadda ciwaanada, iyo xalinta cabashooyinka.',
      ar: 'إدارة الإقليم والمديريات التابعة واعتماد ونشر العناوين ومعالجة التصعيدات.'
    },
    visibleModules: [
      'Regional Dashboard',
      'Regional Address Registry',
      'Districts Under Region',
      'District Performance',
      'Regional Address Requests',
      'Regional Verification Queue',
      'Regional Staff',
      'Field Operations',
      'Regional Coverage Map',
      'Regional Reports',
      'Escalations'
    ],
    capabilities: [
      'Maamuli karo gobolka loo xilsaaray.',
      'Maamuli karo district administrators iyo regional staff.',
      'Ansixin karo addresses gudaha delegation-kiisa.',
      'Publish-gareyn karo addresses la ansixiyey.',
      'Kormeeri karo district performance.',
      'Maamuli karo escalations.'
    ],
    permissions: ['region.manage', 'region.staff.manage', 'address.approve', 'address.publish', 'escalations.manage'],
    restrictions: [
      'Ma geli karo gobollada kale.',
      'Ma ansixin karo records uu isagu abuuray ama verify-gareeyey.'
    ],
    canApproveAddress: true,
    canVerifyAddress: false,
    canWriteData: true
  },
  {
    id: 'district_admin',
    order: 6,
    code: 'R06',
    category: 'regional_district',
    tierLabel: {
      en: 'District Level',
      so: 'Heer Degmo',
      ar: 'مستوى المديرية'
    },
    name: {
      en: 'District Administrator',
      so: 'Maamulaha Degmada',
      ar: 'مسؤول المديرية'
    },
    scope: { en: 'District (Hodan)', so: 'Degmada Hodan', ar: 'مديرية هودان' },
    department: 'District Office (Hodan)',
    sampleHolder: 'Cabdullaahi Shire Jaamac',
    assignedArea: 'Hodan District, Banaadir',
    summary: {
      en: 'Manages district address registry, local applications, district staff, field assignments, corrections, and appeals.',
      so: 'Maamulka degmada, shaqaalaha degmada, codsiyada ciwaanada, ansixinta gudaha degmada, iyo dacwadaha.',
      ar: 'إدارة سجل المديرية وطلبات العناوين والموظفين المحليين والموافقات والشكاوى.'
    },
    visibleModules: [
      'District Dashboard',
      'District Address Registry',
      'Address Applications',
      'Pending Address Requests',
      'Verification Queue',
      'District Staff',
      'Field Survey Assignments',
      'Address Corrections',
      'District Map',
      'District Reports',
      'Complaints & Appeals'
    ],
    capabilities: [
      'Maamuli karo degmada loo xilsaaray.',
      'Maamuli karo degmada staff-keeda.',
      'Kormeeri karo address registration.',
      'Ansixin karo records ku jira awooddiisa delegation.',
      'Kormeeri karo field surveyors.',
      'Maamuli karo applications iyo escalations.'
    ],
    permissions: ['district.manage', 'district.staff.manage', 'address.approve', 'surveyors.supervise', 'appeals.manage'],
    restrictions: [
      'Ma geli karo degmooyin kale (Row-Level Security).',
      'Ma ansixin karo records uu isagu abuuray ama verify-gareeyey.'
    ],
    canApproveAddress: true,
    canVerifyAddress: false,
    canWriteData: true
  },
  {
    id: 'gis_officer',
    order: 7,
    code: 'R07',
    category: 'specialist',
    tierLabel: {
      en: 'Geospatial Department / Regional Level',
      so: 'Waaxda Juqraafiga / Heer Gobol',
      ar: 'قسم نظم المعلومات الجغرافية / الإقليم'
    },
    name: {
      en: 'GIS Officer',
      so: 'Sarkaalka GIS & Khariidadda',
      ar: 'مسؤول نظم المعلومات الجغرافية'
    },
    scope: { en: 'Geospatial Dept / Region', so: 'GIS / Gobol', ar: 'جغرافي / إقليمي' },
    department: 'GIS & Mapping Department',
    sampleHolder: 'Eng. Maryan Axmed Cilmi',
    assignedArea: 'Banaadir Spatial Layers (EPSG:32638)',
    summary: {
      en: 'Manages administrative boundaries, street networks, building footprints, spatial datasets, and coordinate validation.',
      so: 'Maamulka lakabyada khariidadda, xudduudaha degmooyinka, shabakadda waddooyinka, iyo saxidda spatial data.',
      ar: 'إدارة الطبقات الجغرافية والحدود الإدارية وشبكة الشوارع والتحقق من الإحداثيات.'
    },
    visibleModules: [
      'GIS Workspace',
      'National / Assigned Area Map',
      'Administrative Boundaries',
      'Regional & District Layers',
      'Street Network',
      'Building Footprints',
      'Address Coordinates',
      'Spatial Data Imports',
      'Map Layer Management',
      'Geospatial Data Validation',
      'GIS Reports'
    ],
    capabilities: [
      'Maamuli karo geographic layers.',
      'Import-gareyn karo GIS datasets.',
      'Hubin karo coordinates.',
      'Maamuli karo administrative boundaries.',
      'Kormeeri karo map accuracy.',
      'Saxayo spatial data.',
      'Diyaarin karo GIS reports.'
    ],
    permissions: ['gis.layers.manage', 'gis.datasets.import', 'gis.coordinates.validate', 'gis.boundaries.manage', 'gis.reports'],
    restrictions: [
      'Ma ansixin karo official addresses.',
      'Spatial data editing iyo official address approval waa laba shaqo oo kala duwan.'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: true
  },
  {
    id: 'data_quality_officer',
    order: 8,
    code: 'R08',
    category: 'specialist',
    tierLabel: {
      en: 'Data Governance / Quality Control',
      so: 'Maamulka Tayada Xogta',
      ar: 'حوكمة البيانات / مراقبة الجودة'
    },
    name: {
      en: 'Data Quality Officer',
      so: 'Sarkaalka Tayada Xogta',
      ar: 'مسؤول جودة البيانات'
    },
    scope: { en: 'Data Quality Control', so: 'Tayada Xogta', ar: 'جودة البيانات' },
    department: 'Data Governance & Quality Control',
    sampleHolder: 'Saciid Cabdi Faarax',
    assignedArea: 'Banaadir Registry Quality & Validation',
    summary: {
      en: 'Detects duplicate addresses, invalid coordinates, missing/inconsistent fields, and proposes safe address merges.',
      so: 'Ogaanshaha ciwaanada labalaabka ah, xogta khaldan ama maqan, iyo soo jeedinta isku-darka ciwaanada.',
      ar: 'كشف التكرارات والإحداثيات غير الصالحة والسجلات الناقصة واقتراح عمليات الدمج.'
    },
    visibleModules: [
      'Data Quality Dashboard',
      'Duplicate Address Detection',
      'Invalid Coordinates',
      'Missing Address Information',
      'Inconsistent Address Records',
      'Data Validation Queue',
      'Quality Flags',
      'Suspected Duplicate Records',
      'Data Correction Proposals',
      'Data Quality Reports'
    ],
    capabilities: [
      'Ogaanshaha duplicate addresses.',
      'Helidda xogta khaldan ama maqan.',
      'Soo jeedin karo record corrections.',
      'Soo jeedin karo address merges.',
      'Kormeeri karo quality score.',
      'Diyaarin karo quality reports.'
    ],
    permissions: ['quality.duplicates.detect', 'quality.flags.inspect', 'quality.corrections.propose', 'quality.merge.propose'],
    restrictions: [
      'Address merging waxay u baahan tahay independent approval.',
      'Ma beddeli karo ama ma tirtiri karo records muhiim ah isaga oo aan marin approval workflow.'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: true
  },
  {
    id: 'field_ops_supervisor',
    order: 9,
    code: 'R09',
    category: 'field',
    tierLabel: {
      en: 'Field Operations · Regional / District',
      so: 'Hawlaha Goobta · Gobol / Degmo',
      ar: 'العمليات الميدانية · إقليم / مديرية'
    },
    name: {
      en: 'Field Operations Supervisor',
      so: 'Kormeeraha Hawlaha Goobta',
      ar: 'مشرف العمليات الميدانية'
    },
    scope: { en: 'Field Supervision', so: 'Kormeerka Goobta', ar: 'الإشراف الميداني' },
    department: 'Field Operations Department',
    sampleHolder: 'Ibraahim Maxamuud Warsame',
    assignedArea: 'Hodan, Wadajir & Kaaraan Teams',
    summary: {
      en: 'Creates survey projects, assigns surveyor tasks, monitors GNSS capture & offline syncs, and reviews field evidence.',
      so: 'Abuurista mashaariicda sahanka, qaybinta shaqada, kormeerka shaqaalaha goobta, iyo celinta wixii sixid u baahan.',
      ar: 'إنشاء مشاريع المسح وتوزيع المهام ومراقبة التقاط GPS والمزامنة ومراجعة الأدلة الميدانية.'
    },
    visibleModules: [
      'Field Operations Dashboard',
      'Survey Projects',
      'Survey Team Management',
      'Field Surveyor Accounts',
      'Task Assignment',
      'Survey Progress Map',
      'Pending Field Submissions',
      'Field Evidence Review',
      'GPS Capture Status',
      'Offline Sync Monitoring',
      'Field Performance Reports'
    ],
    capabilities: [
      'Abuuri karo survey projects.',
      'Shaqooyin u qaybin karo surveyors.',
      'Kormeeri karo shaqaalaha field-ka.',
      'Eegi karo field evidence.',
      'La socon karo GPS collection.',
      'Maamuli karo field submission queues.',
      'Dib ugu celin karo submissions u baahan sixid.'
    ],
    permissions: ['survey.projects.create', 'survey.tasks.assign', 'survey.evidence.review', 'survey.sync.monitor'],
    restrictions: [
      'Ma verify-gareyn karo ama ma ansixin karo official addresses.'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: true
  },
  {
    id: 'field_surveyor',
    order: 10,
    code: 'R10',
    category: 'field',
    tierLabel: {
      en: 'Field Level · Assigned Area Only',
      so: 'Heerka Goobta · Aagga Loo Xil-saaray Keliya',
      ar: 'المستوى الميداني · المنطقة المخصصة فقط'
    },
    name: {
      en: 'Field Surveyor',
      so: 'Sahmiyaha Goobta',
      ar: 'المساح الميداني'
    },
    scope: { en: 'Assigned Area Only', so: 'Aagga Loo Xil-saaray', ar: 'المنطقة المخصصة' },
    department: 'Field Operations',
    sampleHolder: 'Aamina Xuseen Cismaan (SURV-882)',
    assignedArea: 'Taleex Sector 4 — Hodan District Only',
    summary: {
      en: 'Captures buildings, entrances, GNSS points, and photo evidence offline in assigned areas and syncs when online.',
      so: 'Qaadista xogta dhismayaasha, irridaha, GPS-ka, iyo sawirada caddeynta oo offline ah iyo sync-ga.',
      ar: 'تسجيل المباني والمداخل وإحداثيات GPS والصور دون اتصال والمزامنة عند توفر الشبكة.'
    },
    visibleModules: [
      'My Field Dashboard',
      'My Assigned Tasks',
      'Assigned Survey Areas',
      'GPS Capture',
      'Building Registration Form',
      'Entrance Capture',
      'Address Observation Form',
      'Photo Evidence',
      'Offline Records',
      'Synchronization Queue',
      'Submission History'
    ],
    capabilities: [
      'Diiwaangelin karo buildings iyo entrances.',
      'Qaadi karo GPS coordinates.',
      'Buuxin karo address information.',
      'Qaadi karo evidence photos.',
      'Kaydin karo xogta offline.',
      'Markuu internet helo sync-gareyn karo xogta.',
      'La socon karo xaaladda submissions-kiisa.'
    ],
    permissions: ['field.buildings.capture', 'field.gps.capture', 'field.photos.attach', 'field.offline.sync'],
    restrictions: [
      'Ma verify-gareyn karo mana ansixin karo xogta uu ururiyey.',
      'Wuxuu arkaa oo keliya goobaha loo xilsaaray iyo submissions-kiisa.'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: true
  },
  {
    id: 'address_verifier',
    order: 11,
    code: 'R11',
    category: 'field',
    tierLabel: {
      en: 'Verification Level',
      so: 'Heerka Xaqiijinta Madaxa-bannaan',
      ar: 'مستوى التحقق المستقل'
    },
    name: {
      en: 'Address Verifier',
      so: 'Xaqiijiyaha Ciwaanka',
      ar: 'مدقق العناوين'
    },
    scope: { en: 'Verification Queue', so: 'Xaqiijinta Degmooyinka', ar: 'قائمة التحقق' },
    department: 'Data Quality & Verification',
    sampleHolder: 'Khadra Cabdi Maxamed (VERIFIER-04)',
    assignedArea: 'Hodan & Warta Nabada Districts',
    summary: {
      en: 'Independently checks building existence, GNSS accuracy, photo evidence, and duplicate warnings; returns items needing fixes.',
      so: 'Hubinta dhismaha, GPS-ka, caddeymaha sawirada, xaqiijinta xogta saxda ah, iyo u celinta sixidda.',
      ar: 'التحقق المستقل من وجود المبنى وإحداثيات GPS والأدلة المصورة وإعادة الحالات التي تحتاج تصحيحاً.'
    },
    visibleModules: [
      'Verification Dashboard',
      'Pending Verification Queue',
      'Address Details',
      'GPS Location Review',
      'Building Evidence',
      'Photo Evidence Viewer',
      'Address Information Review',
      'Duplicate Warnings',
      'Verification History',
      'Return for Correction Queue'
    ],
    capabilities: [
      'Hubin karo in building-ku jiro.',
      'Hubin karo GPS coordinates.',
      'Hubin karo xogta address-ka.',
      'Eegi karo field evidence.',
      'Verify-gareyn karo submissions sax ah.',
      'U celin karo surveyor ama supervisor records u baahan sixid.',
      'Ku dari karo verification notes.'
    ],
    permissions: ['address.verify', 'evidence.gps_inspect', 'evidence.photos_view', 'address.return_correction'],
    restrictions: [
      'Ma verify-gareyn karo xog uu isagu ururiyey.',
      'Ma laha final official approval ama publication authority.'
    ],
    canApproveAddress: false,
    canVerifyAddress: true,
    canWriteData: true
  },
  {
    id: 'auditor',
    order: 12,
    code: 'R12',
    category: 'specialist',
    tierLabel: {
      en: 'Read-Only · Independent Oversight',
      so: 'Akhris Keliya · Kormeerka Madaxa-bannaan',
      ar: 'للقراءة فقط · الرقابة المستقلة'
    },
    name: {
      en: 'Auditor',
      so: 'Hanti-dhowrka (Auditor)',
      ar: 'المدقق المستقل'
    },
    scope: { en: 'Read-Only Oversight', so: 'Akhris Keliya', ar: 'للقراءة فقط' },
    department: 'Audit & Compliance',
    sampleHolder: 'Cali Yuusuf Cabdiraxmaan (OAG)',
    assignedArea: 'Full System Read-Only Audit Trail',
    summary: {
      en: 'Strictly read-only oversight of audit logs, user logins, address change history, approvals, exports, and compliance reports.',
      so: 'Baadhitaanka cidda wax beddeshay, goorta la beddelay, ansixinta, galitaanka, iyo diyaarinta warbixinada audit-ka.',
      ar: 'رقابة للقراءة فقط لسجلات التدقيق وتاريخ التعديلات والموافقات وأنشطة الدخول والتصدير.'
    },
    visibleModules: [
      'Audit Dashboard',
      'Complete Audit Logs',
      'User Activity History',
      'Address Change History',
      'Approval History',
      'Role & Permission Changes',
      'Login History',
      'Data Export History',
      'Security Events',
      'Compliance Reports',
      'Audit Evidence'
    ],
    capabilities: [
      'Baari karo cidda record beddeshay.',
      'Ogaan karo goorta la beddelay.',
      'Eegi karo qofka ansixiyey.',
      'Kormeeri karo user access.',
      'Baari karo suspicious activities.',
      'Diyaarin karo audit reports.'
    ],
    permissions: ['audit.logs.read', 'audit.history.read', 'audit.access.inspect', 'audit.reports.generate'],
    restrictions: [
      'Read-only. Waxba ma abuuri karo, ma beddeli karo, mana tirtiri karo.'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: false
  },
  {
    id: 'public_citizen',
    order: 13,
    code: 'R13',
    category: 'external',
    tierLabel: {
      en: 'Public Platform · Citizen Access',
      so: 'Nidaamka Dadweynaha · Adeegga Muwaadinka',
      ar: 'المنصة العامة · وصول المواطن'
    },
    name: {
      en: 'Public Citizen',
      so: 'Muwaadinka Dadweynaha',
      ar: 'المواطن العام'
    },
    scope: { en: 'Public / Own Requests', so: 'Dadweyne / Codsi Gaar ah', ar: 'عام / طلبات شخصية' },
    department: 'Public Citizen Portal',
    sampleHolder: 'Axmed Maxamed Cali (Resident)',
    assignedArea: 'Approved Public Addresses & Own Submissions',
    summary: {
      en: 'Public search, Somalia map explorer, QR address verification, new address requests, corrections, and case tracking.',
      so: 'Raadinta ciwaanada, khariidadda, hubinta QR-ka, codsiga ciwaan cusub, iyo la socodka codsiyadaada.',
      ar: 'البحث العام عن العناوين، استكشاف الخريطة، التحقق من QR، تقديم الطلبات وتتبعها.'
    },
    visibleModules: [
      'Public Homepage',
      'Search Address',
      'Explore Somalia Map',
      'Address Details',
      'Address QR Verification',
      'Request New Address',
      'Report Incorrect Address',
      'Correction Requests',
      'My Applications',
      'My Request Status',
      'Address Sharing'
    ],
    capabilities: [
      'Raadin karo address.',
      'Eegi karo approved public address information.',
      'Codsan karo address cusub.',
      'Soo gudbin karo correction.',
      'Warbixin ka bixin karo xog khaldan.',
      'La socon karo codsiyadiisa.',
      'Wadaagi karo address code ama QR.'
    ],
    permissions: ['public.search', 'public.qr_verify', 'citizen.request_new', 'citizen.report_correction'],
    restrictions: [
      'Ma geli karo government dashboard, private records, resident personal information ama administrative controls.',
      'Wuxuu arkaa xogta loo oggolaaday dadweynaha oo keliya.'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: false
  },
  {
    id: 'institutional_api_client',
    order: 14,
    code: 'R14',
    category: 'external',
    tierLabel: {
      en: 'Institutional Integration · API Access',
      so: 'Isku-xirka Hay’adaha · Adeegga API',
      ar: 'التكامل المؤسسي · وصول واجهة برمجة التطبيقات'
    },
    name: {
      en: 'Institutional API Client',
      so: 'Hay’adaha & Adeegga API',
      ar: 'عميل API المؤسسي'
    },
    scope: { en: 'Authorized API Scopes', so: 'Oggolaanshaha API', ar: 'نطاقات API المصرح بها' },
    department: 'Partner Ecosystem (Somali Post / 888 / 999)',
    sampleHolder: 'Somali Post & Emergency 888/999 Dispatch',
    assignedArea: 'Mogadishu Service Delivery & Dispatch Endpoints',
    summary: {
      en: 'API documentation, credentials & keys, address lookup/validation/geocoding endpoints, rate limits, and integration logs.',
      so: 'Dukumeentiga API-ga, furayaasha credentials-ka, endpoints-ka raadinta iyo geocoding-ka, iyo logs-ka hay’adaha.',
      ar: 'وثائق API، مفاتيح الوصول، نقاط التحقق والترميز الجغرافي، حدود المعدل وسجلات التكامل.'
    },
    visibleModules: [
      'API Documentation',
      'API Credentials',
      'API Key Management',
      'Authorized Endpoints',
      'Address Lookup API',
      'Address Validation API',
      'Geocoding API',
      'QR / Address Code Verification',
      'API Usage Statistics',
      'Rate Limit Information',
      'Integration Logs',
      'Error Monitoring'
    ],
    capabilities: [
      'Ka raadin karo addresses API.',
      'Verify-gareyn karo address codes.',
      'Isticmaali karo approved geocoding endpoints.',
      'Ku xiri karo nidaamkiisa SDAS.',
      'Eegi karo API usage iyo errors.',
      'Maamuli karo credentials-ka loo oggolaaday.'
    ],
    permissions: ['api:address_lookup', 'api:address_validate', 'api:geocoding', 'api:qr_verify', 'api:credentials_manage'],
    restrictions: [
      'Ma samayn karo wax beddel ah gudaha diiwaanka rasmiga ah (Read-only API scopes).',
      'Codsiyada oo dhan waxay ku xiran yihiin rate limits, heshiiska xog-wadaagga, iyo kormeer joogto ah.'
    ],
    canApproveAddress: false,
    canVerifyAddress: false,
    canWriteData: false
  }
];
