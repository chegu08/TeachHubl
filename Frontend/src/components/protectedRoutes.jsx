import { Outlet, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function StudentPrivateRoutes() {

    const jwt = localStorage.getItem("jwt");

    if (!jwt) return <Navigate to="/signUp" />;
    
    try{

        const decoded=jwtDecode(jwt);

        if(decoded.role!="Student") return <Navigate to="/unauthorized" />

        return <Outlet />

    } catch(err) {
        console.log(err);
        return <Navigate to={err.name=="TokenExpiredError"?"/signIn":"/signUp"} />
    }

};

export function TutorPrivateRoutes() {
    const jwt = localStorage.getItem("jwt");

    if (!jwt) return <Navigate to="/signUp" />;
    
    try{

        const decoded=jwtDecode(jwt);

        if(decoded.role!="Tutor") return <Navigate to="/unauthorized" />

        return <Outlet />

    } catch(err) {
        console.log(err);
        return <Navigate to={err.name=="TokenExpiredError"?"/signIn":"/signUp"} />
    }
};