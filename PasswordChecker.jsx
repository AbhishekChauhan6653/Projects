import React, { useState, useCallback } from 'react';

const PasswordStrengthChecker = () => {
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_BASE = 'http://localhost:5000/api';

  const analyzePassword = useCallback(async (pwd) => {
    if (!pwd) {
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/check-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });

      if (!response.ok) throw new Error('Failed to analyze password');
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    analyzePassword(pwd);
  };

  const generatePassword = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/generate-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length: 16 }),
      });

      if (!response.ok) throw new Error('Failed to generate password');
      const data = await response.json();
      setPassword(data.password);
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthColor = (strength) => {
    const colors = {
      'Very Weak': '#ef4444',
      'Weak': '#f97316',
      'Fair': '#eab308',
      'Strong': '#84cc16',
      'Very Strong': '#22c55e',
    };
    return colors[strength] || '#6b7280';
  };

  const getStrengthGradient = (score) => {
    if (score < 20) return 'linear-gradient(90deg, #ef4444 0%, #ef4444 100%)';
    if (score < 40) return 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)';
    if (score < 60) return 'linear-gradient(90deg, #eab308 0%, #f97316 100%)';
    if (score < 80) return 'linear-gradient(90deg, #84cc16 0%, #eab308 100%)';
    return 'linear-gradient(90deg, #22c55e 0%, #84cc16 100%)';
  };

  const CriteriaIndicator = ({ met, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: met ? '#22c55e' : '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        {met ? '✓' : ''}
      </div>
      <span style={{ fontSize: '14px', color: met ? '#374151' : '#9ca3af' }}>
        {label}
      </span>
    </div>
  );

  const PatternWarning = ({ detected, label }) => (
    detected && (
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          marginBottom: '8px',
          fontSize: '13px',
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '14px' }}>⚠️</span>
        {label}
      </div>
    )
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: "'Geist', 'Segoe UI', system-ui, sans-serif",
        color: '#e2e8f0',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1
            style={{
              fontSize: '42px',
              fontWeight: '700',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Password Strength Checker
          </h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginTop: '12px' }}>
            Create secure passwords and check their strength instantly
          </p>
        </div>

        {/* Input Section */}
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>
            Enter Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Type your password..."
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#60a5fa';
                e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={generatePassword}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#34d399',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#10b981')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#34d399')}
            >
              🎲 Generate Strong Password
            </button>
            {password && (
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#60a5fa',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#3b82f6')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#60a5fa')}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: '#7f1d1d',
              border: '1px solid #dc2626',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#fecaca',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <>
            {/* Strength Overview */}
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cbd5e1', margin: 0 }}>Strength Assessment</h3>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: getStrengthColor(analysis.strength),
                  }}
                >
                  {analysis.strength}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#94a3b8' }}>Strength Score</span>
                  <span style={{ fontWeight: '600' }}>{analysis.score}/100</span>
                </div>
                <div
                  style={{
                    height: '8px',
                    backgroundColor: '#0f172a',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${analysis.score}%`,
                      background: getStrengthGradient(analysis.score),
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '13px',
                }}
              >
                <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Entropy</span>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#34d399' }}>
                    {analysis.entropy} bits
                  </div>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Crack Time</span>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#60a5fa' }}>
                    {analysis.crackTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Criteria Checklist */}
            <div
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cbd5e1', marginBottom: '16px', margin: '0 0 16px 0' }}>
                Password Criteria
              </h3>
              <CriteriaIndicator met={analysis.criteria.length} label={`At least 8 characters (${password.length}/8)`} />
              <CriteriaIndicator met={analysis.criteria.uppercase} label="Uppercase letters (A-Z)" />
              <CriteriaIndicator met={analysis.criteria.lowercase} label="Lowercase letters (a-z)" />
              <CriteriaIndicator met={analysis.criteria.numbers} label="Numbers (0-9)" />
              <CriteriaIndicator met={analysis.criteria.special} label="Special characters (!@#$%)" />
            </div>

            {/* Pattern Warnings */}
            {(analysis.patterns.sequential || analysis.patterns.repeated || analysis.patterns.keyboard) && (
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cbd5e1', marginBottom: '16px', margin: '0 0 16px 0' }}>
                  ⚠️ Weak Patterns Detected
                </h3>
                <PatternWarning detected={analysis.patterns.sequential} label="Sequential characters detected (abc, 123)" />
                <PatternWarning detected={analysis.patterns.repeated} label="Repeated characters detected (aaa, 111)" />
                <PatternWarning detected={analysis.patterns.keyboard} label="Keyboard patterns detected (qwerty, asdfgh)" />
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '24px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#cbd5e1', marginBottom: '16px', margin: '0 0 16px 0' }}>
                  💡 Improvement Suggestions
                </h3>
                {analysis.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#0f172a',
                      borderLeft: '3px solid #60a5fa',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#cbd5e1',
                    }}
                  >
                    → {rec}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#64748b', fontSize: '13px' }}>
          <p>Your password is analyzed locally. Never stored or transmitted.</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthChecker;
