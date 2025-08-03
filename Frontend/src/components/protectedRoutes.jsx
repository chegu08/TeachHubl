import { Outlet, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export function StudentPrivateRoutes() {

    const jwt = localStorage.getItem("jwt");

    if (!jwt) return <Navigate to="/signUp" />;
    
    try{

        const decoded=jwtDecode(jwt);

        console.log("Student private route");
        console.log(decoded);
        if(decoded.role.toLowerCase()!="student") return <Navigate to="/unauthorized" />

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
        console.log("Tutor private route ");
        console.log(decoded);
        if(decoded.role.toLowerCase()!="tutor") return <Navigate to="/unauthorized" />

        return <Outlet />

    } catch(err) {
        console.log(err);
        return <Navigate to={err.name=="TokenExpiredError"?"/signIn":"/signUp"} />
    }
};