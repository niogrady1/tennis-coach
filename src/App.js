import React, { useEffect, useState, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  AnalyticsProvider,
  createClient,
  useAnalytics,
} from '@segment/analytics-react';

import './styles.css';

const analytics = createClient({
  writeKey: 'F3jNWbkBDsRFbrHAiSckIkBLuXwH4Fbn', // replace with your key
});

// Hash function to generate user ID from email
function hashEmail(email) {
  if (!email) return null;
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0; // Convert to 32-bit int
  }
  return 'user_' + Math.abs(hash);
}

// Tracks page views only once per location change
function PageTracker() {
  const analytics = useAnalytics();
  const location = useLocation();
  const lastPathRef = useRef(null);

  useEffect(() => {
    if (lastPathRef.current === location.pathname) return;

    const pageNameMap = {
      '/': 'Home Page',
      '/article-serve': 'Serve Tips Page',
      '/article-footwork': 'Footwork Tips Page',
      '/article-racket': 'Racket Guide Page',
    };

    const pageName = pageNameMap[location.pathname] || 'Unknown Page';

    console.log('Tracking page view:', pageName);
    analytics.page(pageName);

    lastPathRef.current = location.pathname;
  }, [location, analytics]);

  return null;
}

// Home component
function Home({
  userId,
  setUserId,
  newsletterEmail,
  setNewsletterEmail,
  newsletterFirstName,
  setNewsletterFirstName,
  newsletterLastName,
  setNewsletterLastName,
  purchaseEmail,
  setPurchaseEmail,
  purchasePackage,
  setPurchasePackage,
}) {
  const analytics = useAnalytics();
  const navigate = useNavigate();

  const handleArticleClick = (articlePath, articleName) => {
    analytics.track('Article Read', { article: articleName });
    navigate(articlePath);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const newUserId = hashEmail(newsletterEmail);
    setUserId(newUserId);
    analytics.identify(newUserId, {
      email: newsletterEmail,
      firstName: newsletterFirstName,
      lastName: newsletterLastName,
    });
    analytics.track('Newsletter Signup', {
      email: newsletterEmail,
    });
    alert('Thanks for signing up!');
    setNewsletterEmail('');
    setNewsletterFirstName('');
    setNewsletterLastName('');
  };

  const handlePurchase = (e) => {
    e.preventDefault();
    const newUserId = userId || hashEmail(purchaseEmail);
    if (!userId) setUserId(newUserId);
    analytics.identify(newUserId, { email: purchaseEmail });
    analytics.track('Coaching Package Purchased', {
      package: purchasePackage,
      email: purchaseEmail,
    });
    alert(`You purchased the ${purchasePackage} coaching package!`);
    setPurchaseEmail('');
    setPurchasePackage('');
  };

  return (
    <div className="container">
      <h1>Ace Tennis Coach</h1>
      <nav>
        <button className="link-button" onClick={() => handleArticleClick('/', 'Home Page')}>
          Home
        </button>{' '}
        |{' '}
        <button className="link-button" onClick={() => handleArticleClick('/article-serve', 'Serve Tips')}>
          Serve Tips
        </button>{' '}
        |{' '}
        <button className="link-button" onClick={() => handleArticleClick('/article-footwork', 'Footwork Tips')}>
          Footwork
        </button>{' '}
        |{' '}
        <button className="link-button" onClick={() => handleArticleClick('/article-racket', 'Racket Guide')}>
          Choosing a Racket
        </button>
      </nav>

      <section>
        <h2>Improve Your Game</h2>
        <p>Read our expert articles or sign up for a personalized coaching plan.</p>
      </section>

      <section>
        <h3>Sign Up for Our Newsletter</h3>
        <form onSubmit={handleNewsletterSubmit}>
          <input
            type="text"
            placeholder="First name"
            value={newsletterFirstName}
            onChange={(e) => setNewsletterFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last name"
            value={newsletterLastName}
            onChange={(e) => setNewsletterLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      </section>

      <section>
        <h3>Buy a Coaching Package</h3>
        <form onSubmit={handlePurchase}>
          <input
            type="email"
            placeholder="Your email"
            value={purchaseEmail}
            onChange={(e) => setPurchaseEmail(e.target.value)}
            required
          />
          <select
            value={purchasePackage}
            onChange={(e) => setPurchasePackage(e.target.value)}
            required
          >
            <option value="">Select a package</option>
            <option value="Beginner Boost">Beginner Boost</option>
            <option value="Serve Mastery">Serve Mastery</option>
            <option value="Footwork Pro">Footwork Pro</option>
          </select>
          <button type="submit">Purchase</button>
        </form>
      </section>
    </div>
  );
}

const ArticleServe = () => (
  <div className="container">
    <h2>Master Your Serve</h2>
    <p>Tips on developing a powerful and consistent serve...</p>
  </div>
);

const ArticleFootwork = () => (
  <div className="container">
    <h2>Improve Your Footwork</h2>
    <p>Agility and positioning tips for better court movement...</p>
  </div>
);

const ArticleRacket = () => (
  <div className="container">
    <h2>Choosing the Right Racket</h2>
    <p>Guide to selecting the best racket for your playing style...</p>
  </div>
);

function App() {
  const [userId, setUserId] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterFirstName, setNewsletterFirstName] = useState('');
  const [newsletterLastName, setNewsletterLastName] = useState('');
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [purchasePackage, setPurchasePackage] = useState('');

  return (
    <AnalyticsProvider client={analytics}>
      <Router>
        <PageTracker />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                userId={userId}
                setUserId={setUserId}
                newsletterEmail={newsletterEmail}
                setNewsletterEmail={setNewsletterEmail}
                newsletterFirstName={newsletterFirstName}
                setNewsletterFirstName={setNewsletterFirstName}
                newsletterLastName={newsletterLastName}
                setNewsletterLastName={setNewsletterLastName}
                purchaseEmail={purchaseEmail}
                setPurchaseEmail={setPurchaseEmail}
                purchasePackage={purchasePackage}
                setPurchasePackage={setPurchasePackage}
              />
            }
          />
          <Route path="/article-serve" element={<ArticleServe />} />
          <Route path="/article-footwork" element={<ArticleFootwork />} />
          <Route path="/article-racket" element={<ArticleRacket />} />
        </Routes>
      </Router>
    </AnalyticsProvider>
  );
}

export default App;
