import { FaBars } from "react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
    background: #6963d4ff;
    height: 70px;
    display: flex;
    position: sticky;
    top: 0;
    justify-content: space-between;
    /*padding: 0.2rem calc((100vw - 1000px) / 2); */
    padding: 0 16px;
    z-index: 12;
    /* Third Nav */
    /* justify-content: flex-start; */
`;

export const NavLogo = styled.div`
    display: flex;
    align-items: center;
    text-align: left;
    padding-right: 10px;
    font-family: "Kabouter DEMO";
    font-size: 30px;
    font-weight: bold;
    color: white;
    justify-content: center;
    /* Third Nav */
    /* justify-content: flex-end;
  width: 100vw; */
    
`;

export const NavLink = styled(Link)`
    color: white;
    min-width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: left;
    text-decoration: none;
    
    padding: 0 1rem;
    height: 100%;
    cursor: pointer;
    &.active {
        color: #000000;
        background: #8882ffff;
    }
    &:hover {
        transition: all 0.2s ease-in-out;
        background: #8882ffff;
        color: #000000;
    }
`;

export const Bars = styled(FaBars)`
    display: none;
    color: #808080;
    @media screen and (max-width: 450px) {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(-100%, 75%);
        font-size: 1.8rem;
        cursor: pointer;
    }
`;

export const NavMenu = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    
    /* Second Nav */
    /* margin-right: 24px; */
    /* Third Nav */
    /* width: 100vw;
  white-space: nowrap; */
    @media screen and (max-width: 450px) {
        display: none;
    }
`;

export const NavBtn = styled.nav`
    display: flex;
    align-items: center;
    margin-left: auto;
    /* Third Nav */
    /* justify-content: flex-end;
  width: 100vw; */
    @media screen and (max-width: 450px) {
        display: none;
    }
`;

export const NavBtnLink = styled(Link)`
    border-radius: 4px;
    background: #124eb6ff;
    padding: 10px 22px;
    color: white;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    /* Second Nav */
    margin-left: 24px;
    &:hover {
        transition: all 0.2s ease-in-out;
        background: #fff;
        color: #808080;
    }
`;

export const MobileMenu = styled.div`
  position: fixed;
  top: 70px;         /* ispod navbara */
  left: 0;
  right: 0;
  background: #6963d4ff;
  border-top: 1px solid rgba(255,255,255,0.15);
  z-index: 11;

  /* SCROLL */
  /* opcija A: max-visina + overflow */
  max-height: calc(100dvh - 70px);         /* moderni viewport unit */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;        /* iOS glatko skrolovanje */
  overscroll-behavior: contain;             /* ne propagira scroll pozadini */
  scrollbar-gutter: stable;                 /* spreči skakutanje pri pojavi scrolla */
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);

  /* (fallback ako 100dvh nije podržan) */
  @supports not (height: 100dvh) {
    max-height: calc(100vh - 70px);
  }

  /* animacija prikaza */
  transform: ${({ $open }) => ($open ? 'translateY(0)' : 'translateY(-8px)')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transition: transform .2s ease, opacity .2s ease, visibility .2s ease;

  padding: 8px 16px;
  display: none;

  @media screen and (max-width: 450px) {
    display: block;
  }
`;

export const MobileLink = styled(Link)`
  display: block;
  width: 100%;
  padding: 12px 8px;
  text-decoration: none;
  color: white;
  border-radius: 6px;

  &.active {
    color: #000000;
    background: #8882ffff;
  }

  &:hover {
    background: #8882ffff;
    color: #000000;
  }
`;

export const MobileBtnLink = styled(Link)`
  display: block;
  width: 100%;
  text-align: center;
  margin-top: 8px;
  border-radius: 6px;
  background: #124eb6ff;
  padding: 12px;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #fff;
    color: #808080;
  }
`;