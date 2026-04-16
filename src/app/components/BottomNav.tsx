import { useNavigate } from "react-router";
import {
  IconHome,
  IconMap,
  IconCamera,
  IconRoute,
  IconProfile,
} from "./ComicIcons";
import { useCamera } from "../context/CameraContext";
import { useLanguage } from "../context/LanguageContext";

type TabName = "Home" | "Map" | "Route" | "Profile" | "Camera";

interface BottomNavProps {
  activeTab: TabName;
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const navigate = useNavigate();
  const { openCamera } = useCamera();
  const { t } = useLanguage();

  const navItems: {
    id: TabName;
    label: string;
    path?: string;
    icon: (active: boolean) => React.ReactNode;
    action?: () => void;
  }[] = [
    {
      id: "Home",
      label: t("nav_home"),
      path: "/home",
      icon: (a) => <IconHome size={26} active={a} />,
    },
    {
      id: "Map",
      label: t("nav_map"),
      path: "/pictures",
      icon: (a) => <IconMap size={26} active={a} />,
    },
    {
      id: "Camera",
      label: t("nav_camera"),
      icon: () => <IconCamera size={26} />,
      action: openCamera,
    },
    {
      id: "Route",
      label: t("nav_route"),
      path: "/route",
      icon: (a) => <IconRoute size={26} active={a} />,
    },
    {
      id: "Profile",
      label: t("nav_profile"),
      path: "/profile",
      icon: (a) => <IconProfile size={26} active={a} />,
    },
  ];

  return (
    <div
      className="absolute bottom-0 left-0 right-0"
      style={{
        backgroundColor: "#FFFBF0",
        borderTop: "2.5px solid #0E1B4D",
        paddingBottom: "20px",
      }}
    >
      <div className="flex justify-around items-center pt-2 px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isCamera = item.id === "Camera";

          const handleClick = () => {
            if (item.action) {
              item.action();
            } else if (item.path) {
              navigate(item.path);
            }
          };

          if (isCamera) {
            return (
              <button
                key={item.id}
                onClick={handleClick}
                className="flex flex-col items-center gap-1"
                style={{ marginTop: "-26px" }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: "58px",
                    height: "58px",
                    backgroundColor: "#2350D8",
                    border: "2.5px solid #0E1B4D",
                    boxShadow: "3px 3px 0px #0E1B4D",
                  }}
                >
                  {item.icon(true)}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#2350D8",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className="flex flex-col items-center gap-1"
              style={{ minWidth: "52px" }}
            >
              <div
                className="flex items-center justify-center rounded-xl transition-all"
                style={{
                  width: "44px",
                  height: "36px",
                  backgroundColor: isActive
                    ? "#2350D8"
                    : "transparent",
                  border: isActive
                    ? "2px solid #0E1B4D"
                    : "2px solid transparent",
                  boxShadow: isActive
                    ? "2px 2px 0px #0E1B4D"
                    : "none",
                }}
              >
                {item.icon(isActive)}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: isActive ? "#2350D8" : "#4B6898",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* home indicator */}
      <div className="flex justify-center mt-2">
        <div
          className="rounded-full"
          style={{
            width: "130px",
            height: "4px",
            backgroundColor: "#0E1B4D",
          }}
        />
      </div>
    </div>
  );
}