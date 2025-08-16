import React, { useState, useEffect, useRef, useContext } from "react";
//import "../styles/NavBar.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Nav,
    NavLink,
    Bars,
    NavMenu,
    NavBtn,
    NavBtnLink,
    NavLogo,
    MobileMenu,
    MobileLink,
    MobileBtnLink
} from "./NavbarElements";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    // zatvori dropdown kad se promeni ruta
    useEffect(() => {
    setOpen(false);
    }, [location.pathname]);
    
    return (
        <>
            <Nav>
                <Bars 
                    onClick={() => setOpen(o => !o)}
                    aria-label="Open menu"
                    aria-expanded={open}
                    role="button"
                />


                    <NavLogo>
                        <p>QuizHub!</p>
                    </NavLogo>
              

                <NavMenu>
                    
                    <NavLink to="/" >
                        Home
                    </NavLink>
                    
                    <NavLink to="/about" >
                        About
                    </NavLink>

                    {/* Second Nav */}
                    {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
                </NavMenu>
                <NavBtn>
                    <NavBtnLink to="/register">
                        Sign Up
                    </NavBtnLink>
                </NavBtn>
            </Nav>

            <MobileMenu $open={open}>
                <MobileLink to="/">Home</MobileLink>
                <MobileLink to="/about">About</MobileLink>
                <MobileBtnLink to="/register">Sign Up</MobileBtnLink>
            </MobileMenu>

        </>
    );
};

export default Navbar;