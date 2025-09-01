import React from 'react';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="Home-container">
      <h1>Dobro došli na <span className="home-span">QuizHub!</span></h1>
      <p className="home-p">Već danas možeš krenuti u rešavanje kvizova i pokazati svoje znanje iz najraznovrsnijih oblasti.</p>
      <p className="home-p">Takmiči se sa drugima i osvoji prvo mesto na rang listi!</p>
      
    </div>
  );
};

export default Home;