export const dynamic = 'force-dynamic';

export default function GlobalErrorPage() {
  return (
    <html>
      <body style={{display: 'flex', minHeight: '100vh', alignItems:'center', justifyContent:'center'}}>
        <div style={{textAlign: 'center'}}>
          <h1>Something went wrong</h1>
          <p>We're sorry — please try again later.</p>
          <div style={{marginTop: 12}}>
            <a href="/">Return to home</a>
          </div>
        </div>
      </body>
    </html>
  );
}