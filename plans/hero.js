class CreditCardHero {
  constructor(element, options = {}) {
    this.element = element;

    this.options = {
      headline: options.headline || "Your identity. One tap away.",
      subtext: options.subtext || "Connect and share effortlessly.",
      cta: options.cta || "Get your TCcard",

      primaryCardImage: options.primaryCardImage ||
        "/Assets/card-blue.webp",

      secondaryCardImage: options.secondaryCardImage ||
        "/Assets/card-orange.webp",

      onCtaClick: options.onCtaClick || (() => {})
    };

    this.mouse = { x: 0, y: 0 };
    this.current = { x: 0, y: 0 };

    this.raf = null;

    this.init();
  }

  init() {
    const el = this.element;

    // Configure content
    document.getElementById("heroHeadline").textContent =
      this.options.headline;

    document.getElementById("heroSubtext").textContent =
      this.options.subtext;

    const button = document.getElementById("heroCTA");

    button.textContent = this.options.cta;
    button.addEventListener("click", this.options.onCtaClick);

    // Configure card images
    document.getElementById("primaryCardImage").style.backgroundImage =
      `url("${this.options.primaryCardImage}")`;

    document.getElementById("secondaryCardImage").style.backgroundImage =
      `url("${this.options.secondaryCardImage}")`;

    // Motion preference
    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (this.reducedMotion) return;

    this.bindEvents();
  }

  bindEvents() {
    this.element.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;

      const rect = this.element.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normalizedX = Math.max(0, Math.min(1, x / rect.width));
      const normalizedY = Math.max(0, Math.min(1, y / rect.height));

      this.mouse.x = -16 + normalizedX * 26;
      this.mouse.y = 16 - normalizedY * 26;

      this.animate();
    });

    this.element.addEventListener("pointerleave", () => {
      this.mouse.x = 0;
      this.mouse.y = 0;

      this.animate();
    });
  }

  animate() {
    if (this.raf) return;

    const tick = () => {
      // Spring-like interpolation
      const stiffness = 0.12;

      this.current.x +=
        (this.mouse.x - this.current.x) * stiffness;

      this.current.y +=
        (this.mouse.y - this.current.y) * stiffness;

      this.element.style.transform = `
        rotateX(${this.current.y}deg)
        rotateY(${this.current.x}deg)
      `;

      const distance =
        Math.abs(this.mouse.x - this.current.x) +
        Math.abs(this.mouse.y - this.current.y);

      if (distance > 0.1) {
        this.raf = requestAnimationFrame(tick);
      } else {
        this.raf = null;
      }
    };

    this.raf = requestAnimationFrame(tick);
  }
}