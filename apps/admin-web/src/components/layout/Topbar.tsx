import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

export default function Topbar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-title">QRMEAL</div>
      <div className="topbar-meta">
        <span className="topbar-chip">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="topbar-chip">{user?.name ?? "Owner"}</span>
      </div>
    </div>
  );
}
