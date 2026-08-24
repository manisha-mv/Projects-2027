// pages/PlaceholderPage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { RiTimeLine, RiCodeLine } from 'react-icons/ri';

const ROUTE_META = {
  '/patients':     { label: 'Patient Management',    desc: 'View, register, and manage patient records, medical history, and clinical notes.' },
  '/appointments': { label: 'Appointments',          desc: 'Schedule, manage, and track doctor appointments and consultations.' },
  '/doctors':      { label: 'Doctor Management',     desc: 'Manage doctor profiles, schedules, specializations, and assignments.' },
  '/laboratory':   { label: 'Laboratory',            desc: 'Handle lab test orders, results, reports, and workflow management.' },
  '/radiology':    { label: 'Radiology',             desc: 'Manage radiology requests, imaging, reports, and PACS integration.' },
  '/pharmacy':     { label: 'Pharmacy',              desc: 'Track prescriptions, medicine inventory, dispensing, and drug management.' },
  '/nursing':      { label: 'Nursing',               desc: 'Manage nursing shifts, patient care notes, vitals, and ward tasks.' },
  '/ipd':          { label: 'IPD / Bed Management',  desc: 'Monitor inpatient admissions, bed availability, and ward allocations.' },
  '/emergency':    { label: 'Emergency Department',  desc: 'Track emergency cases, triage, and critical care workflows.' },
  '/surgery':      { label: 'Surgery Management',    desc: 'Schedule and manage surgical procedures, OT bookings, and post-op care.' },
  '/billing':      { label: 'Billing & Finance',     desc: 'Generate invoices, process payments, manage accounts and financial reports.' },
  '/insurance':    { label: 'Insurance Management',  desc: 'Handle insurance claims, pre-authorizations, and coverage verification.' },
  '/reports':      { label: 'Reports & Analytics',   desc: 'View hospital-wide reports, analytics dashboards, and KPI metrics.' },
  '/complaints':   { label: 'Complaints',            desc: 'Track and resolve patient and staff complaints and feedback.' },
  '/settings':     { label: 'System Settings',       desc: 'Configure hospital profile, departments, users, roles, and system preferences.' },
};

const PlaceholderPage = () => {
  const { pathname } = useLocation();
  const meta = ROUTE_META[pathname] ?? { label: 'Module', desc: 'This module is under development.' };

  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="placeholder-icon">
          <RiTimeLine />
        </div>
        <div className="placeholder-badge">
          <RiCodeLine size={12} />
          Under Development
        </div>
        <h1 className="placeholder-title">{meta.label}</h1>
        <p className="placeholder-desc">{meta.desc}</p>
        <div className="placeholder-note">
          This module will be fully implemented in the next development phase.
          The design system and navigation are ready for integration.
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
