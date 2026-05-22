function Error({ statusCode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>{statusCode || 'Error'}</h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          {statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}
        </p>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
