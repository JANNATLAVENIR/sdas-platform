import { UserRole, Language, AddressRecord, DistrictInfo } from '../types/sdas';
import { ALL_ROLES, RoleDefinition } from '../data/rolesData';

export interface RolePortalExperience {
  role: RoleDefinition;
  allowedDistrictIds: string[] | 'all';
  maskCoordinatesAndStreets: boolean;
  isReadOnly: boolean;
  canSubmitAddressRequest: boolean;
  canOrderPlates: boolean;
  canSubmitCorrections: boolean;
  defaultHomeHeroSubtitle: Record<Language, string>;
  primaryAction: {
    view: string;
    label: Record<Language, string>;
  };
  secondaryAction: {
    view: string;
    label: Record<Language, string>;
  };
  cardOverrides: {
    card1Desc: Record<Language, string>;
    card2Desc: Record<Language, string>;
    card3Desc: Record<Language, string>;
    card4Title: Record<Language, string>;
    card4Desc: Record<Language, string>;
  };
}

export function getRoleExperience(roleId: UserRole, breakGlassActive = false): RolePortalExperience {
  const role = ALL_ROLES.find((r) => r.id === roleId) || ALL_ROLES.find((r) => r.id === 'public_citizen')!;

  const allowedDistrictIds: string[] | 'all' = (() => {
    switch (roleId) {
      case 'district_admin':
      case 'field_surveyor':
        return ['dis-hodan'];
      case 'address_verifier':
        return ['dis-hodan', 'dis-warta'];
      case 'field_ops_supervisor':
        return ['dis-hodan', 'dis-wadajir', 'dis-karan'];
      default:
        return 'all';
    }
  })();

  const maskCoordinatesAndStreets = roleId === 'national_super_admin' && !breakGlassActive;
  const isReadOnly = roleId === 'auditor';
  const canSubmitAddressRequest = ['public_citizen', 'district_admin', 'regional_admin', 'field_surveyor', 'field_ops_supervisor'].includes(roleId);
  const canOrderPlates = !['auditor', 'national_super_admin', 'institutional_api_client'].includes(roleId);
  const canSubmitCorrections = !['auditor', 'national_super_admin'].includes(roleId);

  const heroSubtitles: Record<UserRole, Record<Language, string>> = {
    public_citizen: {
      en: 'A unified, standardized, and geospatial addressing system for Somalia.',
      so: 'Nidaam mideysan oo heer qaran ah oo lagu saxo ciwaanada iyo khariidadda Soomaaliya.',
      ar: 'نظام موحد ومعياري ومكاني للعناوين الرقمية في جمهورية الصومال الفيدرالية.'
    },
    national_super_admin: {
      en: 'Platform Governance Mode — MFA policy, custodian setup & time-boxed Break-Glass control (routine addresses masked).',
      so: 'Habka Maamulka Sare ee Nidaamka — ilaalinta amniga & Break-glass (xogta ciwaanada waa la qariyay).',
      ar: 'وضع إدارة المنصة الأعلى — سياسات الأمان والوصول الطارئ المقيد بزمن.'
    },
    national_authority_admin: {
      en: 'National Authority Mode — Addressing standards, public code policies, and dual-control governance.',
      so: 'Habka Hay’adda Qaranka — halbeegyada ciwaanada, xeerarka koodadka, iyo maamulka labada saxiix.',
      ar: 'وضع الهيئة الوطنية — معايير العنونة وقواعد الرموز والحوكمة المزدوجة.'
    },
    director_general: {
      en: 'Executive Authority Mode — Official government designation and dual-control countersignatures.',
      so: 'Habka Agaasimaha Guud — ansixinta rasmiga ah ee dowladda iyo saxiixa laba-geesoodka ah.',
      ar: 'وضع المدير العام — الاعتماد الرسمي الحكومي والتوقيع المزدوج.'
    },
    department_admin: {
      en: 'Department Operations Mode — Staff queues, assignments, and SLA performance within your department.',
      so: 'Habka Maamulaha Waaxda — maamulka shaqaalaha waaxda iyo safafka shaqada.',
      ar: 'وضع مدير القسم — إدارة موظفي القسم وقوائم الانتظار ومؤشرات الأداء.'
    },
    regional_admin: {
      en: 'Banaadir Regional Mode — Coordinate all 17 districts, publish approved addresses, and resolve escalations.',
      so: 'Habka Maamulka Gobolka Banaadir — isku xirka 17-ka degmo iyo daabacaadda ciwaanada.',
      ar: 'وضع إقليم بنادر — تنسيق المديريات الـ 17 ونشر العناوين المعتمدة.'
    },
    district_admin: {
      en: 'Hodan District Mode (Scoped RLS) — Review and approve addresses strictly within Hodan District.',
      so: 'Habka Maamulaha Degmada Hodan — codsiyada iyo ansixinta Degmada Hodan oo keliya.',
      ar: 'وضع مديريرية هودان — مراجعة واعتماد طلبات مديرية هودان فقط.'
    },
    gis_officer: {
      en: 'GIS & Spatial Mode (EPSG:32638) — Manage district boundaries, layer sensitivity, and street naming.',
      so: 'Habka Khariidadda & GIS — xudduudaha degmooyinka, lakabyada, iyo magacaabista jidadka.',
      ar: 'وضع نظم المعلومات الجغرافية — الحدود الإدارية والطبقات المكانية وتصنيفها.'
    },
    data_quality_officer: {
      en: 'Data Quality Mode — Inspect duplicate candidates, boundary anomalies, and propose safe merges.',
      so: 'Habka Tayada Xogta — hubinta ciwaanada isku midka ah iyo soo jeedinta isku-darka.',
      ar: 'وضع جودة البيانات — فحص التكرارات واقتراح عمليات الدمج الآمنة.'
    },
    field_ops_supervisor: {
      en: 'Field Supervision Mode — Assign survey packages, monitor GNSS teams, and schedule random QA rechecks.',
      so: 'Habka Kormeerka Goobta — u qoondeynta shaqooyinka kooxaha iyo hubinta tayada.',
      ar: 'وضع الإشراف الميداني — توزيع حزم المسح ومراقبة الجودة.'
    },
    field_surveyor: {
      en: 'Field Surveyor Mode (Taleex Sector 4) — Offline-first GNSS building capture and idempotent sync.',
      so: 'Habka Sahmiyaha Goobta (Taleex Qaybta 4) — qaadista xogta offline-ka iyo sync-ga GPS-ka.',
      ar: 'وضع المساح الميداني — جمع البيانات دون اتصال والمزامنة الجغرافية.'
    },
    address_verifier: {
      en: 'Independent Verification Mode — Inspect field evidence for Hodan & Warta Nabada (cannot self-approve).',
      so: 'Habka Xaqiijiyaha Madaxa-bannaan — hubinta caddeymaha Hodan & Warta Nabada.',
      ar: 'وضع مدقق العناوين المستقل — فحص الأدلة الميدانية لهودان وورتا نبادا.'
    },
    auditor: {
      en: 'Audit & Compliance Mode (Strictly Read-Only) — Inspect immutable logs, history, and compliance exports.',
      so: 'Habka Hanti-dhowrka (Akhris Keliya) — kormeerka taariikhda, galitaanka, iyo dhoofinta xogta.',
      ar: 'وضع التدقيق والامتثال (للقراءة فقط) — فحص السجلات المقاومة للتلاعب.'
    },
    institutional_api_client: {
      en: 'Institutional Dispatch Mode — High-speed geocoding for Emergency (888/999), Somali Post & Utilities.',
      so: 'Habka Hay’adaha & Gurmadka — helitaanka degdegga ah ee Booliska (888), Ambalaasta (999) & Boostada.',
      ar: 'وضع الشركاء والطوارئ — تحديد المواقع السريع للشرطة والإسعاف والبريد.'
    }
  };

  const primaryActions: Record<UserRole, { view: string; label: Record<Language, string> }> = {
    public_citizen: {
      view: 'request',
      label: { en: 'Register an Address', so: 'Diiwaangeli Ciwaan', ar: 'تسجيل عنوان جديد' }
    },
    national_super_admin: {
      view: 'desk',
      label: { en: 'Platform & Break-Glass Console', so: 'Maamulka Sare & Break-Glass', ar: 'وحدة التحكم والوصول الطارئ' }
    },
    national_authority_admin: {
      view: 'desk',
      label: { en: 'Standards & Policy Console', so: 'Halbeegyada & Siyaasadda', ar: 'المعايير والسياسات' }
    },
    director_general: {
      view: 'desk',
      label: { en: 'Official Designation Desk', so: 'Xafiiska Ansixinta Rasmiga', ar: 'مكتب الاعتماد الرسمي' }
    },
    department_admin: {
      view: 'desk',
      label: { en: 'Department Queues & SLAs', so: 'Safafka Shaqada Waaxda', ar: 'قوائم القسم والأداء' }
    },
    regional_admin: {
      view: 'desk',
      label: { en: 'Regional Publication Queue', so: 'Daabacaadda Gobolka Banaadir', ar: 'قائمة نشر الإقليم' }
    },
    district_admin: {
      view: 'desk',
      label: { en: 'Hodan Approval Queue', so: 'Ansixinta Degmada Hodan', ar: 'موافقات مديرية هودان' }
    },
    gis_officer: {
      view: 'map',
      label: { en: 'Open Spatial GIS Console', so: 'Fur Khariidadda GIS', ar: 'فتح الخريطة الجغرافية' }
    },
    data_quality_officer: {
      view: 'desk',
      label: { en: 'Review Duplicate Flags', so: 'Eeg Ciwaanada Labalaabka', ar: 'مراجعة السجلات المكررة' }
    },
    field_ops_supervisor: {
      view: 'desk',
      label: { en: 'Manage Survey Packages', so: 'Maamul Kooxaha Sahanka', ar: 'إدارة حزم المسح' }
    },
    field_surveyor: {
      view: 'desk',
      label: { en: 'Offline Capture & Sync', so: 'Sync-ga Goobta (Offline)', ar: 'المزامنة الميدانية' }
    },
    address_verifier: {
      view: 'desk',
      label: { en: 'Inspect Verification Queue', so: 'Hubi Caddeymaha Taagan', ar: 'مراجعة قائمة التحقق' }
    },
    auditor: {
      view: 'desk',
      label: { en: 'Inspect Audit Trail (Read-Only)', so: 'Diiwaanka Hanti-dhowrka', ar: 'سجل التدقيق (للقراءة)' }
    },
    institutional_api_client: {
      view: 'partners',
      label: { en: 'Open Emergency Dispatch', so: 'Fur Console-ka Gurmadka', ar: 'فتح وحدة الطوارئ' }
    }
  };

  const secondaryActions: Record<UserRole, { view: string; label: Record<Language, string> }> = {
    public_citizen: {
      view: 'map',
      label: { en: 'Explore the Map', so: 'Eeg Khariidadda', ar: 'استكشاف الخريطة' }
    },
    institutional_api_client: {
      view: 'search',
      label: { en: 'Verify Public Code', so: 'Hubi Koodka Ciwaanka', ar: 'التحقق من الرمز' }
    },
    gis_officer: {
      view: 'desk',
      label: { en: 'Boundary Dry-Run Tools', so: 'Qalabka Xudduudaha GIS', ar: 'أدوات الحدود' }
    },
    auditor: {
      view: 'registry',
      label: { en: 'Inspect Registry (Read-Only)', so: 'Eeg Diiwaanka (Akhris Keliya)', ar: 'فحص السجل (للقراءة)' }
    },
    national_super_admin: {
      view: 'stats',
      label: { en: 'System Health & Coverage', so: 'Tirakoobka Guud', ar: 'إحصاءات النظام' }
    },
    national_authority_admin: {
      view: 'stats',
      label: { en: 'National Coverage Stats', so: 'Tirakoobka Qaranka', ar: 'الإحصاءات الوطنية' }
    },
    director_general: {
      view: 'stats',
      label: { en: 'Executive Coverage Report', so: 'Warbixinta Qaranka', ar: 'التقرير التنفيذي' }
    },
    department_admin: {
      view: 'registry',
      label: { en: 'Browse Registry', so: 'Diiwaanka Ciwaanada', ar: 'تصفح السجل' }
    },
    regional_admin: {
      view: 'map',
      label: { en: 'Explore 17 Districts Map', so: 'Khariidadda 17-ka Degmo', ar: 'خريطة المديريات الـ 17' }
    },
    district_admin: {
      view: 'registry',
      label: { en: 'Hodan Address Registry', so: 'Diiwaanka Degmada Hodan', ar: 'سجل مديرية هودان' }
    },
    data_quality_officer: {
      view: 'registry',
      label: { en: 'Inspect Registry Records', so: 'Baadh Diiwaanka Xogta', ar: 'فحص السجلات' }
    },
    field_ops_supervisor: {
      view: 'map',
      label: { en: 'View Sector Coverage Map', so: 'Khariidadda Aagagga', ar: 'خريطة تغطية المسح' }
    },
    field_surveyor: {
      view: 'map',
      label: { en: 'Taleex Sector 4 Map', so: 'Khariidadda Taleex', ar: 'خريطة منطقة تاليح' }
    },
    address_verifier: {
      view: 'map',
      label: { en: 'Verify on District Map', so: 'Ka Hubi Khariidadda', ar: 'التحقق على الخريطة' }
    }
  };

  return {
    role,
    allowedDistrictIds,
    maskCoordinatesAndStreets,
    isReadOnly,
    canSubmitAddressRequest,
    canOrderPlates,
    canSubmitCorrections,
    defaultHomeHeroSubtitle: heroSubtitles[roleId],
    primaryAction: primaryActions[roleId],
    secondaryAction: secondaryActions[roleId],
    cardOverrides: {
      card1Desc: maskCoordinatesAndStreets
        ? {
            en: 'Masked by R01 policy unless time-boxed Break-Glass is active.',
            so: 'Xogta waa la qariyay (R01) ilaa Break-glass laga furo.',
            ar: 'البيانات مقنعة بموجب سياسة المشرف الأعلى.'
          }
        : allowedDistrictIds !== 'all'
        ? {
            en: `Scoped view: ${role.assignedArea}.`,
            so: `Xaddidan: ${role.assignedArea}.`,
            ar: `نطاق مقيّد: ${role.assignedArea}.`
          }
        : {
            en: isReadOnly
              ? 'Read-only inspection of canonical public & official records.'
              : 'Register, update, and manage physical addresses.',
            so: isReadOnly
              ? 'Kormeerka akhriska oo keliya ee diiwaanka ciwaanada.'
              : 'Diiwaangeli, cusbooneysii, oo maamul ciwaanada.',
            ar: isReadOnly
              ? 'فحص السجلات الرسمية للقراءة فقط.'
              : 'تسجيل وتحديث وإدارة العناوين الفعلية.'
          },
      card2Desc: maskCoordinatesAndStreets
        ? {
            en: 'District readiness visible; street pins masked until Break-Glass.',
            so: 'Heerka degmooyinka wuu muuqdaa; dhibcaha guryaha waa la qariyay.',
            ar: 'مستوى المديريات متاح مع إخفاء الإحداثيات الدقيقة.'
          }
        : allowedDistrictIds !== 'all'
        ? {
            en: `Explore map pins scoped to ${role.scope.en}.`,
            so: `Khariidadda u gaarka ah ${role.scope.so}.`,
            ar: `استكشاف الخريطة ضمن ${role.scope.ar}.`
          }
        : {
            en: 'Search and view addresses across Somalia.',
            so: 'Ka raadi oo ka eeg ciwaanada gudaha Soomaaliya.',
            ar: 'البحث وعرض العناوين عبر مقديشو والصومال.'
          },
      card3Desc: {
        en:
          allowedDistrictIds !== 'all'
            ? `Coverage & metrics filtered to ${role.scope.en}.`
            : 'Coverage, usage, and system statistics.',
        so:
          allowedDistrictIds !== 'all'
            ? `Tirakoobka ku kooban ${role.scope.so}.`
            : 'Tirakoobka degmooyinka iyo daboolidda nidaamka.',
        ar:
          allowedDistrictIds !== 'all'
            ? `إحصاءات مخصصة لنطاق ${role.scope.ar}.`
            : 'التغطية والاستخدام وإحصاءات النظام.'
      },
      card4Title:
        roleId === 'public_citizen'
          ? {
              en: 'System Administration',
              so: 'Maamulka Nidaamka & 14-ka Door',
              ar: 'إدارة النظام والأدوار (14)'
            }
          : {
              en: `${role.code} Role Workspace`,
              so: `Shaqada ${role.code}: ${role.name.so}`,
              ar: `مساحة عمل ${role.code}`
            },
      card4Desc:
        roleId === 'public_citizen'
          ? {
              en: 'Preview all 14 roles, permissions, and approvals.',
              so: 'Eeg dhammaan 14-ka door, ogolaanshaha, iyo ansixinta.',
              ar: 'معاينة جميع الأدوار الـ 14 والصلاحيات والاعتماد.'
            }
          : {
              en: role.summary.en,
              so: role.summary.so,
              ar: role.summary.ar
            }
    }
  };
}

export function filterAddressesByRole(addresses: AddressRecord[], roleId: UserRole): AddressRecord[] {
  const exp = getRoleExperience(roleId);
  if (exp.allowedDistrictIds === 'all') return addresses;
  return addresses.filter((a) => exp.allowedDistrictIds.includes(a.districtId));
}

export function filterDistrictsByRole(districts: DistrictInfo[], roleId: UserRole): DistrictInfo[] {
  const exp = getRoleExperience(roleId);
  if (exp.allowedDistrictIds === 'all') return districts;
  return districts.filter((d) => exp.allowedDistrictIds.includes(d.id));
}

const MODULE_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Global System Overview': { en: 'Global System Overview', so: 'Guudmarka Nidaamka Caalamiga ah', ar: 'نظرة عامة على النظام العالمي' },
  'System Configuration': { en: 'System Configuration', so: 'Habaynta Nidaamka', ar: 'تكوين النظام' },
  'User Accounts Management': { en: 'User Accounts Management', so: 'Maamulka Koontooyinka Isticmaalayaasha', ar: 'إدارة حسابات المستخدمين' },
  'Role & Permission Management': { en: 'Role & Permission Management', so: 'Maamulka Doorka & Ruhsada', ar: 'إدارة الأدوار والصلاحيات' },
  'Security Monitoring': { en: 'Security Monitoring', so: 'Kormeerka Amniga', ar: 'مراقبة الأمان' },
  'Authentication & MFA Management': { en: 'Authentication & MFA Management', so: 'Maamulka Aqoonsiga & MFA', ar: 'المصادقة وإدارة MFA' },
  'API Infrastructure': { en: 'API Infrastructure', so: 'Kaabayaasha API', ar: 'بنية API التحتية' },
  'Database & Backup Status': { en: 'Database & Backup Status', so: 'Xaaladda Database & Kaydinta', ar: 'حالة قاعدة البيانات والنسخ الاحتياطي' },
  'System Logs': { en: 'System Logs', so: 'Diiwaanka Nidaamka (Logs)', ar: 'سجلات النظام' },
  'Platform Health': { en: 'Platform Health', so: 'Caafimaadka Platform-ka', ar: 'صحة المنصة' },
  'Emergency Access Management': { en: 'Emergency Access Management', so: 'Maamulka Gelitaanka Degdegga ah (Break-Glass)', ar: 'إدارة الوصول الطارئ' },

  'National Overview': { en: 'National Overview', so: 'Guudmarka Qaranka', ar: 'نظرة عامة وطنية' },
  'National Address Registry': { en: 'National Address Registry', so: 'Diiwaanka Ciwaanada Qaranka', ar: 'سجل العناوين الوطني' },
  'All Regions & Districts': { en: 'All Regions & Districts', so: 'Dhammaan Gobollada & Degmooyinka', ar: 'كافة الأقاليم والمديريات' },
  'Department Management': { en: 'Department Management', so: 'Maamulka Waaxyaha', ar: 'إدارة الأقسام' },
  'National Address Standards': { en: 'National Address Standards', so: 'Halbeegyada Ciwaanada Qaranka', ar: 'معايير العنونة الوطنية' },
  'Address Code Management': { en: 'Address Code Management', so: 'Maamulka Koodadka Ciwaanka', ar: 'إدارة رموز العناوين' },
  'National Staff Management': { en: 'National Staff Management', so: 'Maamulka Shaqaalaha Qaranka', ar: 'إدارة الموظفين الوطنيين' },
  'Regional Performance': { en: 'Regional Performance', so: 'Waxqabadka Gobollada', ar: 'الأداء الإقليمي' },
  'National Reports': { en: 'National Reports', so: 'Warbixinada Qaranka', ar: 'التقارير الوطنية' },
  'Approval Monitoring': { en: 'Approval Monitoring', so: 'Kormeerka Ansixinada', ar: 'مراقبة الموافقات' },
  'Data Quality Overview': { en: 'Data Quality Overview', so: 'Guudmarka Tayada Xogta', ar: 'نظرة عامة على جودة البيانات' },

  'Executive Dashboard': { en: 'Executive Dashboard', so: 'Dashboard-ka Fulinta', ar: 'لوحة القيادة التنفيذية' },
  'National Performance Overview': { en: 'National Performance Overview', so: 'Guudmarka Waxqabadka Qaranka', ar: 'نظرة عامة على الأداء الوطني' },
  'Regional Progress': { en: 'Regional Progress', so: 'Horumarka Gobollada', ar: 'التقدم الإقليمي' },
  'National Coverage Reports': { en: 'National Coverage Reports', so: 'Warbixinada Daboolidda Qaranka', ar: 'تقارير التغطية الوطنية' },
  'Pending Executive Approvals': { en: 'Pending Executive Approvals', so: 'Ansixinta Fulinta ee Sugaysa', ar: 'الموافقات التنفيذية المعلقة' },
  'Official Address Designation Requests': { en: 'Official Address Designation Requests', so: 'Codsiyada Magacaabista Ciwaanka Rasmiga ah', ar: 'طلبات تحديد العناوين الرسمية' },
  'Publication Requests': { en: 'Publication Requests', so: 'Codsiyada Daabacaadda', ar: 'طلبات النشر' },
  'Governance Reports': { en: 'Governance Reports', so: 'Warbixinada Maamulka & Hogaanka', ar: 'تقارير الحوكمة' },
  'Compliance Overview': { en: 'Compliance Overview', so: 'Guudmarka U-hoggaansanka', ar: 'نظرة عامة على الامتثال' },
  'Decision History': { en: 'Decision History', so: 'Taariikhda Go\'aannada', ar: 'تاريخ القرارات' },

  'Department Dashboard': { en: 'Department Dashboard', so: 'Dashboard-ka Waaxda', ar: 'لوحة قيادة القسم' },
  'Department Address Requests': { en: 'Department Address Requests', so: 'Codsiyada Ciwaanka Waaxda', ar: 'طلبات عناوين القسم' },
  'Department Work Queue': { en: 'Department Work Queue', so: 'Safka Shaqada Waaxda', ar: 'قائمة عمل القسم' },
  'Department Staff': { en: 'Department Staff', so: 'Shaqaalaha Waaxda', ar: 'موظفو القسم' },
  'Staff Assignments': { en: 'Staff Assignments', so: 'Qaybinta Shaqaalaha', ar: 'تعيينات الموظفين' },
  'Department Reports': { en: 'Department Reports', so: 'Warbixinada Waaxda', ar: 'تقارير القسم' },
  'Pending Tasks': { en: 'Pending Tasks', so: 'Hawlaha Sugaya', ar: 'المهام المعلقة' },
  'Department Performance': { en: 'Department Performance', so: 'Waxqabadka Waaxda', ar: 'أداء القسم' },
  'Escalated Requests': { en: 'Escalated Requests', so: 'Codsiyada La Kacsan', ar: 'الطلبات المُصعَّدة' },
  'Activity History': { en: 'Activity History', so: 'Taariikhda Dhaqdhaqaaqa', ar: 'سجل النشاطات' },

  'Regional Dashboard': { en: 'Regional Dashboard', so: 'Dashboard-ka Gobolka', ar: 'لوحة القيادة الإقليمية' },
  'Regional Address Registry': { en: 'Regional Address Registry', so: 'Diiwaanka Ciwaanada Gobolka', ar: 'سجل العناوين الإقليمي' },
  'Districts Under Region': { en: 'Districts Under Region', so: 'Degmooyinka Hoos Yimaada Gobolka', ar: 'المديريات التابعة للإقليم' },
  'District Performance': { en: 'District Performance', so: 'Waxqabadka Degmooyinka', ar: 'أداء المديريات' },
  'Regional Address Requests': { en: 'Regional Address Requests', so: 'Codsiyada Ciwaanada Gobolka', ar: 'طلبات العناوين الإقليمية' },
  'Regional Verification Queue': { en: 'Regional Verification Queue', so: 'Safka Xaqiijinta Gobolka', ar: 'قائمة التحقق الإقليمية' },
  'Regional Staff': { en: 'Regional Staff', so: 'Shaqaalaha Gobolka', ar: 'موظفو الإقليم' },
  'Field Operations': { en: 'Field Operations', so: 'Hawlaha Goobta', ar: 'العمليات الميدانية' },
  'Regional Coverage Map': { en: 'Regional Coverage Map', so: 'Khariidadda Daboolidda Gobolka', ar: 'خريطة التغطية الإقليمية' },
  'Regional Reports': { en: 'Regional Reports', so: 'Warbixinada Gobolka', ar: 'التقارير الإقليمية' },
  'Escalations': { en: 'Escalations', so: 'Cabashooyinka / Kicinta', ar: 'التصعيدات' },

  'District Dashboard': { en: 'District Dashboard', so: 'Dashboard-ka Degmada', ar: 'لوحة قيادة المديرية' },
  'District Address Registry': { en: 'District Address Registry', so: 'Diiwaanka Ciwaanada Degmada', ar: 'سجل عناوين المديرية' },
  'Address Applications': { en: 'Address Applications', so: 'Codsiyada Ciwaanka', ar: 'طلبات العناوين' },
  'Pending Address Requests': { en: 'Pending Address Requests', so: 'Codsiyada Sugaya', ar: 'طلبات العناوين المعلقة' },
  'Verification Queue': { en: 'Verification Queue', so: 'Safka Xaqiijinta', ar: 'قائمة التحقق' },
  'District Staff': { en: 'District Staff', so: 'Shaqaalaha Degmada', ar: 'موظفو المديرية' },
  'Field Survey Assignments': { en: 'Field Survey Assignments', so: 'Xilalka Sahanka Goobta', ar: 'مهام المسح الميداني' },
  'Address Corrections': { en: 'Address Corrections', so: 'Sixidda Ciwaanada', ar: 'تصحيحات العناوين' },
  'District Map': { en: 'District Map', so: 'Khariidadda Degmada', ar: 'خريطة المديرية' },
  'District Reports': { en: 'District Reports', so: 'Warbixinada Degmada', ar: 'تقارير المديرية' },
  'Complaints & Appeals': { en: 'Complaints & Appeals', so: 'Cabashooyinka & Dacwadaha', ar: 'الشكاوى والطعون' },

  'GIS Workspace': { en: 'GIS Workspace', so: 'Goobta Shaqada GIS', ar: 'مساحة عمل GIS' },
  'National / Assigned Area Map': { en: 'National / Assigned Area Map', so: 'Khariidadda Qaranka / Aagga Loo Xilsaaray', ar: 'خريطة الوطن / المنطقة المخصصة' },
  'Administrative Boundaries': { en: 'Administrative Boundaries', so: 'Xudduudaha Maamulka', ar: 'الحدود الإدارية' },
  'Regional & District Layers': { en: 'Regional & District Layers', so: 'Lakabyada Gobolka & Degmada', ar: 'الطبقات الإقليمية والمديريات' },
  'Street Network': { en: 'Street Network', so: 'Shabakadda Waddooyinka', ar: 'شبكة الشوارع' },
  'Building Footprints': { en: 'Building Footprints', so: 'Cabirrada Dhismayaasha', ar: 'بصمات المباني' },
  'Address Coordinates': { en: 'Address Coordinates', so: 'Iskudhafka Ciwaanada (GPS)', ar: 'إحداثيات العناوين' },
  'Spatial Data Imports': { en: 'Spatial Data Imports', so: 'Soo-dejinta Xogta Juqraafiga', ar: 'استيراد البيانات المكانية' },
  'Map Layer Management': { en: 'Map Layer Management', so: 'Maamulka Lakabyada Khariidadda', ar: 'إدارة طبقات الخريطة' },
  'Geospatial Data Validation': { en: 'Geospatial Data Validation', so: 'Xaqiijinta Xogta Juqraafiga', ar: 'التحقق من البيانات المكانية' },
  'GIS Reports': { en: 'GIS Reports', so: 'Warbixinada GIS', ar: 'تقارير GIS' },

  'Data Quality Dashboard': { en: 'Data Quality Dashboard', so: 'Dashboard-ka Tayada Xogta', ar: 'لوحة جودة البيانات' },
  'Duplicate Address Detection': { en: 'Duplicate Address Detection', so: 'Ogaanshaha Ciwaanada Labalaabka ah', ar: 'كشف العناوين المكررة' },
  'Invalid Coordinates': { en: 'Invalid Coordinates', so: 'Iskudhafka Khaldan', ar: 'الإحداثيات غير الصالحة' },
  'Missing Address Information': { en: 'Missing Address Information', so: 'Macluumaadka Maqan', ar: 'معلومات العنوان الناقصة' },
  'Inconsistent Address Records': { en: 'Inconsistent Address Records', so: 'Diiwaanka Ciwaanada Is-khilaafsan', ar: 'سجلات العناوين غير المتسقة' },
  'Data Validation Queue': { en: 'Data Validation Queue', so: 'Safka Xaqiijinta Xogta', ar: 'قائمة التحقق من البيانات' },
  'Quality Flags': { en: 'Quality Flags', so: 'Calaamadaha Tayada', ar: 'علامات الجودة' },
  'Suspected Duplicate Records': { en: 'Suspected Duplicate Records', so: 'Diiwaannada Laga Shakisan yahay', ar: 'السجلات المكررة المشتبه بها' },
  'Data Correction Proposals': { en: 'Data Correction Proposals', so: 'Soo-jeedinta Sixidda Xogta', ar: 'مقترحات تصحيح البيانات' },
  'Data Quality Reports': { en: 'Data Quality Reports', so: 'Warbixinada Tayada Xogta', ar: 'تقارير جودة البيانات' },

  'Field Operations Dashboard': { en: 'Field Operations Dashboard', so: 'Dashboard-ka Hawlaha Goobta', ar: 'لوحة العمليات الميدانية' },
  'Survey Projects': { en: 'Survey Projects', so: 'Mashaariicda Sahanka', ar: 'مشاريع المسح' },
  'Survey Team Management': { en: 'Survey Team Management', so: 'Maamulka Kooxda Sahanka', ar: 'إدارة فرق المسح' },
  'Field Surveyor Accounts': { en: 'Field Surveyor Accounts', so: 'Koontooyinka Sahmiyeyaasha', ar: 'حسابات المساحين الميدانيين' },
  'Task Assignment': { en: 'Task Assignment', so: 'Qaybinta Shaqada', ar: 'تعيين المهام' },
  'Survey Progress Map': { en: 'Survey Progress Map', so: 'Khariidadda Horumarka Sahanka', ar: 'خريطة تقدم المسح' },
  'Pending Field Submissions': { en: 'Pending Field Submissions', so: 'Gudbinta Goobta ee Sugaysa', ar: 'التقديمات الميدانية المعلقة' },
  'Field Evidence Review': { en: 'Field Evidence Review', so: 'Eegista Caddeymaha Goobta', ar: 'مراجعة الأدلة الميدانية' },
  'GPS Capture Status': { en: 'GPS Capture Status', so: 'Xaaladda GPS-ka', ar: 'حالة التقاط GPS' },
  'Offline Sync Monitoring': { en: 'Offline Sync Monitoring', so: 'Kormeerka Sync-ga Offline-ka', ar: 'مراقبة المزامنة دون اتصال' },
  'Field Performance Reports': { en: 'Field Performance Reports', so: 'Warbixinada Waxqabadka Goobta', ar: 'تقارير الأداء الميداني' },

  'My Field Dashboard': { en: 'My Field Dashboard', so: 'Dashboard-kayga Goobta', ar: 'لوحة العمليات الميدانية الخاصة بي' },
  'My Assigned Tasks': { en: 'My Assigned Tasks', so: 'Shaqooykayga Loo Xilsaaray', ar: 'مهامي المخصصة' },
  'Assigned Survey Areas': { en: 'Assigned Survey Areas', so: 'Aagagga Sahanka Loo Xilsaaray', ar: 'مناطق المسح المخصصة' },
  'GPS Capture': { en: 'GPS Capture', so: 'Qaadista GPS-ka', ar: 'التقاط GPS' },
  'Building Registration Form': { en: 'Building Registration Form', so: 'Foomka Diiwaangelinta Dhismaha', ar: 'استمارة تسجيل المباني' },
  'Entrance Capture': { en: 'Entrance Capture', so: 'Qaadista Irridda', ar: 'التقاط المداخل' },
  'Address Observation Form': { en: 'Address Observation Form', so: 'Foomka Kormeerka Ciwaanka', ar: 'استمارة ملاحظة العنوان' },
  'Photo Evidence': { en: 'Photo Evidence', so: 'Sawirada Caddeynta', ar: 'الأدلة الفوتوغرافية' },
  'Offline Records': { en: 'Offline Records', so: 'Diiwaannada Offline-ka', ar: 'السجلات غير المتصلة' },
  'Synchronization Queue': { en: 'Synchronization Queue', so: 'Safka Sync-ga (Muzamnadaha)', ar: 'قائمة المزامنة' },
  'Submission History': { en: 'Submission History', so: 'Taariikhda Gudbinta', ar: 'تاريخ التقديم' },

  'Verification Dashboard': { en: 'Verification Dashboard', so: 'Dashboard-ka Xaqiijinta', ar: 'لوحة التحقق' },
  'Pending Verification Queue': { en: 'Pending Verification Queue', so: 'Safka Xaqiijinta ee Sugaya', ar: 'قائمة التحقق المعلقة' },
  'Address Details': { en: 'Address Details', so: 'Faahfaahinta Ciwaanka', ar: 'تفاصيل العنوان' },
  'GPS Location Review': { en: 'GPS Location Review', so: 'Eegista Goobta GPS', ar: 'مراجعة موقع GPS' },
  'Building Evidence': { en: 'Building Evidence', so: 'Caddeymaha Dhismaha', ar: 'أدلة المباني' },
  'Photo Evidence Viewer': { en: 'Photo Evidence Viewer', so: 'Eegista Sawirada Caddeynta', ar: 'عارض الأدلة الفوتوغرافية' },
  'Address Information Review': { en: 'Address Information Review', so: 'Dib-u-eegista Macluumaadka Ciwaanka', ar: 'مراجعة معلومات العنوان' },
  'Duplicate Warnings': { en: 'Duplicate Warnings', so: 'Digniinta Labalaabka', ar: 'تحذيرات التكرار' },
  'Verification History': { en: 'Verification History', so: 'Taariikhda Xaqiijinta', ar: 'تاريخ التحقق' },
  'Return for Correction Queue': { en: 'Return for Correction Queue', so: 'Safka Celinta Sixidda', ar: 'قائمة الإعادة للتصحيح' },

  'Audit Dashboard': { en: 'Audit Dashboard', so: 'Dashboard-ka Hanti-dhowrka', ar: 'لوحة التدقيق' },
  'Complete Audit Logs': { en: 'Complete Audit Logs', so: 'Diiwaanka Audit-ka oo Buuxa', ar: 'سجلات التدقيق الكاملة' },
  'User Activity History': { en: 'User Activity History', so: 'Taariikhda Dhaqdhaqaaqa Isticmaalaha', ar: 'تاريخ نشاط المستخدم' },
  'Address Change History': { en: 'Address Change History', so: 'Taariikhda Isbeddelka Ciwaanka', ar: 'تاريخ تغيير العنوان' },
  'Approval History': { en: 'Approval History', so: 'Taariikhda Ansixinta', ar: 'تاريخ الموافقات' },
  'Role & Permission Changes': { en: 'Role & Permission Changes', so: 'Isbeddellada Doorka & Ruhsada', ar: 'تغييرات الأدوار والصلاحيات' },
  'Login History': { en: 'Login History', so: 'Taariikhda Galitaanka', ar: 'تاريخ تسجيل الدخول' },
  'Data Export History': { en: 'Data Export History', so: 'Taariikhda Dhoofinta Xogta', ar: 'تاريخ تصدير البيانات' },
  'Security Events': { en: 'Security Events', so: 'Dhacdooyinka Amniga', ar: 'الأحداث الأمنية' },
  'Compliance Reports': { en: 'Compliance Reports', so: 'Warbixinada U-hoggaansanka', ar: 'تقارير الامتثال' },
  'Audit Evidence': { en: 'Audit Evidence', so: 'Caddeymaha Audit-ka', ar: 'أدلة التدقيق' },

  'Public Homepage': { en: 'Public Homepage', so: 'Bogga Hore ee Dadweynaha', ar: 'الصفحة الرئيسية العامة' },
  'Search Address': { en: 'Search Address', so: 'Raadi Ciwaanka', ar: 'البحث عن عنوان' },
  'Explore Somalia Map': { en: 'Explore Somalia Map', so: 'Baadh Khariidadda Soomaaliya', ar: 'استكشاف خريطة الصومال' },
  'Address QR Verification': { en: 'Address QR Verification', so: 'Hubinta QR-ka Ciwaanka', ar: 'التحقق من رمز الاستجابة السريعة (QR)' },
  'Request New Address': { en: 'Request New Address', so: 'Codso Ciwaan Cusub', ar: 'طلب عنوان جديد' },
  'Report Incorrect Address': { en: 'Report Incorrect Address', so: 'Sheeg Ciwaan Khalad ah', ar: 'الإبلاغ عن عنوان غير صحيح' },
  'Correction Requests': { en: 'Correction Requests', so: 'Codsiyada Sixidda', ar: 'طلبات التصحيح' },
  'My Applications': { en: 'My Applications', so: 'Codsiyadayda', ar: 'طلباتي' },
  'My Request Status': { en: 'My Request Status', so: 'Xaaladda Codsiga', ar: 'حالة طلبي' },
  'Address Sharing': { en: 'Address Sharing', so: 'Wadaagista Ciwaanka', ar: 'مشاركات العنوان' },

  'API Documentation': { en: 'API Documentation', so: 'Dukumeentiga API', ar: 'وثائق API' },
  'Credentials & Keys': { en: 'Credentials & Keys', so: 'Furayaasha & Aqoonsiga', ar: 'بيانات الاعتماد والمفاتيح' },
  'API Key Management': { en: 'API Key Management', so: 'Maamulka Furaha API', ar: 'إدارة مفاتيح API' },
  'Authorized Endpoints': { en: 'Authorized Endpoints', so: 'Endpoints-ka Loo Oggolaaday', ar: 'نقاط النهاية المصرح بها' },
  'Address Lookup API': { en: 'Address Lookup API', so: 'API-ga Raadinta Ciwaanka', ar: 'API بحث العنوان' },
  'Address Validation API': { en: 'Address Validation API', so: 'API-ga Xaqiijinta Ciwaanka', ar: 'API التحقق من العنوان' },
  'Geocoding API': { en: 'Geocoding API', so: 'Geocoding API', ar: 'Geocoding API' },
  'QR / Address Code Verification': { en: 'QR / Address Code Verification', so: 'Hubinta Koodhka QR / Ciwaanka', ar: 'التحقق من رمز QR / العنوان' },
  'API Usage Statistics': { en: 'API Usage Statistics', so: 'Tirakoobka Isticmaalka API', ar: 'إحصائيات استخدام API' },
  'Rate Limit Information': { en: 'Rate Limit Information', so: 'Xogta Xadka Isticmaalka (Rate Limit)', ar: 'معلومات حد المعدل' },
  'Integration Logs': { en: 'Integration Logs', so: 'Diiwaanka Isku-xirka', ar: 'سجلات التكامل' },
  'Error Monitoring': { en: 'Error Monitoring', so: 'Kormeerka Cilladaha', ar: 'مراقبة الأخطاء' }
};

export function getLocalizedModules(roleDef: RoleDefinition, language: Language): { id: string; label: string }[] {
  return roleDef.visibleModules.map((m) => ({
    id: m,
    label: MODULE_TRANSLATIONS[m]?.[language] || MODULE_TRANSLATIONS[m]?.['en'] || m
  }));
}

