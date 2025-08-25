import React, { useState, useEffect, useRef, useContext } from "react";
//import "../styles/NavBar.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Nav,
  NavLink,
  Bars,
  NavMenu,
  NavBtn,
  NavBtnLink,
  NavLogo,
  UserMenu, UserButton, Avatar, Username, UserDropdown, DropItem, DropButton,
  MobileMenu,
  MobileLink,
  MobileBtnLink,
} from "./NavbarElements";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false); // za MobileMenu (hamburger)
  const location = useLocation();
  const { auth, logout } = useAuth();
  const [userOpen, setUserOpen] = useState(false); // za desktop dropdown
  const userRef = useRef(null);

  // zatvori dropdown kad se promeni ruta
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // zatvori dropdown klikom van njega
  useEffect(() => {
    const onDocClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const username = auth?.Username || auth?.username || auth?.Email || "User";
  const initials = (username?.[0] || "U").toUpperCase();

  return (
    <>
      <Nav>
        <Bars
          onClick={() => setOpen((o) => !o)}
          aria-label="Open menu"
          aria-expanded={open}
          role="button"
        />

        <NavLogo>
          <p>QuizHub!</p>
        </NavLogo>

        <NavMenu>
          <NavLink to="/">Home</NavLink>

          <NavLink to="/about">About</NavLink>

          {/* Second Nav */}
          {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
        </NavMenu>

        {!auth ? (
          <NavBtn>
            <NavBtnLink to="/login">Sign In</NavBtnLink>
          </NavBtn>
        ) : (
          <UserMenu ref={userRef}>
            <UserButton
              onClick={() => setUserOpen((v) => !v)}
              aria-expanded={userOpen}
            >
              <Avatar>{initials}</Avatar>
              <Username>{username}</Username>
            </UserButton>

            <UserDropdown $open={userOpen}>
              <DropItem to="/profile">Profil</DropItem>
              <DropItem to="/quizzes">Moji kvizovi</DropItem>
              <DropItem to="/quizzes/create">Kreiraj kviz</DropItem>
              <DropButton
                onClick={() => {
                  logout();
                }}
              >
                Odjavi se
              </DropButton>
            </UserDropdown>
          </UserMenu>
        )}
      </Nav>

      {typeof MobileMenu !== "undefined" && (
        <MobileMenu $open={open}>
          <MobileLink to="/">Home</MobileLink>
          <MobileLink to="/about">About</MobileLink>

          {!auth ? (
            <>
              <MobileLink to="/login">Sign In</MobileLink>
            </>
          ) : (
            <>
              <MobileLink to="/profile">Profil</MobileLink>
              <MobileLink to="/quizzes">Moji kvizovi</MobileLink>
              <MobileLink to="/quizzes/create">Kreiraj kviz</MobileLink>
              <MobileBtnLink as={Link} to="/" onClick={() => logout()}>
                Odjavi se
              </MobileBtnLink>
            </>
          )}
        </MobileMenu>
      )}
    </>
  );
};

export default Navbar;
