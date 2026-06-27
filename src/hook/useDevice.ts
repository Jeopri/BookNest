import { useEffect, useState } from 'react';

export function useDeviceInfo() {
  const [info, setInfo] = useState({ browser: '', os: '', label: '' });

  useEffect(() => {
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

    const browser = getBrowser();
    const os = getOS();
    setInfo({ browser, os, label: `${browser} / ${os}` });
  }, []);

  return info;
}