import { createBrowserRouter } from "react-router";
import { RootLayout, ErrorPage } from "./components/RootLayout";
import { SplashScreen } from "./components/SplashScreen";
import HomeScreen from "./components/HomeScreen";
import { PicturesAndMapScreen } from "./components/PicturesAndMapScreen";
import { RouteScreen } from "./components/RouteScreen";
import { MysteryRouteScreen } from "./components/MysteryRouteScreen";
import { CustomRouteScreen } from "./components/CustomRouteScreen";
import { ProfileScreen } from "./components/ProfileScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      { index: true,           Component: SplashScreen },
      { path: "home",          Component: HomeScreen },
      { path: "pictures",      Component: PicturesAndMapScreen },
      { path: "route",         Component: RouteScreen },
      { path: "mystery-route", Component: MysteryRouteScreen },
      { path: "custom-route",  Component: CustomRouteScreen },
      { path: "profile",       Component: ProfileScreen },
      { path: "*",             Component: SplashScreen },
    ],
  },
]);
