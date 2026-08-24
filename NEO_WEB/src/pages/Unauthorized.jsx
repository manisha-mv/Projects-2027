// pages/Unauthorized.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiForbid2Line, RiArrowLeftLine } from 'react-icons/ri';
import { Card, CardBody } from '../components/ui/Card';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: 'var(--space-6)',
    }}>
      <Card style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <CardBody style={{ padding: 'var(--space-8) var(--space-6)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-error-light)',
            color: 'var(--color-error)',
            marginBottom: 'var(--space-5)',
          }}>
            <RiForbid2Line size={32} />
          </div>
          
          <h1 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            Access Denied
          </h1>
          
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
            lineHeight: 1.5,
          }}>
            You do not have permission to view this page or perform this action. 
            Please contact your system administrator if you believe this is an error.
          </p>
          
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => navigate('/dashboard')}
          >
            <RiArrowLeftLine size={16} /> Return to Dashboard
          </button>
        </CardBody>
      </Card>
    </div>
  );
};

export default Unauthorized;
