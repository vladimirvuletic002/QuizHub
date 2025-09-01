import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
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
import { GetProfileImage } from "../../services/UserService";

const Navbar = () => {
  const [open, setOpen] = useState(false); // za MobileMenu (hamburger)
  const location = useLocation();
  const { auth, logout } = useAuth();
  const [userOpen, setUserOpen] = useState(false); // za desktop dropdown
  const [profileImageUrl, setProfileImageUrl] = useState(null);
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

  // ucitaj profilnu sliku sa servera
   useEffect(() => {
    let urlToRevoke = null;

    const fetchImage = async () => {
      //if (!auth?.UserId || !auth?.userId) { setProfileImageUrl(null); return; }
      try {
        const url = await GetProfileImage(auth.userId);
        urlToRevoke = url;
        setProfileImageUrl(url);
        
      } catch (err) {
        //console.error("Greška pri učitavanju profilne slike:", err);
        setProfileImageUrl(null);
      }
    };

    fetchImage();

    return () => {
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [auth?.userId]);

  const isAdmin = useMemo(() => {
    const role = (auth?.Role || auth?.role || "").toString().toLowerCase();
    return role === "administrator"; // 0 = Admin, 1 = User
  }, [auth]);


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
          <NavLink to="/">Početna</NavLink>

          <NavLink to="/about">O Nama</NavLink>

          {/* Second Nav */}
          {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
        </NavMenu>

        {!auth ? (
          <NavBtn>
            <NavBtnLink to="/login">Prijava</NavBtnLink>
          </NavBtn>
        ) : (
          <UserMenu ref={userRef}>
            <UserButton
              onClick={() => setUserOpen((v) => !v)}
              aria-expanded={userOpen}
            >
              <Avatar>
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="profile" />
                ) : (
                  initials
                )}
              </Avatar>
              <Username>{username}</Username>
            </UserButton>



            <UserDropdown $open={userOpen}>
              

              {!isAdmin ? (
                  <><DropItem to="/QuizManager">Moji Kvizovi</DropItem><DropItem to="/user-attempt-history">Moji Rezultati</DropItem></>
              ) : (

                  <><DropItem to="/QuizManager">Kvizovi</DropItem><DropItem to="/attempt-history">Evidencija</DropItem></>
              )}

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
          <MobileLink to="/">Početna</MobileLink>
          <MobileLink to="/about">O nama</MobileLink>

          {!auth ? (
            <>
              <MobileLink to="/login">Prijava</MobileLink>
            </>
          ) : (
            <>

              {!isAdmin ? (
                  <><MobileLink to="/QuizManager">Moji Kvizovi</MobileLink><MobileLink to="/user-attempt-history">Moji Rezultati</MobileLink></>
              ) : (

                  <><MobileLink to="/QuizManager">Kvizovi</MobileLink><MobileLink to="/attempt-history">Evidencija</MobileLink></>
              )}
              


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
