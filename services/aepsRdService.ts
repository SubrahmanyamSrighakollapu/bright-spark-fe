const ports = [11100, 11101, 11102, 11103, 11104, 11105];

function captureOptions(wadh = '') {
  return `<?xml version="1.0"?><PidOptions ver="1.0"><Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="10000" otp="" wadh="${wadh.replace(/[&<>'"]/g, '')}" posh="UNKNOWN" env="P" /></PidOptions>`;
}

export async function captureFingerprint(wadh = ''): Promise<string> {
  let lastError = 'Registered Device service was not found.';
  for (const port of ports) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/rd/capture`, { method: 'CAPTURE', headers: { 'Content-Type': 'text/xml' }, body: captureOptions(wadh) });
      const xml = await response.text();
      const documentXml = new DOMParser().parseFromString(xml, 'text/xml');
      const resp = documentXml.querySelector('Resp'); const errorCode = resp?.getAttribute('errCode');
      if (errorCode === '0' && documentXml.querySelector('Data')) return xml;
      lastError = resp?.getAttribute('errInfo') || `RD service returned error ${errorCode || 'UNKNOWN'}`;
    } catch (error) { lastError = error instanceof Error ? error.message : lastError; }
  }
  throw new Error(`${lastError} Start the certified RD service and connect the registered biometric device.`);
}
