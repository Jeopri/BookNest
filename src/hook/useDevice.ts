// hooks/useDeviceInfo.ts
export function useDeviceInfo() {
  const ua = navigator.userAgent;

  const getBrowser = () => {
    if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Edge";
    return "Unknown Browser";
  };

  const getOS = () => {
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac OS")) return "MacOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    return "Unknown OS";
  };

  return {
    browser: getBrowser(),
    os: getOS(),
    label: `${getBrowser()} / ${getOS()}`, // "Chrome / Windows"
  };
}