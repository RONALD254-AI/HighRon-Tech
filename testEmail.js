const sendVerificationEmail = require('./utils/emailService');

sendVerificationEmail('ronaldsneekord002@gmail.com', 'test-token')
    .then(() => console.log('✅ Email test sent!'))
    .catch((err) => console.error('❌ Email test failed:', err));
