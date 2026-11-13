import { AddressRecord, DistrictInfo, SurveyTask, AuditEvent } from '../types/sdas';

export const MOCK_DISTRICTS: DistrictInfo[] = [
  {
    id: 'dis-hodan',
    name: 'Hodan',
    nameSo: 'Hodan',
    nameAr: 'هودان',
    region: 'Banaadir',
    estimatedInventory: 64200,
    mappedBuildings: 58100,
    verifiedEntrances: 49200,
    approvedDesignations: 38400,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-wadajir',
    name: 'Wadajir',
    nameSo: 'Wadajir (Madiina)',
    nameAr: 'وداجير',
    region: 'Banaadir',
    estimatedInventory: 55000,
    mappedBuildings: 51200,
    verifiedEntrances: 44000,
    approvedDesignations: 31000,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-warta',
    name: 'Warta Nabada',
    nameSo: 'Warta Nabada',
    nameAr: 'ورتا نبادا',
    region: 'Banaadir',
    estimatedInventory: 48000,
    mappedBuildings: 42000,
    verifiedEntrances: 35000,
    approvedDesignations: 24500,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-karan',
    name: 'Kaaraan',
    nameSo: 'Kaaraan',
    nameAr: 'كاران',
    region: 'Banaadir',
    estimatedInventory: 59000,
    mappedBuildings: 49000,
    verifiedEntrances: 38000,
    approvedDesignations: 21000,
    readinessStatus: 'survey_active'
  },
  {
    id: 'dis-yaqshid',
    name: 'Yaaqshiid',
    nameSo: 'Yaaqshiid',
    nameAr: 'يعقشيد',
    region: 'Banaadir',
    estimatedInventory: 68000,
    mappedBuildings: 52000,
    verifiedEntrances: 41000,
    approvedDesignations: 19000,
    readinessStatus: 'survey_active'
  },
  {
    id: 'dis-dharkenley',
    name: 'Dharkenley',
    nameSo: 'Dharkenley',
    nameAr: 'دهركنلي',
    region: 'Banaadir',
    estimatedInventory: 52000,
    mappedBuildings: 41000,
    verifiedEntrances: 30000,
    approvedDesignations: 12000,
    readinessStatus: 'survey_active'
  },
  {
    id: 'dis-shangani',
    name: 'Shangaani',
    nameSo: 'Shangaani',
    nameAr: 'شنجاني',
    region: 'Banaadir',
    estimatedInventory: 14000,
    mappedBuildings: 13800,
    verifiedEntrances: 13500,
    approvedDesignations: 12800,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-shibis',
    name: 'Shibis',
    nameSo: 'Shibis',
    nameAr: 'شيبس',
    region: 'Banaadir',
    estimatedInventory: 22000,
    mappedBuildings: 21000,
    verifiedEntrances: 19500,
    approvedDesignations: 17200,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-hamarjajab',
    name: 'Hamar Jajab',
    nameSo: 'Xamar Jajab',
    nameAr: 'حمر جاجب',
    region: 'Banaadir',
    estimatedInventory: 28000,
    mappedBuildings: 26500,
    verifiedEntrances: 24000,
    approvedDesignations: 20500,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-hamarweyne',
    name: 'Hamar Weyne',
    nameSo: 'Xamar Weyne',
    nameAr: 'حمر وين',
    region: 'Banaadir',
    estimatedInventory: 24000,
    mappedBuildings: 23500,
    verifiedEntrances: 22800,
    approvedDesignations: 19800,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-boondheere',
    name: 'Boondheere',
    nameSo: 'Boondheere',
    nameAr: 'بوندهيري',
    region: 'Banaadir',
    estimatedInventory: 31000,
    mappedBuildings: 28000,
    verifiedEntrances: 24000,
    approvedDesignations: 18500,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-waaberi',
    name: 'Waaberi',
    nameSo: 'Waaberi',
    nameAr: 'وابري',
    region: 'Banaadir',
    estimatedInventory: 46000,
    mappedBuildings: 41500,
    verifiedEntrances: 37200,
    approvedDesignations: 30100,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-abdicasiis',
    name: 'Cabdicasis',
    nameSo: 'Cabdicasis',
    nameAr: 'عبد العزيز',
    region: 'Banaadir',
    estimatedInventory: 21000,
    mappedBuildings: 19200,
    verifiedEntrances: 17400,
    approvedDesignations: 15300,
    readinessStatus: 'fully_operational'
  },
  {
    id: 'dis-hawlwadaag',
    name: 'Hawl Wadaag',
    nameSo: 'Hawl Wadaag',
    nameAr: 'هول وداغ',
    region: 'Banaadir',
    estimatedInventory: 49000,
    mappedBuildings: 43000,
    verifiedEntrances: 36000,
    approvedDesignations: 25000,
    readinessStatus: 'live_wave_1'
  },
  {
    id: 'dis-dayniile',
    name: 'Dayniile',
    nameSo: 'Dayniile',
    nameAr: 'دينيلي',
    region: 'Banaadir',
    estimatedInventory: 58000,
    mappedBuildings: 39000,
    verifiedEntrances: 28000,
    approvedDesignations: 14000,
    readinessStatus: 'survey_active'
  },
  {
    id: 'dis-kaxda',
    name: 'Kaxda',
    nameSo: 'Kaxda',
    nameAr: 'كاهدة',
    region: 'Banaadir',
    estimatedInventory: 44000,
    mappedBuildings: 29000,
    verifiedEntrances: 19000,
    approvedDesignations: 8500,
    readinessStatus: 'mobilisation'
  },
  {
    id: 'dis-heliwaa',
    name: 'Heliwaa',
    nameSo: 'Huriwaa (Heliwaa)',
    nameAr: 'هيليوا',
    region: 'Banaadir',
    estimatedInventory: 41000,
    mappedBuildings: 27000,
    verifiedEntrances: 16000,
    approvedDesignations: 7100,
    readinessStatus: 'mobilisation'
  }
];

export const MOCK_ADDRESSES: AddressRecord[] = [
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    publicCode: 'SDAS-MOG-7482',
    districtId: 'dis-hodan',
    components: {
      country: 'Somalia',
      region: 'Banaadir',
      district: 'Hodan',
      locality: 'Xaafadda Taleex',
      street: 'Wadada Makka Al-Mukarrama',
      buildingNumber: '412',
      unit: 'Qeybta 3B',
      landmark: 'Kasoo horjeedka Taallada Taleex'
    },
    addressType: 'commercial',
    workflowState: 'submitted',
    verificationStatus: 'verified',
    approvalStatus: 'approved',
    publicationStatus: 'published',
    designationStatus: 'official',
    authorityReference: 'BRA/MOG/EXEC/2026/089-A',
    location: {
      type: 'Point',
      coordinates: [45.3182, 2.0391],
      accuracyMeters: 1.2,
      captureMethod: 'field_survey'
    },
    provenance: {
      sourceType: 'field_survey',
      sourceRef: 'SURVEY-HODAN-091',
      surveyorId: 'SURV-882',
      capturedAt: '2026-10-12T08:30:00Z',
      verifiedBy: 'Sarkaalka Degmada Hodan'
    },
    dataVersion: 2,
    updatedAt: '2026-11-10T14:20:00Z'
  },
  {
    id: 'c23a76ef-1122-3344-5566-778899aabbcc',
    publicCode: 'SDAS-MOG-3091',
    districtId: 'dis-wadajir',
    components: {
      country: 'Somalia',
      region: 'Banaadir',
      district: 'Wadajir',
      locality: 'Xaafadda Madiina',
      street: 'Jidka 21 Oktoobar',
      buildingNumber: '108',
      landmark: 'Isgoyska Cisbitaalka Madiina'
    },
    addressType: 'public_facility',
    workflowState: 'under_review',
    verificationStatus: 'verified',
    approvalStatus: 'approved',
    publicationStatus: 'published',
    designationStatus: 'official',
    authorityReference: 'BRA/WAD/2026/104',
    location: {
      type: 'Point',
      coordinates: [45.2915, 2.0154],
      accuracyMeters: 0.8,
      captureMethod: 'field_survey'
    },
    provenance: {
      sourceType: 'field_survey',
      sourceRef: 'SURVEY-WAD-104',
      surveyorId: 'SURV-910',
      capturedAt: '2026-11-01T10:15:00Z',
      verifiedBy: 'Sarkaalka Degmada Wadajir'
    },
    dataVersion: 1,
    updatedAt: '2026-11-11T09:00:00Z'
  },
  {
    id: 'e45b88ab-3344-5566-7788-99aabbccdde0',
    publicCode: 'SDAS-MOG-9124',
    districtId: 'dis-shangani',
    components: {
      country: 'Somalia',
      region: 'Banaadir',
      district: 'Shangaani',
      locality: 'Degmada Shangaani Hoose',
      street: 'Wadada Badda (Marina Drive)',
      buildingNumber: '014',
      unit: 'Dabaqa 1aad',
      landmark: 'Dhismaha Dekeddii Hore'
    },
    addressType: 'administrative',
    workflowState: 'submitted',
    verificationStatus: 'verified',
    approvalStatus: 'approved',
    publicationStatus: 'published',
    designationStatus: 'official',
    authorityReference: 'MOCI/SDAS/2026/012',
    location: {
      type: 'Point',
      coordinates: [45.3672, 2.0333],
      accuracyMeters: 1.0,
      captureMethod: 'field_survey'
    },
    provenance: {
      sourceType: 'field_survey',
      sourceRef: 'SURVEY-SHANG-002',
      surveyorId: 'SURV-102',
      capturedAt: '2026-09-15T11:00:00Z',
      verifiedBy: 'Kormeeraha Shangaani'
    },
    dataVersion: 3,
    updatedAt: '2026-10-20T16:45:00Z'
  },
  {
    id: 'a99f1234-5678-90ab-cdef-1234567890ab',
    publicCode: 'SDAS-MOG-5520',
    districtId: 'dis-warta',
    components: {
      country: 'Somalia',
      region: 'Banaadir',
      district: 'Warta Nabada',
      locality: 'Xaafadda Tarabuunka',
      street: 'Wadada Tarabuunka',
      buildingNumber: '89',
      landmark: 'Dhabarka dambe ee Fagaaraha'
    },
    addressType: 'residential',
    workflowState: 'draft',
    verificationStatus: 'verified',
    approvalStatus: 'approved',
    publicationStatus: 'published',
    designationStatus: 'official',
    authorityReference: 'BRA/WN/2026/301',
    location: {
      type: 'Point',
      coordinates: [45.3341, 2.0582],
      accuracyMeters: 1.4,
      captureMethod: 'field_survey'
    },
    provenance: {
      sourceType: 'field_survey',
      sourceRef: 'SURVEY-WN-041',
      capturedAt: '2026-11-05T07:10:00Z'
    },
    dataVersion: 1,
    updatedAt: '2026-11-05T07:10:00Z'
  },
  {
    id: 'b11f2233-4455-6677-8899-001122334455',
    publicCode: 'SDAS-MOG-1104',
    districtId: 'dis-waaberi',
    components: {
      country: 'Somalia',
      region: 'Banaadir',
      district: 'Waaberi',
      locality: 'Xaafadda Boostada',
      street: 'Wadada Garoonka Diyaaradaha',
      buildingNumber: '240',
      unit: 'Guri Gaar ah',
      landmark: 'Kasoo horjeedka Kawaanka Waaberi'
    },
    addressType: 'residential',
    workflowState: 'submitted',
    verificationStatus: 'verified',
    approvalStatus: 'approved',
    publicationStatus: 'published',
    designationStatus: 'official',
    authorityReference: 'BRA/WAB/2026/099',
    location: {
      type: 'Point',
      coordinates: [45.3210, 2.0220],
      accuracyMeters: 1.1,
      captureMethod: 'field_survey'
    },
    provenance: {
      sourceType: 'field_survey',
      sourceRef: 'SURVEY-WAB-011',
      capturedAt: '2026-10-30T14:15:00Z'
    },
    dataVersion: 1,
    updatedAt: '2026-11-02T11:00:00Z'
  },
  {
    id: 'c88a9900-1122-3344-5566-778899aabbdd',
    publicCode: 'SDAS-MOG-8819',
    districtId: 'dis-hamarweyne',
    components: {
      country: 'Somalia',
      region: 'Banaadir',
      district: 'Hamar Weyne',
      locality: 'Xaafadda Suuqa Weyn',
      street: 'Wadada Via Roma',
      buildingNumber: '55',
      unit: 'Dukaan',
      landmark: 'Suuqa Qadiimiga ah ee Dahabka'
    },
    addressType: 'commercial',
    workflowState: 'submitted',
    verificationStatus: 'verified',
    approvalStatus: 'approved',
    publicationStatus: 'published',
    designationStatus: 'official',
    authorityReference: 'BRA/HW/2026/182',
    location: {
      type: 'Point',
      coordinates: [45.3412, 2.0355],
      accuracyMeters: 0.9,
      captureMethod: 'field_survey'
    },
    provenance: {
      sourceType: 'field_survey',
      sourceRef: 'SURVEY-HW-009',
      capturedAt: '2026-10-18T09:40:00Z'
    },
    dataVersion: 2,
    updatedAt: '2026-11-08T16:20:00Z'
  },
  {
    id: 'd99b1122-3344-5566-7788-99aabbccddee',
    publicCode: 'SDAS-MOG-4402',
    districtId: 'dis-karan',
    components: {
      country: 'Somalia',
      region: 'Banaadir',
      district: 'Kaaraan',
      locality: 'Xaafadda Nageele',
      street: 'Jidka Badda ee Kaaraan',
      buildingNumber: '19',
      unit: 'Guri',
      landmark: 'Dugsiga Hoose ee Kaaraan'
    },
    addressType: 'residential',
    workflowState: 'verification',
    verificationStatus: 'needs_correction',
    approvalStatus: 'pending',
    publicationStatus: 'unpublished',
    designationStatus: 'none',
    location: {
      type: 'Point',
      coordinates: [45.3812, 2.0620],
      accuracyMeters: 1.8,
      captureMethod: 'field_survey'
    },
    provenance: {
      sourceType: 'field_survey',
      sourceRef: 'SURVEY-KAR-014',
      capturedAt: '2026-11-09T08:30:00Z'
    },
    dataVersion: 1,
    updatedAt: '2026-11-11T12:00:00Z'
  }
];

export const MOCK_PENDING_APPLICATIONS = [
  {
    id: 'APP-2026-4412',
    applicantName: 'Axmed Maxamed Cali',
    district: 'Hodan',
    locality: 'Xaafadda KPP',
    street: 'Wadada Taleex',
    propertyType: 'residential',
    submittedAt: '2026-11-12 08:30',
    status: 'submitted',
    statusLabel: 'Sugaya Hubin',
    statusEn: 'Pending Inspection'
  },
  {
    id: 'APP-2026-4413',
    applicantName: 'Shirkadda Hormuud Logistics',
    district: 'Wadajir',
    locality: 'Xaafadda Buulo Xuubeey',
    street: 'Jidka Garoonka',
    propertyType: 'commercial',
    submittedAt: '2026-11-12 09:15',
    status: 'verification',
    statusLabel: 'Kormeer Goobta',
    statusEn: 'Field Verification'
  },
  {
    id: 'APP-2026-4409',
    applicantName: 'Faadumo Cabdullaahi Nuur',
    district: 'Kaaraan',
    locality: 'Xaafadda Nageele',
    street: 'Wadada Koowaad',
    propertyType: 'residential',
    submittedAt: '2026-11-11 14:00',
    status: 'approved',
    statusLabel: 'La Ansixiyay',
    statusEn: 'Approved'
  }
];

export const MOCK_CORRECTIONS = [
  {
    id: 'CORR-MOG-001',
    addressCode: 'SDAS-MOG-7482',
    category: 'Spelling of Locality',
    proposer: 'Resident / Citizen',
    submittedValue: 'Taleex (Correct Somali spelling)',
    status: 'Under Review',
    targetResolution: '2 business days'
  },
  {
    id: 'CORR-MOG-002',
    addressCode: 'SDAS-MOG-3091',
    category: 'Entrance Relocation',
    proposer: 'Ambulance Service (888)',
    submittedValue: 'Entrance moved to side lane for emergency ramp',
    status: 'Inspection Scheduled',
    targetResolution: '3 business days'
  }
];

export const UI_STRINGS = {
  so: {
    portalTitle: 'Nidaamka Ciwaangelinta Dijitaalka ah ee Soomaaliya',
    portalSubtitle: 'Adeegga Rasmiga ah ee Ciwaanada Magaalada Muqdisho (Gobolka Banaadir)',
    govSubtext: 'Jamhuuriyadda Federaalka Soomaaliya — Wasaaradda Isgaarsiinta & Maamulka Gobolka Banaadir',
    navSearch: 'Baadhitaanka Ciwaanka',
    navRegistry: 'Diiwaanka Ciwaanada',
    navMap: 'Khariidadda Muqdisho',
    navRequest: 'Codso Ciwaan Cusub',
    navPlates: 'Taarikada Guryaha',
    navAdmin: 'Xafiiska Xaqiijinta',
    navStats: 'Tirakoobka',
    navUssd: 'Adeegga SMS / USSD (*282#)',
    navPartners: 'Hay\'adaha & Ambalaasta',
    searchTitle: 'Raadi ama Hubi Ciwaankaaga Rasmiga ah',
    searchSubtitle: 'Geli koodka ciwaanka dijitaalka ah (tusaale SDAS-MOG-7482) ama magaca xaafadda iyo wadada.',
    searchBtn: 'Raadi Ciwaanka',
    requestBtn: 'Codso Ciwaan Cusub',
    plateBtn: 'Dalbo Taarikada Guriga',
    verifiedCardTitle: 'Kaarka Ciwaanka Dijitaalka ah ee Qaranka',
    officialBadge: 'Ciwaan Rasmi ah oo La Xaqiijiyay',
    district: 'Degmada',
    locality: 'Xaafadda',
    street: 'Wadada / Jidka',
    building: 'Lambarka Guriga',
    unit: 'Qeybta / Dabaqa',
    landmark: 'Calaamadda u dhow',
    code: 'Koodka Ciwaanka',
    coordinates: 'Iskudhafka Juqraafi (GPS)',
    downloadCert: 'Soo Dejiso Kaarka Ciwaanka (PDF)',
    shareAddress: 'La Wadaag Ciwaanka',
    legalDisclaimer: 'Ogeysiis: Kaarka ciwaankani waa astaan goobeed rasmi ah, mana aha caddayn milkiyad dhul ama guri.',
    allDistricts: 'Dhammaan Degmooyinka',
    filterType: 'Nooca Hantida',
    residential: 'Guri Deegaan',
    commercial: 'Goob Ganacsi',
    publicFacility: 'Xarun Dowladeed',
    inspectAddress: 'Faahfaahin Buuxda',
    status: 'Xaaladda'
  },
  en: {
    portalTitle: 'Somali Digital Addressing System',
    portalSubtitle: 'Official Digital Address Portal for Mogadishu (Banaadir Region)',
    govSubtext: 'Federal Republic of Somalia — Ministry of Communications & Technology and BRA',
    navSearch: 'Address Search & Verification',
    navRegistry: 'Address Directory',
    navMap: 'Mogadishu GIS Map',
    navRequest: 'Request New Address',
    navPlates: 'House Address Plates',
    navAdmin: 'Verification Desk',
    navStats: 'Official Statistics',
    navUssd: 'SMS / USSD Service (*282#)',
    navPartners: 'Emergency & Partners',
    searchTitle: 'Search or Verify an Official Address',
    searchSubtitle: 'Enter the official digital address code (e.g. SDAS-MOG-7482) or street name.',
    searchBtn: 'Search Address',
    requestBtn: 'Apply for New Address',
    plateBtn: 'Order House Plate',
    verifiedCardTitle: 'National Digital Address Certificate',
    officialBadge: 'Officially Verified & Designated Address',
    district: 'District',
    locality: 'Neighborhood',
    street: 'Street / Road',
    building: 'Building Number',
    unit: 'Unit / Floor',
    landmark: 'Nearby Landmark',
    code: 'Public Address Code',
    coordinates: 'Geographic Coordinates (GPS)',
    downloadCert: 'Download Certificate Card',
    shareAddress: 'Share Address Code',
    legalDisclaimer: 'Official Notice: This address certificate is an authoritative location reference and does not constitute land or property title.',
    allDistricts: 'All Districts',
    filterType: 'Property Type',
    residential: 'Residential',
    commercial: 'Commercial',
    publicFacility: 'Public Facility',
    inspectAddress: 'View Full Record',
    status: 'Status'
  },
  ar: {
    portalTitle: 'نظام العنونة الرقمية الوطني الصومالي',
    portalSubtitle: 'البوابة الرسمية للعناوين الرقمية لمدينة مقديشو (محافظة بنادر)',
    govSubtext: 'جمهورية الصومال الفيدرالية — وزارة الاتصالات ومحافظة بنادر',
    navSearch: 'البحث والتحقق',
    navRegistry: 'سجل العناوين',
    navMap: 'خريطة مقديشو',
    navRequest: 'طلب عنوان جديد',
    navPlates: 'لوحات المنازل',
    navAdmin: 'مكتب التحقق والاعتماد',
    navStats: 'الإحصاءات الرسمية',
    navUssd: 'خدمة الهاتف المحمول (*282#)',
    navPartners: 'الطوارئ والجهات المعتمدة',
    searchTitle: 'ابحث أو تحقق من العنوان الرسمي',
    searchSubtitle: 'أدخل رمز العنوان الرقمي (مثل SDAS-MOG-7482) أو اسم الشارع.',
    searchBtn: 'بحث عن العنوان',
    requestBtn: 'تقديم طلب عنوان',
    plateBtn: 'طلب لوحة العنوان',
    verifiedCardTitle: 'شهادة العنوان الرقمي الوطنية',
    officialBadge: 'عنوان رسمي معتمد وموثق',
    district: 'المديرية',
    locality: 'الحي',
    street: 'الشارع',
    building: 'رقم المبنى',
    unit: 'الوحدة / الطابق',
    landmark: 'معلم بارز قريب',
    code: 'رمز العنوان العام',
    coordinates: 'الإحداثيات الجغرافية',
    downloadCert: 'تحميل بطاقة العنوان',
    shareAddress: 'مشاركة العنوان',
    legalDisclaimer: 'تنبيه رسمي: بطاقة العنوان هذه هي مرجع مكاني موثوق ولا تمثل إثباتاً لملكية الأرض أو العقار.',
    allDistricts: 'جميع المديريات',
    filterType: 'نوع العقار',
    residential: 'سكني',
    commercial: 'تجاري',
    publicFacility: 'منشأة حكومية',
    inspectAddress: 'تفاصيل العنوان',
    status: 'الحالة'
  }
};
