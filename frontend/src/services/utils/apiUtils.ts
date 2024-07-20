// service/utils/apiUtils.ts
export const getApiUrl = () => {
    const { hostname } = window.location;
    const tenantMap: { [key: string]: string } = {
      'lynx.localhost': 'http://lynx.localhost:4000',
      'keromax.localhost': 'http://keromax.localhost:4000',
      'lynx.yourdomain.com': 'https://lynx.yourdomain.com',
      'keromax.yourdomain.com': 'https://keromax.yourdomain.com',
    };
  
    return tenantMap[hostname] || 'http://localhost:4000'; // Default URL
  };
  