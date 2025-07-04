import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Home.module.css";

const Home = () => {
  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>🌐 AnyOneTalk</h1>
        <p className={styles.subtitle}>
          Enter the neon grid of real-time communication.
        </p>
        <div className={styles.buttons}>
          <Link to="/login" className={styles.button}>
            Login
          </Link>
          <Link to="/register" className={styles.button}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
