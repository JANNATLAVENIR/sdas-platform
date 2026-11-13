export type Language = 'en' | 'so' | 'ar';

export type UserRole = 
  | 'national_super_admin'
  | 'national_authority_admin'
  | 'director_general'
  | 'department_admin'
  | 'regional_admin'
  | 'district_admin'
  | 'gis_officer'
  | 'data_quality_officer'
  | 'field_ops_supervisor'
  | 'field_surveyor'
  | 'address_verifier'
  | 'auditor'
  | 'public_citizen'
  | 'institutional_api_client';

export type WorkflowState = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verification'
  | 'correction_requested'
  | 'rejected'
  | 'withdrawn';

export type VerificationStatus = 'unverified' | 'verified' | 'disputed' | 'needs_correction';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type PublicationStatus = 'unpublished' | 'published' | 'restricted' | 'archived' | 'retired';
export type DesignationStatus = 'none' | 'official';

export interface AddressComponent {
  country: string;
  region: string;
  district: string;
  locality: string;
  street?: string;
  buildingNumber?: string;
  unit?: string;
  landmark?: string;
}

export interface AddressRecord {
  id: string; // UUID
  publicCode: string; // e.g., SDAS-MOG-7482
  districtId: string;
  components: AddressComponent;
  addressType: 'residential' | 'commercial' | 'public_facility' | 'idp_site' | 'infrastructure' | 'administrative';
  workflowState: WorkflowState;
  verificationStatus: VerificationStatus;
  approvalStatus: ApprovalStatus;
  publicationStatus: PublicationStatus;
  designationStatus: DesignationStatus;
  authorityReference?: string;
  location: {
    type: 'Point' | 'Polygon';
    coordinates: [number, number]; // [lon, lat]
    accuracyMeters: number;
    captureMethod: 'field_survey' | 'orthophoto' | 'assisted_gps';
  };
  provenance: {
    sourceType: string;
    sourceRef: string;
    surveyorId?: string;
    capturedAt: string;
    verifiedBy?: string;
  };
  dataVersion: number;
  updatedAt: string;
}

export interface DistrictInfo {
  id: string;
  name: string;
  nameSo: string;
  nameAr: string;
  region: string;
  estimatedInventory: number;
  mappedBuildings: number;
  verifiedEntrances: number;
  approvedDesignations: number;
  readinessStatus: 'mobilisation' | 'survey_active' | 'live_wave_1' | 'fully_operational';
}

export interface SurveyTask {
  id: string;
  districtId: string;
  title: string;
  assignedTeam: string;
  status: 'assigned' | 'in_progress' | 'synced' | 'flagged';
  targetCount: number;
  completedCount: number;
  date: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  targetId: string;
  details: string;
  ipHash: string;
}
