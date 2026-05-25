// Check deployed /auth/linkedin redirect without following redirects
const url = 'https://careercraft-dwn1.onrender.com/auth/linkedin';

(async () => {
  try {
    const res = await fetch(url, { redirect: 'manual' });
    console.log('Status:', res.status);
    console.log('Location:', res.headers.get('location'));
    const text = await res.text();
    if (text && text.length > 0) console.log('Body (truncated):', text.slice(0, 400));
  } catch (err) {
    console.error('Error checking deployed auth:', err);
  }
})();
