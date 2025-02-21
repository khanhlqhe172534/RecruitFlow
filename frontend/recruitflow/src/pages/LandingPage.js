import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../LandingPage-assets/css/style.css";
import Logo from "../LandingPage-assets/img/logo.png";
import Hero from "../LandingPage-assets/img/hero-img.png";
import AboutUs from "../LandingPage-assets/img/about.jpg";
import "@fontsource/be-vietnam-pro"; 
function LandingPage() {
  return (
    <div>
      {/* Header */}
      <header className="header fixed-top">
        <div className="container-fluid container-xl d-flex align-items-center justify-content-between">
          <a href="/" className="logo d-flex align-items-center">
            <img src={Logo} alt="logo" />
            <span>RecruitFlow</span>
          </a>

          <nav className="navbar">
            <ul>
              <li>
                <a className="getstarted" href="/login">
                  Log In
                </a>
              </li>
            </ul>
            <i className="bi bi-list mobile-nav-toggle"></i>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero d-flex align-items-center">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 d-flex flex-column justify-content-center">
              <h1>We offer modern solutions for growing your business</h1>
              <h2>
                Effortlessly track candidates, manage jobs, send offers, and
                schedule interviews. DevIn simplifies hiring for you.
              </h2>
            </div>
            <div className="col-lg-6 hero-img" data-aos="zoom-out">
              <img src={Hero} className="img-fluid" alt="Hero" />
            </div>
          </div>
        </div>
      </section>

      <main id="main">
        {/* About Section */}
        <section id="about" className="about">
          <div className="container">
            <div className="row gx-0">
              <div className="col-lg-6 d-flex flex-column justify-content-center">
                <div className="content">
                  <h3>Who We Are</h3>
                  <h2>
                    A passionate about simplifying hiring, we're excited to help
                    you discover the perfect talent for your team.
                  </h2>
                  <p>
                    With extensive experience in recruitment and technology, we
                    understand the challenges faced by both hiring managers and
                    candidates, and we're dedicated to creating a smoother, more
                    efficient hiring experience for everyone. DevIn is more than
                    just an interviewer management system; it's a platform
                    designed to empower businesses to build a strong talent
                    pipeline and make confident hiring decisions.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 d-flex align-items-center">
                <img src={AboutUs} className="img-fluid" alt="About us" />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="services">
          <div className="container" data-aos="fade-up">
            <header className="section-header">
              <h2>Services</h2>
            </header>

            <div className="row gy-4">
              <div
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div className="service-box blue">
                  <i className="ri-discuss-line icon"></i>
                  <h3>Candidate Management</h3>
                  <p>
                    DevIn simplifies candidate management by providing a
                    one-stop shop to track applicants, filter resumes, schedule
                    interviews, and collaborate on hiring decisions. This
                    streamlines the process, saving you time and ensuring a
                    smooth experience for your potential hires.
                  </p>
                </div>
              </div>

              <div
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="service-box orange">
                  <i className="ri-discuss-line icon"></i>
                  <h3>Job Management</h3>
                  <p>
                    DevIn makes job management a breeze. Easily create and post
                    new job openings, manage applications from a central hub,
                    and identify the best candidates for each role. This ensures
                    you attract top talent while keeping your hiring process
                    organized and efficient.
                  </p>
                </div>
              </div>

              <div
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <div className="service-box green">
                  <i className="ri-discuss-line icon"></i>
                  <h3>Interview Schedule Management</h3>
                  <p>
                    DevIn takes the hassle out of interview scheduling. Schedule
                    individual or group interviews with just a few clicks,
                    considering interviewer availability and candidate
                    preferences. Say goodbye to endless email chains and
                    juggling calendars – DevIn streamlines the process for a
                    smoother interview experience for everyone.
                  </p>
                </div>
              </div>

              <div
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                <div className="service-box red">
                  <i className="ri-discuss-line icon"></i>
                  <h3>Offer Management</h3>
                  <p>
                    DevIn streamlines offer management with customizable
                    templates and automated notifications. Send personalized job
                    offers to top candidates quickly and easily. Track the
                    status of each offer in real-time, allowing you to make
                    informed decisions and close deals faster.
                  </p>
                </div>
              </div>

              <div
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <div className="service-box purple">
                  <i className="ri-discuss-line icon"></i>
                  <h3>User Management</h3>
                  <p>
                    DevIn empowers you with centralized user management. Easily
                    add, edit, and manage user permissions for interviewers,
                    hiring managers, and recruiters within your organization.
                    This ensures everyone has the access they need to contribute
                    to the hiring process while maintaining data security.
                  </p>
                </div>
              </div>

              <div
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay="700"
              >
                <div className="service-box pink">
                  <i className="ri-discuss-line icon"></i>
                  <h3>Auto Scheduling</h3>
                  <p>
                    DevIn offers smart auto-scheduling to save you even more
                    time. Leveraging AI and your defined preferences, DevIn can
                    automatically suggest interview times that work for both
                    interviewers and candidates. This eliminates scheduling
                    conflicts, keeps the hiring process moving, and allows you
                    to focus on what matters most: evaluating top talent
                  </p>
                </div>
              </div>

              {/* Add more services as needed */}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact">
          <div className="container">
            <header className="section-header">
              <h2>Contact</h2>
              <p>Contact Us</p>
            </header>
            <div className="row gy-4">
              <div className="col-lg-6">
                <div className="row gy-4">
                  {renderContactInfo(
                    "geo-alt",
                    "Address",
                    "A108 Adam Street,",
                    "New York, NY 535022"
                  )}
                  {renderContactInfo(
                    "telephone",
                    "Call Us",
                    "+1 5589 55488 55",
                    "+1 6678 254445 41"
                  )}
                  {renderContactInfo(
                    "envelope",
                    "Email Us",
                    "info@example.com",
                    "contact@example.com"
                  )}
                  {renderContactInfo(
                    "clock",
                    "Open Hours",
                    "Monday - Friday",
                    "9:00AM - 05:00PM"
                  )}
                </div>
              </div>
              <div className="col-lg-6">
                <form className="php-email-form">
                  <div className="row gy-4">
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Your Name"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Your Email"
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <input
                        type="text"
                        className="form-control"
                        name="subject"
                        placeholder="Subject"
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <textarea
                        className="form-control"
                        name="message"
                        rows="6"
                        placeholder="Message"
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-12 text-center">
                      <button type="submit">Send Message</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="container">
            <div className="row gy-4">
              <div className="col-lg-5 col-md-12 footer-info">
                <a href="/" className="logo d-flex align-items-center">
                  <img src={Logo} alt="logo" />
                  <span>RecruitFlow</span>
                </a>
                <p>
                  Cras fermentum odio eu feugiat lide par naso tierra. Justo
                  eget nada terra videa magna derita valies darta donna mare
                  fermentum iaculis eu non diam phasellus.
                </p>
                <div className="social-links mt-3">
                  <a href="#" className="twitter">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="#" className="facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="#" className="linkedin">
                    <i className="bi bi-linkedin"></i>
                  </a>
                </div>
              </div>
              <div className="col-lg-2 col-6 footer-links">
                <h4>Useful Links</h4>
                <ul>
                  <li>
                    <i className="bi bi-chevron-right"></i> <a href="#">Home</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">About us</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Services</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Terms of service</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Privacy policy</a>
                  </li>
                </ul>
              </div>

              <div className="col-lg-2 col-6 footer-links">
                <h4>Our Services</h4>
                <ul>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Web Design</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Web Development</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Product Management</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Marketing</a>
                  </li>
                  <li>
                    <i className="bi bi-chevron-right"></i>{" "}
                    <a href="#">Graphic Design</a>
                  </li>
                </ul>
              </div>

              <div className="col-lg-3 col-md-12 footer-contact text-center text-md-start">
                <h4>Contact Us</h4>
                <p>
                  A108 Adam Street <br />
                  New York, NY 535022
                  <br />
                  United States <br />
                  <br />
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <a
        href="#"
        className="back-to-top d-flex align-items-center justify-content-center"
      >
        <i className="bi bi-arrow-up-short"></i>
      </a>
    </div>
  );
}

function renderContactInfo(icon, title, text, text2) {
  return (
    <div className="col-md-6">
      <div className="info-box">
        <i className={`bi bi-${icon}`}></i>
        <h3>{title}</h3>
        <p>{text}</p>
        <p>{text2}</p>
      </div>
    </div>
  );
}

export default LandingPage;
