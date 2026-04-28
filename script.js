const APP = document.getElementById('app');
const STORAGE_KEY = 'skywayReservation';
const DAILY_RATE = 12;
const BOOKING_FEE = 5;

const navItems = ['Airport Parking', 'Parking Packages', 'My Account', 'Help', 'Blog'];

const formatCurrency = (value) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const parseDateTime = (date, time) => new Date(`${date}T${time}`);

const calculateDays = (checkInDate, checkInTime, checkOutDate, checkOutTime) => {
  const start = parseDateTime(checkInDate, checkInTime);
  const end = parseDateTime(checkOutDate, checkOutTime);
  const diff = Math.max(end.getTime() - start.getTime(), 0);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const formatDateTime = (date, time) => {
  if (!date || !time) return '—';
  return parseDateTime(date, time).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function getReservation() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
}

function setReservation(reservation) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservation));
}

function navigate(path) {
  history.pushState({}, '', path);
  render();
}

function header() {
  return `
    <header class="site-header">
      <div class="container nav-row">
        <a href="/" data-link class="brand" aria-label="Skyway Parking home">
          <span class="logo-mark" aria-hidden="true">✈</span>
          <span>
            <span class="brand-title">Skyway Parking</span>
            <span class="brand-subtitle">DTW Airport Reservations</span>
          </span>
        </a>
        <nav class="site-nav" aria-label="Main navigation">
          ${navItems.map((item) => `<a href="#" class="plain-nav">${item}</a>`).join('')}
        </nav>
      </div>
    </header>
  `;
}

function homePage() {
  return `
    <section class="container home-grid">
      <article class="hero-panel">
        <p class="eyebrow">DETROIT METRO AIRPORT PARKING</p>
        <h1>Book secure, professional airport parking near DTW.</h1>
        <p class="intro-copy">Skyway Parking offers fast shuttles, staffed service, and a simple booking flow trusted by Detroit Metro travelers.</p>
        <div class="hero-actions">
          <a href="/reserve" data-link class="btn btn-primary">Reserve Parking</a>
          <a href="tel:+13132542699" class="btn btn-link">Call Now (313) 254-2699</a>
        </div>
        <ul class="trust-points">
          <li>24/7 shuttle to all DTW terminals</li>
          <li>Secure, well-lit and staffed lot</li>
          <li>Convenient location: 8501 Inkster Rd, Taylor, MI</li>
          <li>Fast check-in with digital or printed receipt</li>
        </ul>
      </article>

      <aside class="booking-panel">
        <h2>Start Your Reservation</h2>
        <p>Airport: Detroit Metro Airport (DTW)</p>
        <div class="booking-lines">
          <div><span>Location</span><strong>Skyway Parking</strong></div>
          <div><span>Address</span><strong>8501 Inkster Rd, Taylor, MI 48180</strong></div>
          <div><span>Phone</span><strong>(313) 254-2699</strong></div>
          <div><span>Service</span><strong>Self Uncovered • 24/7 Shuttle</strong></div>
        </div>
        <a href="/reserve" data-link class="btn btn-primary full-width">Start Reservation</a>
      </aside>
    </section>
  `;
}

function reservePage() {
  return `
    <section class="container reserve-section">
      <div class="page-head">
        <p class="eyebrow">RESERVATION FORM</p>
        <h1>Reserve Your Parking at DTW</h1>
      </div>
      <form id="reserveForm" class="reserve-form">
        <label>Full Name<input name="fullName" required /></label>
        <label>Email<input type="email" name="email" required /></label>
        <label>Phone Number<input name="phone" required /></label>
        <label>Vehicle Make/Model<input name="vehicle" required /></label>
        <label>License Plate<input name="plate" required /></label>
        <label>Check-in Date<input type="date" name="checkInDate" required /></label>
        <label>Check-in Time<input type="time" name="checkInTime" required /></label>
        <label>Check-out Date<input type="date" name="checkOutDate" required /></label>
        <label>Check-out Time<input type="time" name="checkOutTime" required /></label>
        <label>Parking Type
          <select name="parkingType">
            <option>Self Uncovered</option>
            <option>Self Covered</option>
            <option>Valet</option>
          </select>
        </label>
        <div class="airport-note">Airport served: Detroit Metro Airport (DTW)</div>
        <button class="btn btn-primary" type="submit">Continue to Confirmation</button>
      </form>
    </section>
  `;
}

function paymentCard(days, parkingPrice, total) {
  return `
    <aside class="payment-card">
      <h3>Payment Breakdown</h3>
      <div class="line-item"><span>Parking Price (${days} ${days === 1 ? 'Day' : 'Days'} of parking)</span><strong>${formatCurrency(parkingPrice)}</strong></div>
      <div class="line-item"><span>Booking Fee</span><strong>${formatCurrency(BOOKING_FEE)}</strong></div>
      <div class="line-item total-line"><span>Total</span><strong>${formatCurrency(total)}</strong></div>
      <div class="line-item"><span>You Paid</span><strong>${formatCurrency(total)}</strong></div>
      <p class="charged-note">You were charged ${formatCurrency(total)} USD for this transaction.</p>
      <div class="line-item total-line no-border"><span>Remaining Due at Parking Lot</span><strong>$0.00</strong></div>
    </aside>
  `;
}

function confirmationPage() {
  const reservation = getReservation();
  if (!reservation) {
    return `
      <section class="container empty-state">
        <h1>No reservation found.</h1>
        <p>Please complete the reservation form first.</p>
        <a href="/reserve" data-link class="btn btn-primary">Go to Reservation Form</a>
      </section>
    `;
  }

  const days = calculateDays(
    reservation.checkInDate,
    reservation.checkInTime,
    reservation.checkOutDate,
    reservation.checkOutTime
  );

  const parkingPrice = days * DAILY_RATE;
  const total = parkingPrice + BOOKING_FEE;

  return `
    <section class="container confirmation-wrap">
      <div class="confirmation-top">
        <p class="thank-you">Thank you ${reservation.fullName}! Your airport parking has been booked and confirmed!</p>
        <button id="printBtn" class="btn btn-outline">Print Receipt</button>
      </div>
      <h1 class="overview-title">RESERVATION OVERVIEW</h1>
      <div class="confirmation-grid">
        <article class="receipt-column">
          <section class="plain-section">
            <h2>Reservation Details</h2>
            <p>Reservation ID: ${reservation.reservationId}</p>
            <p>Reservation Made By: ${reservation.fullName}</p>
            <p>Reservation Status: Open</p>
            <p>We have sent you a copy of this transaction to the email provided on checkout.</p>
          </section>
          <section class="plain-section">
            <h2>Parking Lot Details</h2>
            <p><strong>Skyway Parking</strong></p>
            <p>8501 Inkster Rd., Taylor, MI, US, 48180</p>
            <p><a href="https://maps.google.com/?q=8501+Inkster+Rd+Taylor+MI+48180" target="_blank" rel="noreferrer">Get Directions</a></p>
            <p>313-254-2699</p>
          </section>
          <section class="plain-section">
            <h2>Your Parking Details</h2>
            <p>Person Parking: ${reservation.fullName}</p>
            <p>Check-in: ${formatDateTime(reservation.checkInDate, reservation.checkInTime)}</p>
            <p>Check-out: ${formatDateTime(reservation.checkOutDate, reservation.checkOutTime)}</p>
            <p>Parking Duration: ${days} ${days === 1 ? 'Day' : 'Days'} of parking</p>
            <p>Parking Type: ${reservation.parkingType || 'Self Uncovered'}</p>
          </section>
          <div class="notice-box">You must show a printed or digital copy of your receipt at the parking lot.</div>
        </article>
        ${paymentCard(days, parkingPrice, total)}
      </div>
    </section>
  `;
}

function attachHandlers() {
  document.querySelectorAll('[data-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigate(link.getAttribute('href'));
    });
  });

  document.getElementById('reserveForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const reservation = Object.fromEntries(data.entries());
    reservation.airport = 'DTW';
    reservation.reservationId = `SKY-${Math.floor(100000 + Math.random() * 900000)}`;
    reservation.createdAt = new Date().toISOString();
    setReservation(reservation);
    navigate('/confirmation');
  });

  document.getElementById('printBtn')?.addEventListener('click', () => window.print());

  document.querySelectorAll('.plain-nav').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
}

function render() {
  const path = window.location.pathname;
  let page = homePage();

  if (path === '/reserve') page = reservePage();
  if (path === '/confirmation') page = confirmationPage();

  APP.innerHTML = `${header()}<main class="page-shell">${page}</main>`;
  attachHandlers();
}

window.addEventListener('popstate', render);
render();
