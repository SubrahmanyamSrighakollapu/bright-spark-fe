export interface ParsedUserAgent {
  browser: string;
  os: string;
  device: string;
}

export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  const agent = (ua || '').trim();
  if (!agent) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };

  let browser = 'Unknown';
  if (/Edg\//i.test(agent)) browser = 'Edge';
  else if (/OPR\//i.test(agent) || /Opera/i.test(agent)) browser = 'Opera';
  else if (/Chrome\//i.test(agent) && !/Chromium/i.test(agent)) browser = 'Chrome';
  else if (/Chromium\//i.test(agent)) browser = 'Chromium';
  else if (/Firefox\//i.test(agent) || /FxiOS\//i.test(agent)) browser = 'Firefox';
  else if (/Safari\//i.test(agent) && !/Chrome/i.test(agent)) browser = 'Safari';
  else if (/MSIE |Trident\//i.test(agent)) browser = 'Internet Explorer';

  let os = 'Unknown';
  if (/Windows NT 10/i.test(agent)) os = 'Windows 10/11';
  else if (/Windows NT 6\.3/i.test(agent)) os = 'Windows 8.1';
  else if (/Windows NT 6\.2/i.test(agent)) os = 'Windows 8';
  else if (/Windows NT 6\.1/i.test(agent)) os = 'Windows 7';
  else if (/Windows/i.test(agent)) os = 'Windows';
  else if (/Mac OS X ([\d_]+)/i.test(agent)) os = 'macOS';
  else if (/Android ([\d.]+)/i.test(agent)) os = 'Android';
  else if (/iPhone OS ([\d_]+)/i.test(agent) || /iPad/i.test(agent)) os = 'iOS';
  else if (/Linux/i.test(agent)) os = 'Linux';

  let device = 'Desktop';
  if (/Mobi|Android|iPhone|iPod/i.test(agent)) device = 'Mobile';
  else if (/iPad|Tablet/i.test(agent)) device = 'Tablet';

  return { browser, os, device };
}
