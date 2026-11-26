export default function Loading({ text = 'Loading ElectroMart...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 20px',
        gap: '14px',
        color: 'var(--text-secondary)',
      }}
      role="status"
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-orange)',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{text}</span>
    </div>
  );
}
