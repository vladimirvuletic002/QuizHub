import React from 'react';
import '../styles/Home.css';

const About = () => {
    return (
        <div className="about-container">
            <h1>
                O Nama
            </h1>

            <p className="home-p"><span className="about-span">QuizHub!</span> je platforma za rešavanje kvizova koja obuhvata širok spektar tema i interesovanja.</p>
            <p className="home-p">Omogućen vam je prikaz rezultata nakon završavanja kviza kao i pregled tačnih odgovora.</p>
            <p className="home-p">Takođe za one sa takmičarskim duhom, kao motivacija, postoji globalna rang lista svih korisnika koji su rešavali određeni kviz.</p>
        </div>
    );
};

export default About;