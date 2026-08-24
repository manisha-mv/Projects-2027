// routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Module Page Imports
import PatientList from '../pages/Patients/PatientList';
import PatientDetail from '../pages/Patients/PatientDetail';
import AppointmentList from '../pages/Appointments/AppointmentList';
import DoctorAppointments from '../pages/Appointments/DoctorAppointments';
import DoctorList from '../pages/Doctors/DoctorList';
import LabDashboard from '../pages/Laboratory/LabDashboard';
import RadiologyDashboard from '../pages/Radiology/RadiologyDashboard';
import PharmacyDashboard from '../pages/Pharmacy/PharmacyDashboard';
import PharmacyInventory from '../pages/PharmacyInventory/PharmacyInventory';
import NursingDashboard from '../pages/Nursing/NursingDashboard';
import IPDDashboard from '../pages/IPD/IPDDashboard';
import EmergencyDashboard from '../pages/Emergency/EmergencyDashboard';
import SurgeryDashboard from '../pages/Surgery/SurgeryDashboard';
import BillingDashboard from '../pages/Billing/BillingDashboard';
import InsuranceDashboard from '../pages/Insurance/InsuranceDashboard';
import BloodBankDashboard from '../pages/BloodBank/BloodBankDashboard';
import MedicalRecords from '../pages/MedicalRecords/MedicalRecords';
import DischargeDashboard from '../pages/Discharge/DischargeDashboard';
import FollowUpDashboard from '../pages/FollowUp/FollowUpDashboard';
import ComplaintDashboard from '../pages/Complaints/ComplaintDashboard';
import TreatmentTrace from '../pages/Traceability/TreatmentTrace';
import AuditLog from '../pages/Audit/AuditLog';
import DepartmentList from '../pages/Departments/DepartmentList';
import StaffList from '../pages/Staff/StaffList';
import ReportsDashboard from '../pages/Reports/ReportsDashboard';
import NotificationsPage from '../pages/Notifications/NotificationsPage';
import SettingsPage from '../pages/Settings/SettingsPage';

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* Protected / App Routes */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />

      {/* Patients */}
      <Route
        path="patients"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'LAB', 'RADIOLOGY', 'PHARMACIST', 'BILLING']}>
            <PatientList />
          </ProtectedRoute>
        }
      />
      <Route
        path="patients/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'LAB', 'RADIOLOGY', 'PHARMACIST', 'BILLING']}>
            <PatientDetail />
          </ProtectedRoute>
        }
      />

      {/* Appointments */}
      <Route
        path="appointments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE']}>
            <AppointmentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="appointments/doctor"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
            <DoctorAppointments />
          </ProtectedRoute>
        }
      />

      {/* Clinical Modules */}
      <Route
        path="doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
            <DoctorList />
          </ProtectedRoute>
        }
      />
      <Route
        path="nursing"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'NURSE', 'DOCTOR']}>
            <NursingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="laboratory"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'LAB', 'DOCTOR']}>
            <LabDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="radiology"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RADIOLOGY', 'DOCTOR']}>
            <RadiologyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="pharmacy"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
            <PharmacyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="ipd"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE']}>
            <IPDDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="emergency"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
            <EmergencyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="surgery"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE']}>
            <SurgeryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="discharge"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
            <DischargeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="followup"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE']}>
            <FollowUpDashboard />
          </ProtectedRoute>
        }
      />

      {/* Operations Modules */}
      <Route
        path="billing"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'BILLING', 'RECEPTIONIST']}>
            <BillingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="insurance"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'BILLING', 'INSURANCE']}>
            <InsuranceDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="pharmacy-inventory"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
            <PharmacyInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="blood-bank"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'LAB', 'DOCTOR', 'NURSE']}>
            <BloodBankDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="medical-records"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
            <MedicalRecords />
          </ProtectedRoute>
        }
      />

      {/* Flagship Feature: Treatment Traceability */}
      <Route
        path="traceability"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB', 'RADIOLOGY', 'PHARMACIST', 'BILLING']}>
            <TreatmentTrace />
          </ProtectedRoute>
        }
      />

      {/* Management Modules */}
      <Route
        path="departments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DepartmentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="staff"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <StaffList />
          </ProtectedRoute>
        }
      />
      <Route
        path="reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ReportsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="complaints"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'COMPLAINT_OFFICER']}>
            <ComplaintDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="audit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLog />
          </ProtectedRoute>
        }
      />
      <Route
        path="notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="settings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
