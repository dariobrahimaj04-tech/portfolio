 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/script.js b/script.js
new file mode 100644
index 0000000000000000000000000000000000000000..5670a34b9dcb59493b19f91fbe42510e96f3434c
--- /dev/null
+++ b/script.js
@@ -0,0 +1,265 @@
+const reservationKey = "skywayReservation";
+const form = document.getElementById("reservation-form");
+const summaryList = document.getElementById("summary-list");
+const summaryStatus = document.getElementById("summary-status");
+const confirmation = document.getElementById("confirmation");
+const toast = document.getElementById("toast");
+const formMessage = document.getElementById("form-message");
+const modal = document.getElementById("reservation-modal");
+const modalBody = document.getElementById("modal-body");
+const receipt = document.getElementById("receipt");
+
+const formatDateTime = (date, time) => {
+  if (!date || !time) return "";
+  const [year, month, day] = date.split("-");
+  return `${month}/${day}/${year} ${time}`;
+};
+
+const showToast = (message) => {
+  toast.textContent = message;
+  toast.classList.add("show");
+  setTimeout(() => toast.classList.remove("show"), 3200);
+};
+
+const setSummary = (data) => {
+  summaryList.innerHTML = "";
+  if (!data) {
+    summaryStatus.textContent =
+      "Complete the form to populate your reservation details.";
+    return;
+  }
+
+  summaryStatus.textContent = "Reservation ready for check-in.";
+  const items = [
+    { label: "Name", value: data.fullName },
+    { label: "Phone", value: data.phone },
+    { label: "Vehicle", value: data.vehicle },
+    { label: "Plate", value: data.plate },
+    { label: "Check-in", value: data.checkIn },
+    { label: "Check-out", value: data.checkOut },
+  ];
+
+  items.forEach((item) => {
+    const li = document.createElement("li");
+    li.innerHTML = `${item.label}<span>${item.value}</span>`;
+    summaryList.appendChild(li);
+  });
+};
+
+const getStoredReservation = () => {
+  const stored = localStorage.getItem(reservationKey);
+  if (!stored) return null;
+  try {
+    return JSON.parse(stored);
+  } catch (error) {
+    return null;
+  }
+};
+
+const updateModal = (data) => {
+  if (!data) {
+    modalBody.innerHTML =
+      "<p>No reservation saved yet. Submit the form to save one.</p>";
+    return;
+  }
+
+  modalBody.innerHTML = `
+    <p><strong>Name:</strong> ${data.fullName}</p>
+    <p><strong>Phone:</strong> ${data.phone}</p>
+    <p><strong>Vehicle:</strong> ${data.vehicle}</p>
+    <p><strong>Plate:</strong> ${data.plate}</p>
+    <p><strong>Check-in:</strong> ${data.checkIn}</p>
+    <p><strong>Check-out:</strong> ${data.checkOut}</p>
+  `;
+};
+
+const openModal = () => {
+  const data = getStoredReservation();
+  updateModal(data);
+  modal.classList.add("is-open");
+  modal.setAttribute("aria-hidden", "false");
+  const closeButton = modal.querySelector("[data-close]");
+  closeButton?.focus();
+};
+
+const closeModal = () => {
+  modal.classList.remove("is-open");
+  modal.setAttribute("aria-hidden", "true");
+};
+
+const initNavHighlight = () => {
+  const navLinks = document.querySelectorAll(".nav-link");
+  const sections = Array.from(navLinks).map((link) =>
+    document.querySelector(link.getAttribute("href"))
+  );
+
+  const observer = new IntersectionObserver(
+    (entries) => {
+      entries.forEach((entry) => {
+        if (entry.isIntersecting) {
+          navLinks.forEach((link) => link.classList.remove("active"));
+          const activeLink = document.querySelector(
+            `.nav-link[href="#${entry.target.id}"]`
+          );
+          activeLink?.classList.add("active");
+        }
+      });
+    },
+    { rootMargin: "-40% 0px -50%" }
+  );
+
+  sections.forEach((section) => section && observer.observe(section));
+};
+
+const initReveal = () => {
+  const revealItems = document.querySelectorAll(".reveal");
+  const observer = new IntersectionObserver(
+    (entries) => {
+      entries.forEach((entry) => {
+        if (entry.isIntersecting) {
+          entry.target.classList.add("is-visible");
+          observer.unobserve(entry.target);
+        }
+      });
+    },
+    { threshold: 0.2 }
+  );
+
+  revealItems.forEach((item) => observer.observe(item));
+};
+
+const initAccordion = () => {
+  const triggers = document.querySelectorAll(".accordion-trigger");
+  triggers.forEach((trigger) => {
+    trigger.addEventListener("click", () => {
+      const item = trigger.closest(".accordion-item");
+      const expanded = trigger.getAttribute("aria-expanded") === "true";
+      triggers.forEach((btn) => {
+        btn.setAttribute("aria-expanded", "false");
+        btn.closest(".accordion-item").classList.remove("is-open");
+      });
+      if (!expanded) {
+        trigger.setAttribute("aria-expanded", "true");
+        item.classList.add("is-open");
+      }
+    });
+  });
+};
+
+const handleSubmit = (event) => {
+  event.preventDefault();
+  formMessage.textContent = "";
+
+  const formData = new FormData(form);
+  const fullName = formData.get("fullName").trim();
+  const phone = formData.get("phone").trim();
+  const vehicle = formData.get("vehicle").trim();
+  const plate = formData.get("plate").trim();
+  const checkInDate = formData.get("checkIn");
+  const checkInTime = formData.get("checkInTime");
+  const checkOutDate = formData.get("checkOut");
+  const checkOutTime = formData.get("checkOutTime");
+  const signature = formData.get("signature").trim();
+  const terms = formData.get("terms");
+
+  if (
+    !fullName ||
+    !phone ||
+    !vehicle ||
+    !plate ||
+    !checkInDate ||
+    !checkInTime ||
+    !checkOutDate ||
+    !checkOutTime ||
+    !signature ||
+    !terms
+  ) {
+    formMessage.textContent = "Please fill in all required fields.";
+    return;
+  }
+
+  const checkIn = new Date(`${checkInDate}T${checkInTime}`);
+  const checkOut = new Date(`${checkOutDate}T${checkOutTime}`);
+  if (checkOut <= checkIn) {
+    formMessage.textContent = "Check-out must be after check-in.";
+    return;
+  }
+
+  const reservation = {
+    fullName,
+    phone,
+    vehicle,
+    plate,
+    checkIn: formatDateTime(checkInDate, checkInTime),
+    checkOut: formatDateTime(checkOutDate, checkOutTime),
+    signature,
+  };
+
+  localStorage.setItem(reservationKey, JSON.stringify(reservation));
+  setSummary(reservation);
+  confirmation.hidden = false;
+  showToast("Reservation confirmed and saved.");
+  form.reset();
+};
+
+const handlePrint = () => {
+  const data = getStoredReservation();
+  const receiptData = data || {
+    fullName: "Sample Guest",
+    phone: "(800) 555-2044",
+    vehicle: "SUV",
+    plate: "DTW-2024",
+    checkIn: "06/01/2024 08:30",
+    checkOut: "06/05/2024 19:15",
+  };
+
+  receipt.innerHTML = `
+    <h1>Skyway Parking Receipt</h1>
+    <p><strong>Reservation ID:</strong> SKY-${Date.now().toString().slice(-6)}</p>
+    <hr />
+    <p><strong>Name:</strong> ${receiptData.fullName}</p>
+    <p><strong>Phone:</strong> ${receiptData.phone}</p>
+    <p><strong>Vehicle:</strong> ${receiptData.vehicle}</p>
+    <p><strong>Plate:</strong> ${receiptData.plate}</p>
+    <p><strong>Check-in:</strong> ${receiptData.checkIn}</p>
+    <p><strong>Check-out:</strong> ${receiptData.checkOut}</p>
+    <hr />
+    <p>Thank you for choosing Skyway Parking at DTW.</p>
+  `;
+
+  document.body.classList.add("print-view");
+  window.print();
+  window.addEventListener(
+    "afterprint",
+    () => document.body.classList.remove("print-view"),
+    { once: true }
+  );
+};
+
+const init = () => {
+  document.body.classList.add("loaded");
+  setSummary(getStoredReservation());
+  initNavHighlight();
+  initReveal();
+  initAccordion();
+
+  form.addEventListener("submit", handleSubmit);
+  document.getElementById("print-receipt").addEventListener("click", handlePrint);
+  document
+    .getElementById("open-reservation")
+    .addEventListener("click", openModal);
+
+  modal.addEventListener("click", (event) => {
+    if (event.target.matches("[data-close]")) {
+      closeModal();
+    }
+  });
+
+  document.addEventListener("keydown", (event) => {
+    if (event.key === "Escape") {
+      closeModal();
+    }
+  });
+};
+
+window.addEventListener("load", init);
 
EOF
)
Add script.js for site interactivity
