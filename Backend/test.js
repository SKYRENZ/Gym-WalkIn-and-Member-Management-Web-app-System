const membershipId = 1; // Replace with a valid membership ID
generateQRCode(membershipId)
    .then(path => console.log(`QR code generated at: ${path}`))
    .catch(err => console.error('Error generating QR code:', err));