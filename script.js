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
        <a href="/" data-link class="brand">
          <img src="assets/skyway-logo.svg" alt="Skyway Parking" />
          <div>
            <p class="brand-title">Skyway Parking</p>
            <p class="brand-subtitle">DTW Airport Reservations</p>
          </div>
        </a>
        <nav class="site-nav">
          ${navItems.map((item) => `<a href="#" class="plain-nav">${item}</a>`).join('')}
        </nav>
      </div>
    </header>
  `;
}

function homePage() {
  return `
    <section class="container home-grid">
      <article class="hero-card">
        <p class="eyebrow">DETROIT METRO AIRPORT / DTW</p>
        <h1>Reliable airport parking with fast shuttle service every day.</h1>
        <p>Reserve your spot at Skyway Parking in minutes. Our lot is staffed around the clock and just minutes from DTW terminals.</p>
        <div class="hero-actions">
          <a href="/reserve" data-link class="btn btn-primary">Reserve Parking</a>
          <a href="tel:+13132542699" class="btn btn-outline">Call Now</a>
        </div>
        <div class="trust-grid">
          <div><strong>24/7 Shuttle</strong><span>Always running</span></div>
          <div><strong>Secure Lot</strong><span>Monitored property</span></div>
          <div><strong>Close to DTW</strong><span>Easy terminal access</span></div>
          <div><strong>Staffed Parking</strong><span>Friendly attendants</span></div>
        </div>
      </article>
      <aside class="search-preview">
        <h2>Reservation Preview</h2>
        <p>Airport is fixed to DTW for all reservations.</p>
        <ul>
          <li>Airport: Detroit Metro Airport (DTW)</li>
          <li>Address: 8501 Inkster Rd, Taylor, MI 48180</li>
          <li>Phone: (313) 254-2699</li>
        </ul>
        <a href="/reserve" data-link class="btn btn-primary full-width">Start Reservation</a>
      </aside>
    </section>
  `;
}

function reservePage() {
  return `
    <section class="container reserve-section">
      <h1>Reserve Your DTW Airport Parking</h1>
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
        <div class="airport-note">Airport: Detroit Metro Airport (DTW)</div>
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
      <div class="line-item total-line"><span>Remaining Due at Parking Lot</span><strong>$0.00</strong></div>
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
          <section>
            <h2>Reservation Details</h2>
            <p>Reservation ID: ${reservation.reservationId}</p>
            <p>Reservation Made By: ${reservation.fullName}</p>
            <p>Reservation Status: Open</p>
            <p>We have sent you a copy of this transaction to the email provided on checkout.</p>
          </section>
          <section>
            <h2>Parking Lot Details</h2>
            <div class="lot-block">
              <img src="assets/skyway-logo.svg" alt="Skyway Parking" />
              <div>
                <p>Skyway Parking</p>
                <p>8501 Inkster Rd., Taylor, MI, US, 48180</p>
                <a href="https://maps.google.com/?q=8501+Inkster+Rd+Taylor+MI+48180" target="_blank" rel="noreferrer">Get Directions</a>
                <p>313-254-2699</p>
              </div>
            </div>
          </section>
          <section>
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
