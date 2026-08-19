export default async function handler(req, res) {
  // 1. Only allow POST requests from your front-end
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { employeeCode } = req.body;

  // 2. Safely read credentials from Vercel Environment Variables
  const username = process.env.ESSL_USERNAME;
  const password = process.env.ESSL_PASSWORD;
  const eBioServerUrl = process.env.ESSL_SERVER_URL; 

  // 3. Construct the XML payload exactly as eBioServer expects
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://w3.org" xmlns:xsd="http://w3.org" xmlns:soap="http://xmlsoap.org">
    <soap:Body>
      <GetEmployeeDetails xmlns="http://tempuri.org">
        <UserName>${username}</UserName>
        <Password>${password}</Password>
        <EmployeeCode>${employeeCode}</EmployeeCode>
      </GetEmployeeDetails>
    </soap:Body>
  </soap:Envelope>`;

  try {
    // 4. Send the request securely from Vercel to your eBioServer
    const response = await fetch(eBioServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.orgGetEmployeeDetails'
      },
      body: soapEnvelope
    });

    const xmlData = await response.text();
    
    // 5. Return the raw XML string back to your frontend
    return res.status(200).json({ data: xmlData });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to eBioServer', details: error.message });
  }
}

